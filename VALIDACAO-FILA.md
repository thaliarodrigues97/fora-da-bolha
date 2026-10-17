# Validação da fila

A migração `supabase/004_fifo_matching.sql` foi aplicada no Supabase em 17/10/2026. O pareamento processa os pares disponíveis por ordem de chegada, respeita bloqueios e o limite de 80 salas. A consulta de uma pessoa mais nova não permite ultrapassar quem chegou antes.

O botão Encontrar outra pessoa encerra a sessão anterior antes de iniciar uma nova busca. O outro participante vê o encerramento na sincronização da sala e pode iniciar sua própria busca. Ninguém entra automaticamente em uma nova conversa sem clicar.

Testes locais com PostgreSQL via PGlite passaram para:

- Retorno à fila dos dois lados e escolha do oponente mais antigo.
- Retorno da mesma sala ao consultar novamente um pareamento ativo.
- Limite de salas atingido, liberação de uma vaga e prioridade das pessoas mais antigas mesmo quando alguém mais novo consulta primeiro.
- Liberação da segunda vaga, pareamento das próximas pessoas e remoção dos participantes pareados da fila.
- Migração executada duas vezes e acesso negado à função para clientes sem autenticação.

Build e verificação de canonical, sitemap, recursos locais e CSP também passaram.

Este ajuste trata o encerramento pelo site. Fechar uma aba ou perder a conexão não envia uma confirmação confiável de saída ao servidor e não equivale a clicar em Encerrar conversa.
