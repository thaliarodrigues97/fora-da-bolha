-- Salve estas consultas no SQL Editor. Escolha uma delas e execute.

-- Totais: criadas, em andamento, encerradas, motivos e mensagens.
select * from public.admin_room_summary;

-- Evolução por dia de criação, usando o fuso de São Paulo.
select * from public.admin_room_daily order by dia desc;

-- Últimas 100 salas, sem conteúdo de mensagens nem apelidos.
select * from public.admin_room_overview order by criada_em desc limit 100;

-- Salas ainda em andamento.
select * from public.admin_room_overview
where situacao='em_andamento' order by criada_em;

-- Salas encerradas.
select * from public.admin_room_overview
where situacao='encerrada' order by criada_em desc limit 100;
