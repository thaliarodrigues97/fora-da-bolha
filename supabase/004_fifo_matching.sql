-- Fila por ordem de chegada em ambos os lados, com pareamento serializado.
-- Execute no SQL Editor do projeto existente. Não altera acesso às tabelas.
begin;
create or replace function public.join_queue(p_nickname text,p_side text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare me uuid:=auth.uid(); partner uuid; first_user uuid; active_room uuid; room_count integer;
begin
 if me is null then raise exception 'Acesso não autenticado'; end if;
 if char_length(trim(p_nickname)) not between 2 and 24 or p_side not in ('left','right') or p_side is null or p_nickname is null then raise exception 'Dados inválidos'; end if;
 -- Serializa operações de pareamento: uma pessoa nunca é reservada duas vezes.
 perform pg_advisory_xact_lock(7142301);
 update public.rooms set status='closed' where status='active' and expires_at<=now();
 delete from public.waiting where heartbeat_at<now()-interval '25 seconds';
 select id into active_room from public.rooms where status='active' and me in(user_a,user_b) limit 1;
 if active_room is not null then return jsonb_build_object('room_id',active_room,'state','matched'); end if;
 insert into public.profiles(id,nickname,side) values(me,trim(p_nickname),p_side)
 on conflict(id) do update set nickname=excluded.nickname,side=excluded.side;
 insert into public.waiting(user_id,side) values(me,p_side)
 on conflict(user_id) do update set heartbeat_at=now(),side=excluded.side;
 -- Processa a fila inteira: quem consulta primeiro não ganha prioridade.
 select count(*) into room_count from public.rooms where status='active';
 while room_count<80 loop
  select a.user_id,b.user_id into first_user,partner
  from public.waiting a join public.waiting b on a.side='left' and b.side='right'
  where not exists(select 1 from public.blocks x where
   (x.blocker=a.user_id and x.blocked=b.user_id) or
   (x.blocker=b.user_id and x.blocked=a.user_id))
  and not exists(select 1 from public.rooms r where r.status='active'
   and (a.user_id in(r.user_a,r.user_b) or b.user_id in(r.user_a,r.user_b)))
  order by greatest(a.joined_at,b.joined_at),least(a.joined_at,b.joined_at),a.user_id,b.user_id
  limit 1;
  exit when first_user is null;
  insert into public.rooms(user_a,user_b) values(first_user,partner);
  delete from public.waiting where user_id in(first_user,partner);
  room_count:=room_count+1;
 end loop;
 select id into active_room from public.rooms where status='active' and me in(user_a,user_b) limit 1;
 if active_room is not null then return jsonb_build_object('room_id',active_room,'state','matched'); end if;
 return jsonb_build_object('state',case when room_count>=80 then 'capacity' else 'waiting' end);
end $$;
revoke all on function public.join_queue(text,text) from public,anon;
grant execute on function public.join_queue(text,text) to authenticated;
commit;
