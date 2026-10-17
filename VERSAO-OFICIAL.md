# Versão oficial — 17/10/2026

- Removidos selo no cabeçalho, botões, mensagens e código de demonstração.
- Chat real mantido; configuração ausente produz erro explícito, sem simular pessoas.
- Fontes variáveis DM Sans e Manrope (subset latin, incluindo caracteres portugueses) servidas localmente, com licenças OFL e preload.
- CSS e aplicação compactados e publicados em URLs com hash. Cache imutável de um ano para esses recursos e fontes. SDK Supabase carregado apenas ao entrar.
- Seis páginas públicas, sitemap, robots, canonical, Open Graph, JSON-LD e headers de segurança verificados pelo check automatizado.
- Política pública atualizada: não há suporte individual; denúncia não promete acompanhamento em tempo real.
- DNS e HTTPS do domínio oficial responderam pela Vercel. Ajustados redirecionamentos 308 de www e do endereço provisório diretamente ao domínio sem www.

Validação: build, check, npm audit (zero vulnerabilidades conhecidas) e teste no navegador da entrada/cancelamento na fila com CSP ativa.

A API pública do PageSpeed respondeu 429 (cota excedida), mas a auditoria pela interface do PageSpeed foi concluída em 17/10/2026 às 11h45 BRT. No teste de laboratório, celular e computador obtiveram 100 em desempenho, acessibilidade, boas práticas e SEO. Celular: FCP 0,9 s, LCP 1,2 s, TBT 0 ms, CLS 0. Computador: FCP 0,3 s, LCP 0,3 s, TBT 0 ms, CLS 0. Não há dados de campo suficientes no relatório; esses números não são garantia de experiência real nem de posição 1 nas buscas.

Relatório: https://pagespeed.web.dev/analysis/https-foradabolha-com-br/kadlaixzxx?form_factor=mobile

Proteção CAPTCHA depende de configuração no Supabase/Turnstile e continua desativada enquanto a chave pública estiver vazia. A rotina de retenção de mensagens também não foi implementada nesta entrega. Estas limitações não foram ocultadas da política de privacidade.
