-- Execute uma vez no SQL Editor de um projeto Supabase novo.
-- Habilite Authentication > Providers > Anonymous Sign-ins.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null check(char_length(nickname) between 2 and 24),
 side text not null check(side in ('left','right'))
);
create table public.rooms (
 id uuid primary key default gen_random_uuid(),
 user_a uuid not null references public.profiles(id),
 user_b uuid not null references public.profiles(id),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '30 minutes',
 status text not null default 'active' check(status in ('active','closed')),
 check(user_a<>user_b)
);
create index rooms_a on public.rooms(user_a,status);
create index rooms_b on public.rooms(user_b,status);
create table public.waiting (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 side text not null check(side in ('left','right')),
 joined_at timestamptz not null default now(),
 heartbeat_at timestamptz not null default now()
);
create index waiting_order on public.waiting(joined_at);
create table public.messages (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.rooms(id) on delete cascade,
 sender_id uuid not null references public.profiles(id),
 body text not null check(char_length(body) between 1 and 1000),
 created_at timestamptz not null default clock_timestamp()
);
create index messages_room on public.messages(room_id,created_at);
create index messages_sender on public.messages(sender_id,created_at desc);
create table public.blocks (
 blocker uuid not null references public.profiles(id),
 blocked uuid not null references public.profiles(id),
 primary key(blocker,blocked)
);
create table public.reports (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.rooms(id),
 reporter uuid not null references public.profiles(id),
 reported uuid not null references public.profiles(id),
 reason text not null check(char_length(reason) between 1 and 100),
 details text not null default '' check(char_length(details)<=500),
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.waiting enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
create policy rooms_read on public.rooms for select to authenticated using(auth.uid() in (user_a,user_b));
create policy profiles_read on public.profiles for select to authenticated using(
 id=auth.uid() or exists(select 1 from public.rooms r where auth.uid() in (r.user_a,r.user_b) and profiles.id in (r.user_a,r.user_b) and r.status='active' and r.expires_at>now())
);
create policy messages_read on public.messages for select to authenticated using(
 exists(select 1 from public.rooms r where r.id=messages.room_id and auth.uid() in (r.user_a,r.user_b))
);
-- Nenhum cliente pode escrever diretamente nas tabelas.
revoke all on public.profiles,public.rooms,public.waiting,public.messages,public.blocks,public.reports from anon,authenticated;
grant select on public.profiles,public.rooms,public.messages to authenticated;

create function public.join_queue(p_nickname text,p_side text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare me uuid:=auth.uid(); partner uuid; active_room uuid;
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
 -- Limite conservador de 80 salas; pode ser ajustado após medir uso.
 if (select count(*) from public.rooms where status='active')>=80 then
  return jsonb_build_object('state','capacity');
 end if;
 select w.user_id into partner from public.waiting w
 where w.side<>p_side and w.user_id<>me
 and not exists(select 1 from public.blocks b where (b.blocker=me and b.blocked=w.user_id) or(b.blocked=me and b.blocker=w.user_id))
 and not exists(select 1 from public.rooms r where r.status='active' and w.user_id in(r.user_a,r.user_b))
 order by w.joined_at limit 1 for update skip locked;
 if partner is null then return jsonb_build_object('state','waiting'); end if;
 insert into public.rooms(user_a,user_b) values(me,partner) returning id into active_room;
 delete from public.waiting where user_id in(me,partner);
 return jsonb_build_object('room_id',active_room,'state','matched');
end $$;

create function public.leave_session() returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null then raise exception 'Acesso não autenticado'; end if;
 perform pg_advisory_xact_lock(7142301);
 delete from public.waiting where user_id=auth.uid();
 update public.rooms set status='closed' where status='active' and auth.uid() in(user_a,user_b);
end $$;

create function public.send_message(p_room uuid,p_body text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.rooms; m public.messages;
begin
 if auth.uid() is null then raise exception 'Acesso não autenticado'; end if;
 -- Serializa envios desta identidade e limita a 1 mensagem/segundo no servidor.
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select * into r from public.rooms where id=p_room for update;
 if not found then raise exception 'Sala indisponível'; end if;
 if auth.uid() not in(r.user_a,r.user_b) or r.status<>'active' or r.expires_at<=clock_timestamp() then raise exception 'Esta sala está encerrada ou indisponível'; end if;
 if p_body is null or char_length(trim(p_body)) not between 1 and 1000 then raise exception 'Mensagem inválida'; end if;
 if exists(select 1 from public.messages where sender_id=auth.uid() and created_at>clock_timestamp()-interval '1 second') then raise exception 'Aguarde um segundo entre mensagens'; end if;
 insert into public.messages(room_id,sender_id,body) values(p_room,auth.uid(),trim(p_body)) returning * into m;
 return to_jsonb(m);
end $$;

create function public.report_room(p_room uuid,p_reason text,p_details text default '') returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.rooms; other_user uuid;
begin
 if auth.uid() is null then raise exception 'Acesso não autenticado'; end if;
 select * into r from public.rooms where id=p_room for update;
 if not found then raise exception 'Sala indisponível'; end if;
 if auth.uid() not in(r.user_a,r.user_b) then raise exception 'Acesso negado'; end if;
 other_user:=case when r.user_a=auth.uid() then r.user_b else r.user_a end;
 insert into public.reports(room_id,reporter,reported,reason,details) values(p_room,auth.uid(),other_user,p_reason,coalesce(p_details,''));
 insert into public.blocks(blocker,blocked) values(auth.uid(),other_user) on conflict do nothing;
 update public.rooms set status='closed' where id=p_room;
end $$;
revoke all on function public.join_queue(text,text),public.leave_session(),public.send_message(uuid,text),public.report_room(uuid,text,text) from public,anon;
grant execute on function public.join_queue(text,text),public.leave_session(),public.send_message(uuid,text),public.report_room(uuid,text,text) to authenticated;
-- Habilita entrega de mensagens; polling recupera mensagens após reconexão.
alter publication supabase_realtime add table public.messages;
commit;
