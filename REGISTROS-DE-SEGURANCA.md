# Registros de IP e denúncias

Implantação: 18/10/2026.

Cada nova mensagem gera um registro em `private.message_network_logs`, vinculado ao ID da mensagem, sala, autor autenticado e sessão. O IP é capturado do cabeçalho `cf-connecting-ip` recebido na infraestrutura do Supabase. O corpo da requisição e `X-Forwarded-For` não são usados como fonte de IP. Se a origem não fornecer um endereço válido, o registro é marcado como `unavailable`, sem inventar um endereço.

O schema não está exposto pela API, não há políticas de leitura para participantes, e as funções privadas não são executáveis por `anon` ou `authenticated`. IP não foi adicionado a `public.messages`, a perfis ou ao Realtime. Os usuários continuam lendo apenas as mensagens de suas próprias salas.

A guarda padrão dos registros técnicos é de seis meses, com limpeza diária pelo job `fora-da-bolha-purge-network-logs`. Mensagens e denúncias não são apagadas por esse job. Uma denúncia não suspende automaticamente o prazo: quando houver necessidade de preservação para apuração, a administração deve definir uma data em `preserve_until` antes do vencimento.

Exemplo administrativo de preservação por sala, com prazo a definir conforme o caso:

```sql
update private.message_network_logs
set preserve_until = '2027-10-18T00:00:00Z'::timestamptz
where room_id = 'UUID_DA_SALA'::uuid;
```

Use as consultas `supabase/CONVERSAS-DENUNCIADAS.sql` e `supabase/TODAS-CONVERSAS.sql` no SQL Editor administrativo. As colunas de IP são nulas para mensagens antigas ou quando o registro já venceu. Não publique exportações dessas consultas.

IP observado não prova autoria civil. VPNs, proxies e redes compartilhadas podem aparecer no registro. Não há captura de porta lógica de origem. O serviço não recupera IPs históricos e não substitui investigação ou análise jurídica dos deveres de guarda e fornecimento de dados.

Validação local: captura IPv6, vínculo da sessão, ausência de preenchimento retroativo, rejeição de fontes alternativas de IP, acesso negado a participantes, prazo de seis meses, preservação e manutenção das mensagens após a limpeza.

Validação em produção: sala técnica isolada com duas identidades; duas mensagens capturaram IP e sessão; requisição com cabeçalho IP forjado recebeu HTTP 403; API privada recusou ambos os participantes; rotina de limpeza confirmada ativa. As sessões técnicas foram encerradas, sem usar a fila pública.
