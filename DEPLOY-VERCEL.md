# Publicar na Vercel

O frontend é estático e o backend continua no Supabase já configurado.

1. Na Vercel, escolha **Add New → Project** e importe `thaliarodrigues97/fora-da-bolha`.
2. Mantenha **Root Directory** na raiz do repositório.
3. O arquivo `vercel.json` define **Framework: Other**, saída `dist` e build `npm run build`. O build prepara as páginas, os metadados, a biblioteca local do Supabase e as imagens da marca.
4. Não é preciso adicionar variáveis de ambiente nesta versão. A URL e a chave pública publishable do Supabase estão em `dist/config.js`. Nunca adicione `service_role` ao frontend.
5. Clique em **Deploy**. Após a conexão Git, novos pushes na branch `main` acionam novos deployments.

Endereço oficial: `https://foradabolha.com.br`. Em Settings → Domains, adicione esse domínio e `www.foradabolha.com.br`, seguindo os registros DNS exibidos pela Vercel. O `www` redireciona para o domínio sem `www`. Não use valores DNS genéricos: copie os valores indicados para o projeto.

O Google Search Console precisa ser verificado pelo proprietário do domínio. Depois de DNS e HTTPS funcionando, envie `https://foradabolha.com.br/sitemap.xml` e inspecione a página inicial. Isso solicita descoberta e indexação, sem garantir posição nas buscas.

Para testar uma conversa, use dois perfis de navegador diferentes, escolhendo lados opostos. Duas abas no mesmo perfil compartilham a identidade anônima.

Não execute novamente `supabase/schema.sql` no projeto existente. O banco já foi preparado e a integração está validada em `VALIDACAO-INTEGRACAO.md`.
