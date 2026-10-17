-- Apelidos preservados por sala. Executar no projeto existente, após 002.
begin;
alter table public.rooms add column if not exists nickname_a text;
alter table public.rooms add column if not exists nickname_b text;
alter table public.rooms add column if not exists nicknames_recorded_at timestamptz;
alter table public.rooms add column if not exists nicknames_source text;

-- Para salas antigas, só podemos recuperar o apelido atual do perfil.
-- Essa origem fica marcada; não afirmamos que era o apelido na criação.
update public.rooms r
set nickname_a=coalesce(r.nickname_a,a.nickname),
 nickname_b=coalesce(r.nickname_b,b.nickname),
 nicknames_recorded_at=coalesce(r.nicknames_recorded_at,now()),
 nicknames_source=coalesce(r.nicknames_source,'current_profile_backfill')
from public.profiles a,public.profiles b
where a.id=r.user_a and b.id=r.user_b
and (r.nickname_a is null or r.nickname_b is null);

create or replace function public.capture_room_nicknames()
returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
 select p.nickname into new.nickname_a from public.profiles p where p.id=new.user_a;
 select p.nickname into new.nickname_b from public.profiles p where p.id=new.user_b;
 if new.nickname_a is null or new.nickname_b is null then
  raise exception 'Participantes não encontrados';
 end if;
 new.nicknames_recorded_at:=clock_timestamp();
 new.nicknames_source:='at_creation';
 return new;
end $$;
revoke all on function public.capture_room_nicknames() from public,anon,authenticated;
create or replace trigger capture_room_nicknames before insert on public.rooms
for each row execute function public.capture_room_nicknames();

-- As colunas existentes mantêm a ordem para preservar as visões de resumo.
create or replace view public.admin_room_overview
with (security_invoker=true) as
select r.id as sala_id,
 r.created_at as criada_em,
 r.expires_at as limite_em,
 case when r.status='active' and r.expires_at>now()
  then 'em_andamento' else 'encerrada' end as situacao,
 case when r.ended_at is not null then r.ended_at
  when r.status='active' and r.expires_at<=now() then r.expires_at
  else null end as encerrada_em,
 case when r.ended_reason is not null then r.ended_reason
  when r.status='active' and r.expires_at<=now() then 'expired'
  else null end as motivo,
 (select count(*) from public.messages m where m.room_id=r.id) as mensagens,
 r.nickname_a as participante_a,
 r.nickname_b as participante_b,
 r.nicknames_recorded_at as apelidos_registrados_em,
 r.nicknames_source as origem_dos_apelidos
from public.rooms r;
revoke all on public.admin_room_overview from public,anon,authenticated;
comment on column public.rooms.nickname_a is 'Apelido do participante A preservado na sala. Ver nicknames_source para a origem.';
comment on column public.rooms.nickname_b is 'Apelido do participante B preservado na sala. Ver nicknames_source para a origem.';
commit;

select sala_id,participante_a,participante_b,situacao,criada_em,encerrada_em,
 motivo,mensagens,origem_dos_apelidos
from public.admin_room_overview order by criada_em desc limit 100;
