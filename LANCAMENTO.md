# Lançamento: SEO e segurança

## Implementado

- Domínio canônico `https://foradabolha.com.br`, títulos e descrições por página, idioma pt-BR.
- Seis páginas públicas com conteúdo em HTML: início, funcionamento, temas, perguntas frequentes, convivência e privacidade.
- Open Graph, Twitter Card, imagem social PNG 1200×630, favicon PNG/SVG, ícones Apple e manifesto.
- Dados estruturados WebSite, WebPage e WebApplication, sem avaliações fictícias ou promessas de rich results.
- Sitemap XML apenas com páginas públicas; robots.txt. Builds de preview recebem noindex/nofollow e robots Disallow.
- SDK Supabase empacotado e servido localmente. Versões travadas em package-lock.json; auditoria npm sem vulnerabilidades conhecidas na data da verificação.
- CSP sem unsafe-inline/unsafe-eval, hashes para JSON-LD, frame-ancestors none, nosniff, HSTS, Referrer-Policy e Permissions-Policy.
- Mensagens e apelidos continuam exibidos como texto; regras RLS e limites no servidor preservados.
- Código do Turnstile preparado para enviar o token ao Supabase, quando configurado.

## Pendências externas

1. Concluir implantação Vercel, adicionar domínio e aplicar os registros DNS exatos apresentados no painel. Confirmar HTTPS.
2. Informar contato público do responsável. Não há identidade de controlador ou e-mail inventado no site.
3. Ativar proteção CAPTCHA no Supabase com a chave secreta Turnstile, cadastrar o domínio no widget e preencher apenas a chave pública em `dist/config.js`. Enquanto o campo estiver vazio, não há proteção CAPTCHA ativa. Somente colocar um widget no frontend não protege a API: o Supabase deve exigir a verificação.
4. Definir e implementar retenção/exclusão de mensagens e denúncias e uma rotina de revisão administrativa. O encerramento de 30 minutos não apaga mensagens. A página de privacidade descreve essa limitação.
5. Verificar Search Console e enviar o sitemap. Não há garantia de indexação nem de posição 1; acompanhe consultas reais, qualidade do conteúdo e referências orgânicas.

## Verificações

`npm ci`, `npm run build`, `npm run check`, `npm audit --audit-level=low`.

`npm run preview` serve em localhost com os headers de segurança da produção (sem upgrade-insecure-requests para o teste HTTP local). Valide a entrada no chat, as páginas informativas e os headers depois da publicação.

Não há teste de carga nem auditoria externa de invasão. A proteção atual não impede uma pessoa de criar outra identidade para contornar bloqueios. Configurar o domínio ou o SEO não resolve essa limitação.
