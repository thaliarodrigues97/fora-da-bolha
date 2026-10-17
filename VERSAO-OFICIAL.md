# Versão oficial — 17/10/2026

- Removidos selo no cabeçalho, botões, mensagens e código de demonstração.
- Chat real mantido; configuração ausente produz erro explícito, sem simular pessoas.
- Fontes variáveis DM Sans e Manrope (subset latin, incluindo caracteres portugueses) servidas localmente, com licenças OFL e preload.
- CSS e aplicação compactados e publicados em URLs com hash. Cache imutável de um ano para esses recursos e fontes. SDK Supabase carregado apenas ao entrar.
- Seis páginas públicas, sitemap, robots, canonical, Open Graph, JSON-LD e headers de segurança verificados pelo check automatizado.
- Política pública atualizada: não há suporte individual; denúncia não promete acompanhamento em tempo real.
- DNS e HTTPS do domínio oficial responderam pela Vercel. Ajustados redirecionamentos 308 de www e do endereço provisório diretamente ao domínio sem www.

Validação: build, check, npm audit (zero vulnerabilidades conhecidas) e teste no navegador da entrada/cancelamento na fila com CSP ativa.

A API pública do PageSpeed respondeu 429 (cota excedida). Não foi obtida nota Lighthouse nem medição de Core Web Vitals. Não há promessa de posição 1 no Google; a verificação no Search Console continua necessária para acompanhar indexação e consultas.

Proteção CAPTCHA depende de configuração no Supabase/Turnstile e continua desativada enquanto a chave pública estiver vazia. A rotina de retenção de mensagens também não foi implementada nesta entrega. Estas limitações não foram ocultadas da política de privacidade.
