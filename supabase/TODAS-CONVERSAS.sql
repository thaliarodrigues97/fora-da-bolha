-- Consulta privada, somente leitura, para o SQL Editor administrativo.
-- Uma linha por mensagem. Salas sem mensagens também aparecem.
-- Os nomes são apelidos declarados, não identidades civis verificadas.
select
 r.id as sala_id,
 r.nickname_a as participante_a,
 r.nickname_b as participante_b,
 case when r.status='active' and r.expires_at>now()
      then 'em_andamento' else 'encerrada' end as situacao,
 r.created_at as sala_criada_em,
 case when r.ended_at is not null then r.ended_at
      when r.status='active' and r.expires_at<=now() then r.expires_at
      else null end as sala_encerrada_em,
 m.created_at as mensagem_em,
 case when m.sender_id=r.user_a then r.nickname_a
      when m.sender_id=r.user_b then r.nickname_b end as autor,
 m.body as mensagem,
 m.id as mensagem_id,
 m.sender_id as autor_id,
 (select count(*) from public.reports d where d.room_id=r.id) as total_denuncias,
 n.ip_address as ip_do_autor,
 n.received_at as ip_registrado_em,
 n.ip_source as origem_do_ip,
 n.session_id as sessao_autenticada,
 n.preserve_until as preservar_ip_ate,
 r.nicknames_source as origem_dos_apelidos
from public.rooms r
left join public.messages m on m.room_id=r.id
left join private.message_network_logs n on n.message_id=m.id
-- Para consultar apenas uma sala, descomente e substitua o UUID:
-- where r.id='00000000-0000-0000-0000-000000000000'::uuid
order by r.created_at desc,r.id,m.created_at,m.id;
