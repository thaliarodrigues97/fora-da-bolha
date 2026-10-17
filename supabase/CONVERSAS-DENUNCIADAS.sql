-- Executar somente no SQL Editor administrativo do Supabase.
-- Consulta somente leitura: não altera armazenamento nem permissões.
-- Uma linha por mensagem de cada sala denunciada.
-- Se houver mais de uma denúncia, mostra a mais recente e conta todas.
with ultima_denuncia as (
 select distinct on (d.room_id)
  d.room_id,d.created_at,d.reporter,d.reported,d.reason,d.details,
  count(*) over(partition by d.room_id) as total_denuncias
 from public.reports d
 order by d.room_id,d.created_at desc,d.id desc
)
select
 r.id as sala_id,
 m.created_at as mensagem_em,
 case when m.sender_id=r.user_a then r.nickname_a
      when m.sender_id=r.user_b then r.nickname_b end as autor,
 m.body as mensagem,
 d.created_at as denunciada_em,
 d.total_denuncias,
 r.nickname_a as participante_a,
 r.nickname_b as participante_b,
 case when d.reporter=r.user_a then r.nickname_a
      when d.reporter=r.user_b then r.nickname_b end as denunciado_por,
 case when d.reported=r.user_a then r.nickname_a
      when d.reported=r.user_b then r.nickname_b end as participante_denunciado,
 d.reason as motivo_denuncia,
 d.details as detalhes_denuncia,
 m.id as mensagem_id,
 m.sender_id as autor_id,
 r.nicknames_source as origem_dos_apelidos
from ultima_denuncia d
join public.rooms r on r.id=d.room_id
left join public.messages m on m.room_id=r.id
-- Para consultar uma sala específica, descomente e substitua o UUID:
-- where r.id='00000000-0000-0000-0000-000000000000'::uuid
order by d.created_at desc,r.id,m.created_at,m.id;
