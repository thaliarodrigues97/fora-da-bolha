import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {build} from 'esbuild';
import sharp from 'sharp';
import {topics} from '../dist/topics.js';

const site=JSON.parse(await fs.readFile('site.json','utf8'));
const origin=new URL(site.url).origin;
const preview=Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production');
const robots=preview?'noindex, nofollow':'index, follow, max-image-preview:large';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hashes=new Set();
await fs.mkdir('dist/fonts',{recursive:true});
await fs.mkdir('dist/assets',{recursive:true});
const fontDefinitions=[];
const fontPreloads=[];
for(const [pkg,family,weights] of [['dm-sans','DM Sans','100 1000'],['manrope','Manrope','200 800']]){
 const bytes=await fs.readFile(`node_modules/@fontsource-variable/${pkg}/files/${pkg}-latin-wght-normal.woff2`);
 const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12);
 const file=`${pkg}-${hash}.woff2`;
 await fs.writeFile('dist/fonts/'+file,bytes);
 await fs.copyFile(`node_modules/@fontsource-variable/${pkg}/LICENSE`,`dist/fonts/OFL-${pkg}.txt`);
 fontDefinitions.push(`@font-face{font-family:'${family}';font-style:normal;font-weight:${weights};font-display:swap;src:url('/fonts/${file}') format('woff2')}`);
 fontPreloads.push(`<link rel="preload" href="/fonts/${file}" as="font" type="font/woff2" crossorigin>`);
}
const fontLink=fontPreloads.join('');
const analyticsCode=`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-4SX1VY314W');
`;
const analyticsTag=`<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4SX1VY314W"></script>
<script>${analyticsCode}</script>`;
hashes.add("'sha256-"+crypto.createHash('sha256').update(analyticsCode).digest('base64')+"'");
const appBuild=await build({entryPoints:['dist/app.js'],bundle:true,format:'esm',platform:'browser',target:'es2022',external:['/vendor/*'],minify:true,legalComments:'eof',write:false});
const cssBuild=await build({stdin:{contents:fontDefinitions.join('')+await fs.readFile('dist/design.css','utf8'),loader:'css'},minify:true,write:false});
const assets={};
for(const [name,bytes,ext] of [['app',appBuild.outputFiles[0].contents,'js'],['style',cssBuild.outputFiles[0].contents,'css']]){
 const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12);
 const file=`${name}-${hash}.${ext}`;
 await fs.writeFile('dist/assets/'+file,bytes);
 assets[name]='/assets/'+file;
}
function productionAssets(html){return html.replace(/href="(?:\/?design\.css|\/assets\/style-[^"]+\.css)"/g,`href="${assets.style}"`).replace(/<script type="module" src="[^"]+"><\/script>/g,`<script type="module" src="${assets.app}"></script>`).replace(/<link rel="preconnect"[^>]*>/g,'')}
function metadata(title,description,pathname='/',type='WebPage'){
 const url=new URL(pathname,origin).href;
 const data=JSON.stringify({'@context':'https://schema.org','@graph':[
  {'@type':'WebSite','@id':origin+'/#website',name:site.name,url:origin+'/',inLanguage:'pt-BR'},
  {'@type':type,'@id':url+'#page',url,name:title,description,inLanguage:'pt-BR',isPartOf:{'@id':origin+'/#website'}},
  ...(pathname==='/'?[{'@type':'WebApplication',name:site.name,url:origin+'/',applicationCategory:'SocialNetworkingApplication',operatingSystem:'Web',inLanguage:'pt-BR',isAccessibleForFree:true,description}]:[])
 ]}).replaceAll('<','\\u003c');
 hashes.add("'sha256-"+crypto.createHash('sha256').update(data).digest('base64')+"'");
 return `<title>${escape(title)}</title>\n<meta name="description" content="${escape(description)}">\n<meta name="robots" content="${robots}">\n<link rel="canonical" href="${url}">\n<meta property="og:type" content="website">\n<meta property="og:locale" content="pt_BR">\n<meta property="og:site_name" content="${escape(site.name)}">\n<meta property="og:title" content="${escape(title)}">\n<meta property="og:description" content="${escape(description)}">\n<meta property="og:url" content="${url}">\n<meta property="og:image" content="${origin}/social-card.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="Fora da Bolha. Sua opinião você já conhece. Converse com outra.">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${escape(title)}">\n<meta name="twitter:description" content="${escape(description)}">\n<meta name="twitter:image" content="${origin}/social-card.png">\n<link rel="icon" type="image/svg+xml" href="/brand-mark.svg">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<script type="application/ld+json">${data}</script>`;
}

await fs.mkdir('dist/vendor',{recursive:true});
await build({stdin:{contents:"export {createClient} from '@supabase/supabase-js';",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof',outfile:'dist/vendor/supabase.js'});
const mark=await fs.readFile('dist/brand-mark.svg');
for(const [file,size] of [['favicon-32.png',32],['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]])await sharp(mark).resize(size,size).png().toFile('dist/'+file);
const social=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><radialGradient id="glow"><stop stop-color="#303b86"/><stop offset="1" stop-color="#0b0c11"/></radialGradient></defs><rect width="1200" height="630" fill="#0b0c11"/><circle cx="1060" cy="160" r="430" fill="url(#glow)"/><rect x="66" y="67" width="5" height="24" rx="2" fill="#8294ff"/><text x="90" y="87" font-family="sans-serif" font-size="20" fill="#aab6ff" letter-spacing="4">MENOS BOLHA. MAIS DIÁLOGO.</text><text x="65" y="235" font-family="sans-serif" font-weight="700" font-size="85" fill="#f4f2ed">fora da bolha</text><text x="67" y="337" font-family="sans-serif" font-size="43" fill="#f4f2ed">Sua opinião você já conhece.</text><text x="67" y="398" font-family="sans-serif" font-size="43" fill="#9aa9ff">Converse com outra.</text><path d="M964 238h128m-33-31 33 31-33 31M1092 347H964m33-31-33 31 33 31" fill="none" stroke="#9aa9ff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><line x1="67" y1="483" x2="1132" y2="483" stroke="#33384f"/><text x="67" y="540" font-family="sans-serif" font-size="22" fill="#a6aabc">Chat político por texto · Encontros de até 30 minutos · 18+</text><text x="67" y="581" font-family="sans-serif" font-size="18" fill="#777e99">foradabolha.com.br</text></svg>`;
await sharp(Buffer.from(social)).png().toFile('dist/social-card.png');
await fs.writeFile('dist/site.webmanifest',JSON.stringify({name:site.name,short_name:site.name,lang:'pt-BR',start_url:'/',scope:'/',display:'browser',background_color:'#0b0c11',theme_color:'#526bff',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png'}]},null,2));

const nav=`<a class="brand" href="/" aria-label="Fora da Bolha, início"><img class="brand-icon" src="/brand-mark.svg" width="42" height="42" alt="">fora<span class="brand-light">da</span>bolha</a>`;
const links=`<a href="/como-funciona">Como funciona</a><a href="/temas">Temas para conversar</a><a href="/perguntas-frequentes">Perguntas frequentes</a><a href="/convivencia">Convivência</a><a href="/privacidade">Privacidade</a>`;
const faq=[
 ['O que é o Fora da Bolha?','O Fora da Bolha é um site de conversa sobre política, com chat gratuito por texto entre pessoas de perspectivas diferentes. Quem se identifica com a esquerda é conectado a alguém que se identifica com a direita, quando há disponibilidade.'],
 ['O Fora da Bolha é um Omegle de política?','A comparação ajuda a entender a proposta: encontrar outra pessoa para conversar por texto. No Fora da Bolha, o encontro é entre quem se identifica com a esquerda e quem se identifica com a direita, em salas de até 30 minutos. É um projeto independente, sem vínculo com o Omegle.'],
 ['Como conversar sobre política sem transformar o diálogo em briga?','Comece por uma pergunta aberta, escute a resposta e discuta uma ideia por vez. Peça exemplos e explique seus critérios, sem atacar a pessoa. Se houver ofensas ou ameaças, encerre a conversa e use a denúncia.'],
 ['Preciso criar uma conta ou informar meu nome real?','Você entra com um apelido e escolhe seu posicionamento. O serviço cria uma identificação anônima no navegador para permitir o pareamento, as mensagens e os bloqueios. Isso não significa anonimato absoluto.'],
 ['Quanto tempo dura uma conversa?','Cada sala tem um prazo de até 30 minutos, contado desde o pareamento. Você pode encerrar antes e procurar outra pessoa. Atualizar a página não renova o prazo no servidor.'],
 ['O que acontece se não houver ninguém do outro lado?','Você aguarda na fila até haver alguém compatível ou uma vaga de sala. A disponibilidade depende das pessoas conectadas. Você pode cancelar a busca.'],
 ['As conversas são públicas?','Não. As regras do banco restringem o acesso das contas de participantes à própria sala. As mensagens são processadas pelo serviço e não têm criptografia de ponta a ponta. Não compartilhe dados sensíveis.'],
 ['O serviço é gratuito?','O acesso ao chat é gratuito. Não é necessário contratar um plano para entrar em uma conversa.'],
 ['Posso escolher o assunto?','Sim. Há 60 sugestões em 12 temas, incluindo sexualidade, corrupção, religião, desigualdade, educação e democracia. As sugestões não são enviadas automaticamente ao chat.'],
 ['Como denunciar uma conversa?','Durante a conversa, use a opção de denúncia. Ela registra o motivo, bloqueia novos pareamentos entre as mesmas identidades e encerra a sala. Esse bloqueio não identifica a pessoa fora da identidade usada no navegador.'],
 ['Há moderação em tempo real?','Não há garantia de acompanhamento humano em tempo real nem moderação automática de cada mensagem. Se algo incomodar você, encerre a conversa e utilize a denúncia.'],
 ['Quem pode participar?','O serviço é destinado a pessoas com 18 anos ou mais. O respeito às pessoas é obrigatório, mesmo quando existe discordância sobre ideias.']
];
const pageData=[
 ['/como-funciona','Como conversar sobre política online | Fora da Bolha','Veja como entrar no chat gratuito do Fora da Bolha, encontrar alguém de outra perspectiva e conversar sobre política por texto.','Como conversar sobre política no Fora da Bolha.',`<p>O Fora da Bolha é um espaço para conversar sobre política com quem enxerga o mundo de outra forma. Não há placar, disputa por seguidores ou obrigação de concordar.</p><h2>1. Escolha como participar</h2><p>Use um apelido, indique seu posicionamento político e aceite as regras de respeito. O acesso é destinado a maiores de 18 anos.</p><h2>2. Encontre outra perspectiva</h2><p>O pareamento procura a pessoa disponível que espera há mais tempo do lado oposto. Se não houver alguém compatível ou espaço em uma sala, você aguarda na fila.</p><h2>3. Converse por até 30 minutos</h2><p>O encontro acontece apenas por texto. As perguntas sugeridas ajudam a começar, mas vocês escolhem o rumo da conversa. Ao encerrar, você pode buscar um novo encontro.</p><h2>Um chat para falar de política, com espaço para escutar</h2><p>Uma discussão sobre política pode começar por algo concreto: uma decisão pública, um valor ou uma experiência. Em vez de tentar resolver tudo de uma vez, escolham uma pergunta e explorem os motivos de cada resposta. Veja os <a href="/temas">temas para debate político e social</a> para encontrar um ponto de partida.</p><h2>Discordância com respeito</h2><p>Questione propostas, argumentos e decisões. Não ataque a dignidade de outra pessoa. Você pode encerrar e denunciar uma conversa.</p>`],
 ['/perguntas-frequentes','Fora da Bolha chat: perguntas frequentes','Tire dúvidas sobre o site Fora da Bolha: chat político gratuito, comparação com Omegle, conversas por texto, privacidade e denúncias.','Antes da primeira conversa.',faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')],
 ['/temas','Temas para debate político e social | Fora da Bolha','Explore perguntas sobre corrupção, sexualidade, intolerância religiosa, democracia e outros temas para um diálogo respeitoso.','Perguntas que abrem perspectivas.',`<p>Há assuntos que merecem mais do que uma resposta rápida. Estas perguntas para discussão sobre política convidam a pensar sobre experiências, critérios e consequências. Você não precisa revelar vivências íntimas para participar.</p>${[...new Set(topics.map(t=>t.theme))].map(theme=>`<section><h2>${escape(theme)}</h2><ul>${topics.filter(t=>t.theme===theme).map(t=>`<li>${escape(t.question)}</li>`).join('')}</ul></section>`).join('')}`],
 ['/convivencia','Regras de convivência | Fora da Bolha','Conheça as regras para debater política, respeitar diferenças e lidar com comportamento inadequado no chat.','Discordar faz parte. Desrespeitar, não.',`<p>O objetivo do encontro é conversar com alguém que pensa diferente. Respeito não exige concordância, mas exige reconhecer a dignidade da outra pessoa.</p><h2>O que esperamos</h2><ul><li>Debata ideias e ações, sem ataques pessoais.</li><li>Faça perguntas sem exigir que alguém exponha sua intimidade.</li><li>Não publique ameaças, discriminação, perseguição ou dados de terceiros.</li><li>Não use o chat para golpes, spam ou divulgação de conteúdo ilegal.</li><li>Respeite a decisão de encerrar uma conversa.</li></ul><h2>Quando algo sair do limite</h2><p>Você pode encerrar a sala a qualquer momento. A denúncia registra o motivo e bloqueia pareamentos futuros entre as mesmas identidades. Criar outra identidade pode contornar esse bloqueio; ele não substitui acompanhamento administrativo.</p><h2>Temas sensíveis</h2><p>Discussões sobre sexualidade, religião, violência ou saúde devem se concentrar em argumentos e escolhas. A existência ou a dignidade de uma pessoa não está em votação. O chat não substitui orientação profissional.</p><p>O serviço é para maiores de 18 anos e não oferece garantia de moderação em tempo real.</p>`],
 ['/privacidade','Privacidade e tratamento de dados | Fora da Bolha','Entenda os dados usados no pareamento e no chat, o armazenamento de mensagens e as limitações da identificação anônima.','Privacidade começa com clareza.',`<p>Esta página descreve o funcionamento atual do Fora da Bolha. Use um apelido e evite enviar documentos, endereço, telefone ou informações íntimas.</p><h2>Dados utilizados</h2><ul><li>Apelido, posicionamento político declarado e identificação técnica da sessão para o pareamento.</li><li>Participantes, apelidos preservados por sala, mensagens e horários para a comunicação e o histórico administrativo.</li><li>Motivos e detalhes de denúncias e bloqueios, quando utilizados.</li></ul><p>O posicionamento político merece cuidado especial. Não é necessário informar nome real, e-mail ou filiação partidária para conversar.</p><h2>Onde os dados ficam</h2><p>O frontend é hospedado na Vercel e o banco e a autenticação utilizam Supabase. Esses provedores podem processar registros técnicos, como IP e dados de conexão. O navegador armazena informações de sessão para manter sua identificação.</p><h2>Acesso e limitações</h2><p>As regras do banco restringem as contas dos participantes às próprias salas. A administração e os provedores operam a infraestrutura. Não há criptografia de ponta a ponta, e o uso de apelido não garante anonimato absoluto.</p><h2>Armazenamento e encerramento</h2><p>Encerrar uma sala bloqueia novos envios, mas não apaga automaticamente as mensagens já armazenadas. Ainda não há rotina automática de exclusão com prazo definido. Não utilize o serviço para transmitir dados que precisem desse tipo de garantia.</p><h2>Serviços de terceiros</h2><p>As fontes são servidas pelo próprio site, sem requisições ao Google Fonts. Quando a proteção Turnstile estiver configurada, a Cloudflare processará a verificação contra bots. A página inicial utiliza o Google Analytics para medir visitas e interações com o site. O Google pode processar dados técnicos e utilizar cookies e tecnologias semelhantes. Consulte a <a href="https://policies.google.com/privacy">política de privacidade do Google</a>. Não configuramos eventos para enviar apelidos, posicionamento político ou conteúdo das mensagens ao Analytics.</p><h2>Contato e solicitações</h2><p id="privacy-contact">Não há canal de suporte ou atendimento individual neste momento. Use a denúncia dentro da sala para registrar comportamento inadequado; evite incluir dados sensíveis desnecessários.</p>`]
];
for(const [pathname,title,description,h1,body] of pageData){
 const html=`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0b0c11">${metadata(title,description,pathname)}<link rel="stylesheet" href="/design.css"></head><body><a class="skip-link" href="#conteudo">Pular para o conteúdo</a><header class="header wrap">${nav}<a class="text-button" href="/">Entrar no chat →</a></header><main id="conteudo" class="editorial wrap"><div class="eyebrow">FORA DA BOLHA</div><h1>${h1}</h1><article>${body}</article><a class="primary editorial-cta" href="/">Encontrar uma conversa <span>→</span></a></main><footer class="wrap info-footer"><span>© 2026 Fora da Bolha</span><nav aria-label="Informações">${links}</nav></footer></body></html>`;
 await fs.writeFile('dist'+pathname+'.html',productionAssets(html.replace('</head>',fontLink+'</head>')));
}
const homeFaq=faq.slice(0,5).map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');
let home=await fs.readFile('dist/index.html','utf8');
const headStart=home.indexOf('<head>'),headEnd=home.indexOf('</head>');
home=home.slice(0,headStart)+`<head>\n<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0b0c11">\n${metadata(site.title,site.description)}\n<link rel="stylesheet" href="design.css">\n`+home.slice(headEnd);
home=home.replace(/<!-- PUBLIC-INFO-START -->[\s\S]*?<!-- PUBLIC-INFO-END -->/,'');
home=home.replace('</main>',`<!-- PUBLIC-INFO-START --><section id="public-info" class="public-info wrap"><div class="eyebrow">UM ESPAÇO PARA O DIÁLOGO</div><h2>Fora da Bolha: um chat para<br>conversar sobre política.</h2><p class="public-intro">Um site de conversa entre esquerda e direita, gratuito e por texto. Encontre alguém com uma perspectiva diferente, sem câmera ou microfone, com até 30 minutos para ouvir, discordar e descobrir um ponto em comum.</p><div class="faq-list">${homeFaq}</div><nav class="info-links" aria-label="Conheça o Fora da Bolha">${links}</nav></section><!-- PUBLIC-INFO-END --></main>`);
if(!home.includes('class="skip-link"'))home=home.replace('<body>','<body>\n<a class="skip-link" href="#landing">Pular para o conteúdo</a>');
home=home.replace(/<span class="beta">.*?<\/span>/g,'');
if(!home.includes('<noscript>'))home=home.replace('<main>','<main>\n<noscript><p class="wrap">Ative o JavaScript para entrar no chat. As informações sobre o serviço continuam disponíveis nos links ao final da página.</p></noscript>');
home=home.replace(/<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-9766495106411879"\s+crossorigin="anonymous"><\/script>/g,'');
home=home.replace(/<!-- Google tag \(gtag\.js\) -->\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-4SX1VY314W"><\/script>\s*<script>[\s\S]*?<\/script>/g,'');
await fs.writeFile('dist/index.html',productionAssets(home.replace('</head>',fontLink+'\n'+analyticsTag+'\n</head>')));
await fs.writeFile('dist/robots.txt',preview?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
await fs.writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['/',...pageData.map(p=>p[0])].map(p=>`  <url><loc>${origin}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
await fs.writeFile('dist/404.html',`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Página não encontrada | Fora da Bolha</title><link rel="stylesheet" href="/design.css"></head><body><main class="editorial wrap"><div class="eyebrow">404</div><h1>Esse caminho não levou a uma conversa.</h1><p>A página que você procura não existe.</p><a class="primary editorial-cta" href="/">Voltar ao início →</a></main></body></html>`);

const csp=["default-src 'self'",`script-src 'self' ${[...hashes].join(' ')} https://challenges.cloudflare.com https://www.googletagmanager.com`,"style-src 'self'","font-src 'self'","img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com",`connect-src 'self' ${site.supabaseUrl} ${site.supabaseUrl.replace('https:','wss:')} https://challenges.cloudflare.com https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com`,"frame-src https://challenges.cloudflare.com","frame-ancestors 'none'","object-src 'none'","base-uri 'self'","form-action 'self'","upgrade-insecure-requests"].join('; ');
const config={"$schema":"https://openapi.vercel.sh/vercel.json",framework:null,buildCommand:'npm run build',outputDirectory:'dist',cleanUrls:true,
 redirects:[{source:'/:path*',has:[{type:'host',value:'www.foradabolha.com.br'}],destination:origin+'/:path*',permanent:true}],
 headers:[{source:'/(.*)',headers:[{key:'Content-Security-Policy',value:csp},{key:'X-Content-Type-Options',value:'nosniff'},{key:'X-Frame-Options',value:'DENY'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=(), usb=()'},{key:'Strict-Transport-Security',value:'max-age=31536000'},...(preview?[{key:'X-Robots-Tag',value:'noindex, nofollow'}]:[])]},{source:'/config.js',headers:[{key:'Cache-Control',value:'no-store'}]},{source:'/assets/(.*)',headers:[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]},{source:'/fonts/(.*)',headers:[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]}]};
await fs.writeFile('vercel.json',JSON.stringify(config,null,2)+'\n');
console.log(`Built ${pageData.length+1} public pages for ${origin}; preview=${preview}; vendor served locally.`);
