-- Fora da Bolha: acompanhamento administrativo de salas.
-- Execute no SQL Editor do projeto existente. Pode ser executado novamente.
-- Não libera acesso pelo navegador nem publica mensagens ou apelidos.
begin;

alter table public.rooms add column if not exists ended_at timestamptz;
alter table public.rooms add column if not exists ended_reason text;

-- Salas encerradas antes desta migração não têm horário de término conhecido.
-- Não inventamos um horário retroativo.
update public.rooms set ended_reason='unknown'
where status='closed' and ended_reason is null;

create or replace function public.record_room_ending()
returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
 if new.status='closed' and old.status is distinct from 'closed' then
  new.ended_at:=least(coalesce(new.ended_at,clock_timestamp()),new.expires_at);
  new.ended_reason:=case
   when new.expires_at<=clock_timestamp() then 'expired'
   when exists(select 1 from public.reports r where r.room_id=new.id) then 'report'
   else 'manual'
  end;
 end if;
 return new;
end $$;
revoke all on function public.record_room_ending() from public,anon,authenticated;
create or replace trigger record_room_ending before update of status on public.rooms
for each row execute function public.record_room_ending();

-- Esta visão considera o prazo real. Uma sala expirada está encerrada mesmo
-- se ninguém voltar ao site para atualizar o campo status da tabela original.
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
 (select count(*) from public.messages m where m.room_id=r.id) as mensagens
from public.rooms r;

create or replace view public.admin_room_summary
with (security_invoker=true) as
select count(*) as salas_criadas,
 count(*) filter(where situacao='em_andamento') as em_andamento,
 count(*) filter(where situacao='encerrada') as encerradas,
 count(*) filter(where motivo='expired') as encerradas_por_tempo,
 count(*) filter(where motivo='manual') as encerradas_pelos_participantes,
 count(*) filter(where motivo='report') as encerradas_com_denuncia,
 count(*) filter(where motivo='unknown') as encerradas_antigas_sem_motivo,
 count(*) filter(where (criada_em at time zone 'America/Sao_Paulo')::date=
  (now() at time zone 'America/Sao_Paulo')::date) as criadas_hoje,
 coalesce(sum(mensagens),0) as mensagens_enviadas
from public.admin_room_overview;

create or replace view public.admin_room_daily
with (security_invoker=true) as
select (criada_em at time zone 'America/Sao_Paulo')::date as dia,
 count(*) as salas_criadas,
 count(*) filter(where situacao='em_andamento') as em_andamento,
 count(*) filter(where situacao='encerrada') as encerradas,
 coalesce(sum(mensagens),0) as mensagens_enviadas
from public.admin_room_overview
group by (criada_em at time zone 'America/Sao_Paulo')::date;

revoke all on public.admin_room_overview,public.admin_room_summary,public.admin_room_daily
from public,anon,authenticated;
comment on view public.admin_room_summary is 'Resumo privado de salas; consultar pelo SQL Editor como administrador.';
comment on view public.admin_room_daily is 'Agrupamento pela data de criação em America/Sao_Paulo. Encerradas são as salas desse grupo já finalizadas.';
commit;

-- Resultado após executar: total acumulado e salas de hoje.
select * from public.admin_room_summary;
