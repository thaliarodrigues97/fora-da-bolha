# Publicar na Vercel

O frontend é estático e o backend continua no Supabase já configurado.

1. Na Vercel, escolha **Add New → Project** e importe `thaliarodrigues97/fora-da-bolha`.
2. Mantenha **Root Directory** na raiz do repositório.
3. O arquivo `vercel.json` define **Framework: Other**, saída `dist` e nenhum comando de build.
4. Não é preciso adicionar variáveis de ambiente nesta versão. A URL e a chave pública publishable do Supabase estão em `dist/config.js`. Nunca adicione `service_role` ao frontend.
5. Clique em **Deploy**. Após a conexão Git, novos pushes na branch `main` acionam novos deployments.

Para testar uma conversa, use dois perfis de navegador diferentes, escolhendo lados opostos. Duas abas no mesmo perfil compartilham a identidade anônima.

Não execute novamente `supabase/schema.sql` no projeto existente. O banco já foi preparado e a integração está validada em `VALIDACAO-INTEGRACAO.md`.
