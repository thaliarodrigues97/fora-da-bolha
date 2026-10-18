import fs from 'node:fs/promises';
import {create} from 'fontkit';

// Convert local font glyphs to paths so the cover renders identically on Vercel.
export async function renderSocial(){
 const fonts={};
 for(const weight of [500,600,700])fonts[weight]=create(await fs.readFile(`node_modules/@fontsource/manrope/files/manrope-latin-${weight}-normal.woff`));
 const brand=(await fs.readFile('dist/brand-mark.svg')).toString('base64');
 const source=(await fs.readFile('dist/social-card.svg','utf8')).replace('<!-- BRAND-MARK -->',`<image x="64" y="60" width="46" height="46" href="data:image/svg+xml;base64,${brand}"/>`);
 return Buffer.from(source.replace(/<text\b([^>]*)>([^<]*)<\/text>/g,(_,attributes,text)=>{
  const attr=(name,fallback)=>attributes.match(new RegExp('(?:^|\\s)'+name+'="([^"]*)"'))?.[1]??fallback;
  const size=Number(attr('font-size','17'));
  const face=fonts[Number(attr('font-weight','500'))]||fonts[500];
  const scale=size/face.unitsPerEm;
  const spacing=Number(attr('letter-spacing','0'));
  const run=face.layout(text);
  const width=run.positions.reduce((sum,p)=>sum+p.xAdvance*scale+spacing,0)-spacing;
  let x=Number(attr('x','0'))-(attr('text-anchor','start')==='end'?width:0);
  const y=Number(attr('y','0'));
  const fill=attr('fill',null);
  return `<g${fill?` fill="${fill}"`:''}>`+run.glyphs.map((glyph,i)=>{
   const position=run.positions[i];
   const path=`<path d="${glyph.path.toSVG()}" transform="translate(${x+position.xOffset*scale} ${y-position.yOffset*scale}) scale(${scale} ${-scale})"/>`;
   x+=position.xAdvance*scale+spacing;
   return path;
  }).join('')+'</g>';
 }));
}
