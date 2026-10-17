# Fora da Bolha

Primeira versão de um chat de texto entre pessoas de perspectivas políticas diferentes. Interface responsiva em português, fila, salas de 30 minutos, encerramento, denúncia e bloqueio por identidade.

## Visualizar

Sirva `dist/` com qualquer servidor estático (Node 22: `npx serve dist`). Sem credenciais, o site usa uma demonstração explicitamente identificada, com duas mensagens de exemplo e envio local. Não simula participantes reais, estatísticas ou disponibilidade.

## Conectar o Supabase

1. Crie um projeto Supabase novo.
2. Execute `supabase/schema.sql` no SQL Editor uma única vez.
3. Habilite **Authentication > Providers > Anonymous Sign-ins**.
4. Em `dist/config.js`, preencha `supabaseUrl` e `supabaseAnonKey` com a URL do projeto e a chave pública **publishable/anon**. Nunca coloque uma chave `service_role` no navegador.
5. Publique a pasta `dist` na Vercel (Framework: Other, Output Directory: dist, sem build) ou em outra hospedagem estática.
6. Teste com dois navegadores/perfis separados (um de cada lado). Abas no mesmo perfil compartilham a identidade de autenticação.

Com configuração preenchida, a demonstração é desligada e o fluxo usa o backend real. Erros são exibidos; não há fallback silencioso para usuários simulados.

## Arquitetura

- Pareamento FIFO dentro do lado oposto, com bloqueio transacional global no PostgreSQL.
- Heartbeat de fila a cada 4 s; registros sem heartbeat expiram em 25 s. Quem fecha a aba na fila sai por expiração.
- Ao lotar as 80 salas, visitantes aguardam via requisições, sem canal Realtime permanente.
- Cada sala abre um canal Realtime de mensagens; sincronização a cada 3 s recupera mensagens e detecta encerramento. Este polling favorece simplicidade no MVP e deve ser medido/otimizado com uso real.
- Horário de expiração persistido no servidor. Envio é recusado pelo PostgreSQL após 30 minutos, mesmo se o relógio local estiver errado.
- RLS restringe leitura aos participantes; tabelas só recebem escrita pelas funções autorizadas.
- Limite de 1 mensagem por segundo por identidade e 1.000 caracteres, imposto no servidor.
- Denúncia registra motivo, bloqueia pareamentos futuros entre as identidades e encerra a sala. Revisão é manual pelo painel Supabase; não há moderação automática.

## Limitações e abertura pública

O projeto Supabase foi criado e configurado pelo usuário. A integração foi validada com sessões anônimas e chamadas reais ao banco; veja `VALIDACAO-INTEGRACAO.md`. A lista em `supabase/VALIDACAO.md` contém também os cenários que ainda precisam de validação antes da abertura pública. Não execute novamente o schema no projeto já configurado.

Não há Turnstile/CAPTCHA integrado, moderação administrativa própria, banimento persistente entre novas identidades, rotina automática de retenção/exclusão nem controle global de entrada por IP. Autenticação anônima permite contornar bloqueio criando outra identidade. Habilite CAPTCHA na autenticação anônima e proteção de tráfego antes de divulgação pública; a configuração CAPTCHA exige adaptar o formulário para enviar o token correspondente.

Se alguém fechar a aba dentro de uma sala, a sala permanece reservada até o prazo de 30 minutos ou até o outro participante encerrar. Não existe presença/timeout de inatividade nesta versão. O timer visual depende do relógio do dispositivo; o limite de envio depende do servidor. Mensagens persistem até uma rotina de retenção ser definida. Dados e denúncias devem ter política de tratamento e operação definidas antes da abertura pública.

O limite de 80 salas não garante enquadramento na franquia: mensagens, tráfego, autenticação e consultas também consomem recursos. Não multiplique contas para contornar limites.

## Verificação local

`node --check dist/app.js` e `node --check dist/config.js` verificam sintaxe. A configuração atual conecta ao Supabase real. Para uma demonstração isolada localmente, esvazie os dois campos de configuração em uma cópia do projeto.
