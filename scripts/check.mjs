import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import sharp from 'sharp';
const site=JSON.parse(await fs.readFile('site.json','utf8'));
const config=JSON.parse(await fs.readFile('vercel.json','utf8'));
const csp=config.headers[0].headers.find(h=>h.key==='Content-Security-Policy').value;
assert.ok(!csp.includes('unsafe-inline')&&!csp.includes('unsafe-eval'));
assert.ok(csp.includes("frame-ancestors 'none'"));
const sitemap=await fs.readFile('dist/sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(urls.length,6);
for(const url of urls){
 assert.equal(new URL(url).origin,site.url);
 const pathname=new URL(url).pathname;
 const html=await fs.readFile('dist'+(pathname==='/'?'/index':pathname)+'.html','utf8');
 assert.equal((html.match(/<link rel="canonical"/g)||[]).length,1);
 assert.ok(html.includes(`rel="canonical" href="${url}"`));
 assert.ok(html.includes('lang="pt-BR"')&&html.includes('name="description"'));
 assert.ok(html.includes('property="og:image"')&&html.includes('name="twitter:card"'));
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
  JSON.parse(match[1]);const hash=crypto.createHash('sha256').update(match[1]).digest('base64');assert.ok(csp.includes("'sha256-"+hash+"'"));
 }
 for(const [,resource] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(/^(?:https?:|mailto:)/.test(resource))continue;
  let file=new URL(resource,url).pathname;if(file==='/')file='/index.html';else if(!file.split('/').pop().includes('.'))file+='.html';
  await fs.access('dist/'+file.replace(/^\//,''));
 }
}
const image=await sharp('dist/social-card.png').metadata();assert.equal(image.width,1200);assert.equal(image.height,630);
assert.ok((await fs.readFile('dist/robots.txt','utf8')).includes(site.url+'/sitemap.xml'));
assert.ok(!(await fs.readFile('dist/app.js','utf8')).includes('esm.sh'));
await fs.access('dist/vendor/supabase.js');
for(const file of ['app.js','config.js','topics.js'])assert.ok(!/sb_secret_|service_role["']\s*:/.test(await fs.readFile('dist/'+file,'utf8')));
console.log('PASS: 6 canonical pages, sitemap links, local resources, JSON-LD CSP hashes, 1200×630 social card and security policy.');
