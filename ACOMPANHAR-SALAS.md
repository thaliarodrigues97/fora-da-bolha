# Acompanhar as salas

As salas já são registradas permanentemente em `public.rooms`, com identificador, participantes, criação, limite e status. Não é necessário começar a guardar do zero.

## Ativar os relatórios

A migração `supabase/002_room_reporting.sql` já foi aplicada no projeto existente em 17/10/2026. Não é necessário executar nada para começar a consultar. Não execute novamente o `schema.sql` inicial.

Esse ajuste acrescenta horário e motivo de encerramento para novos encerramentos, além de três visões administrativas. Pode ser executado novamente sem recriar as tabelas nem apagar salas.

As consultas ficam em `supabase/CONSULTAR-SALAS.sql`:

- `admin_room_summary`: totais acumulados, criadas hoje, em andamento, encerradas e motivos.
- `admin_room_daily`: evolução por dia de criação no fuso de São Paulo.
- `admin_room_overview`: cada sala, criação, limite, encerramento, motivo e quantidade de mensagens.

As visões não expõem texto das mensagens, apelidos nem posicionamentos políticos. As roles `anon` e `authenticated` não recebem acesso; consulte pelo SQL Editor administrativo. Não coloque a chave `service_role` no frontend para construir um painel.

## Como contar encerramentos

A sala é considerada encerrada quando alguém a encerra, quando é denunciada ou quando o prazo termina. O relatório calcula a expiração pelo horário do banco, mesmo se ninguém tiver voltado ao site para atualizar o status bruto.

Salas que já estavam encerradas antes da migração aparecem como antigas, com motivo `unknown` e horário de término não conhecido. Não há como recuperar retroativamente esse horário com precisão. Os motivos futuros são `manual`, `report` e `expired`.

Na visão diária, as salas são agrupadas pelo dia em que foram criadas; a coluna de encerradas informa quantas salas daquele grupo já terminaram, não quantas encerraram naquele dia. Os números incluem as salas de validação que criamos no início.

Consulta privada salva e favoritada no Supabase: **Resumo de salas — Fora da Bolha**. Abra-a no SQL Editor e clique em Run para atualizar.

https://supabase.com/dashboard/project/byydyqkwcakkcuvynzna/sql/3f4b72a2-847c-4ec8-8454-83467b1005be

Verificações: migração testada em PostgreSQL local, aplicada no projeto real e resumo consultado com sucesso. Acesso HTTP com a chave pública às três visões foi recusado, conforme esperado. A chave pública do site não permite alterar o banco nem consultar todas as salas.
