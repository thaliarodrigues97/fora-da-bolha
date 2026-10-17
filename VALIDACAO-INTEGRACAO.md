# Fora da Bolha — integração Supabase

Testes realizados em 17/10/2026 no projeto configurado, por chamadas HTTP com a chave pública e identidades anônimas de teste:

- Criação de três sessões anônimas: aprovada.
- Primeiro participante aguarda na fila: aprovado.
- Participantes de lados opostos recebem a mesma sala: aprovado.
- Envio por RPC e leitura pelo outro participante: aprovado.
- Terceira identidade não lê sala nem mensagens e não envia na sala: aprovado.
- Escrita direta na tabela de mensagens: recusada, conforme esperado.
- Encerramento da sala e recusa de novo envio: aprovado.

Uma segunda validação abriu a interface no navegador, criou uma sessão e pareou com outro cliente conectado ao Supabase. O navegador recebeu uma mensagem do outro cliente e enviou uma resposta, confirmada pelo cliente receptor. O timer apareceu com o prazo da sala real.

Os testes deixaram cinco identidades anônimas de validação, perfis participantes, duas salas encerradas e três mensagens identificadas como testes no projeto. As filas foram liberadas ao final. Não foram criadas contas permanentes nem armazenados tokens no código.

Não foram testados nesta rodada: 80 salas simultâneas, expiração real de 30 minutos, CAPTCHA, moderação, carga ou bloqueio persistente entre diferentes identidades. Consulte também `supabase/VALIDACAO.md` e as limitações operacionais do README.

A chave publishable é intencionalmente pública no cliente. O acesso é controlado pela autenticação e pelas regras RLS do banco. A hospedagem Sites permanece privada; conectar o Supabase não torna o site público.
