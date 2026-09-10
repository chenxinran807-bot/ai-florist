import{mkdir,copyFile,cp,readFile,writeFile,rm,chmod}from'node:fs/promises';
import{execFileSync}from'node:child_process';
for(const f of ['studio.js','co-design.js','i18n.js','festival-presets.js','server.js'])execFileSync(process.execPath,['--check',f],{stdio:'inherit'});
await mkdir('dist',{recursive:true});
for(const f of ['index.html','studio.css','studio.js','co-design.js','i18n.js','festival-presets.js','server.js','bootstrap','package.json'])await copyFile(f,'dist/'+f);
await chmod('dist/bootstrap',0o755);
await cp('assets','dist/assets',{recursive:true,filter:s=>!s.endsWith('svg_lib.js')&&!s.endsWith('.png')});
const html=await readFile('dist/index.html','utf8');if(!html.includes('studio.js'))throw Error('Missing entry');
// 缓存戳:dist 产物内所有本地静态引用的 ?v= 统一重写为本次构建戳,源文件版本号不再手动递增。
const STAMP=String(Date.now());
for(const f of ['index.html','studio.js','co-design.js','i18n.js','festival-presets.js']){
 const p='dist/'+f;const src=await readFile(p,'utf8');
 const out=src.replace(/((?:studio|co-design|i18n|festival-presets)\.(?:js|css)\?v=)[A-Za-z0-9]+/g,'$1'+STAMP);
 if(out!==src)await writeFile(p,out);
}
console.log('Fullstack build ready in dist (zip 根: bootstrap + server.js + package.json + 静态资源), 缓存戳 v='+STAMP);
