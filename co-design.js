import {t,getLang} from './i18n.js?v=1';
// Shared personal asset library. Raster bytes stay local; source URLs remain attribution.
const DB='flora-assets-v1';
function database(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('assets',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function transaction(mode,action){const db=await database();try{return await new Promise((resolve,reject)=>{const t=db.transaction('assets',mode),r=action(t.objectStore('assets'));let result;r.onsuccess=()=>{result=r.result};t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||Error(t('errAssetSave')))})}finally{db.close()}}
export async function restoreLibrary(){try{return await transaction('readonly',s=>s.getAll())}catch(e){console.warn('素材库未能恢复',e);return []}}
const safeUrl=value=>{if(!value)return '';const u=new URL(value);if(!['http:','https:'].includes(u.protocol))throw Error(t('errSourceUrl'));return u.href};
export async function prepareAsset(input){
 if(typeof input.name!=='string'||!input.name.trim()||input.name.length>80)throw Error(t('errAssetName'));
 if(!['flowers','wrap','extras','card'].includes(input.category))throw Error(t('errAssetCat'));
 const role=input.role||({flowers:'花材',wrap:'花器',extras:'饰品',card:'卡片图片'})[input.category];
 if(!['花材','叶材','包装','花器','饰品','卡片图片','纸张纹理'].includes(role))throw Error(t('errAssetRole'));
 if(input.category==='wrap'&&!['包装','花器'].includes(role))throw Error(t('errWrapRole'));
 if(input.anchor&&(!Number.isFinite(input.anchor.x)||!Number.isFinite(input.anchor.y)||input.anchor.x<0||input.anchor.x>1||input.anchor.y<0||input.anchor.y>1))throw Error(t('errAnchorRange'));
 const sourcePage=safeUrl(input.sourcePage),license=String(input.license||'未注明').slice(0,200),src=input.image;
 if(typeof src!=='string'||src.length>12000000)throw Error(t('errImageData'));
 const inline=/^data:image\/(png|jpeg|webp);base64,/.test(src);
 if(!inline){const u=new URL(src);if(u.protocol!=='https:')throw Error(t('errImageUrl'));}
 let response;try{response=await fetch(src,{credentials:'omit',signal:AbortSignal.timeout(15000),referrerPolicy:'no-referrer'})}catch{throw Error(t('errImageFetch'))}
 if(!response.ok)throw Error(t('errImageDl')+' '+response.status);
 if(Number(response.headers.get('content-length'))>8000000)throw Error(t('errImageSize'));
 const reader=response.body.getReader(),chunks=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8000000){await reader.cancel();throw Error(t('errImageSize'))}chunks.push(value)}
 const blob=new Blob(chunks,{type:response.headers.get('content-type')||'application/octet-stream'});
 if(!/^image\/(png|jpeg|webp)(;|$)/.test(blob.type))throw Error(t('errImageType'));
 const bitmap=await createImageBitmap(blob);if(bitmap.width>8192||bitmap.height>8192){bitmap.close();throw Error(t('errImageDim'))}
 const scale=Math.min(1,1536/Math.max(bitmap.width,bitmap.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));const g=c.getContext('2d');g.drawImage(bitmap,0,0,c.width,c.height);bitmap.close();
 const pixels=g.getImageData(0,0,c.width,c.height).data;let transparent=false;for(let i=3;i<pixels.length;i+=4)if(pixels[i]<240){transparent=true;break}
 const data=c.toDataURL('image/png'),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(data)))).map(v=>v.toString(16).padStart(2,'0')).join('');
 return {id:'custom-'+hash.slice(0,20),name:input.name.trim(),category:input.category,role,sourcePage,license,imageUrl:inline?'':src,data,width:c.width,height:c.height,transparent,anchor:input.anchor||{x:.5,y:role==='花器'?.1:.9},custom:true,createdAt:Date.now()};
}
export async function assetSprite(a){const im=new Image();await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=()=>reject(Error(t('errImageInvalid')));im.src=a.data});const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0);return c}
const FONT_STACKS={serif:'"Songti SC",Georgia,serif',sans:'Arial,"PingFang SC",sans-serif',hand:'KaiTi,"Kaiti SC",serif',round:'"Yuanti SC","Arial Rounded MT Bold","PingFang SC",sans-serif',xing:'"Xingkai SC","STXingkai",KaiTi,serif',type:'"Courier New",Courier,monospace',script:'Caveat,"Segoe Script",cursive'};
const FONT_OPTIONS=[['serif','宋体','Serif Song'],['sans','黑体','Sans'],['hand','楷体','Kaiti'],['round','圆润手写','Rounded'],['xing','行书','Xingkai'],['type','打字机','Typewriter'],['script','英文花体','Script']];
const DECOR_KINDS=[['star','星星','Star'],['heart','爱心','Heart'],['firework','烟花','Firework'],['bow','蝴蝶结','Bow'],['wave','波浪分割线','Wave Divider'],['bunting','三角旗','Bunting'],['block','色块横幅','Color Band'],['stamp','邮票锯齿框','Postage Stamp'],['postmark','邮戳','Postmark'],['wax','火漆印','Wax Seal'],['seal','印章','Seal Stamp'],['vine','藤蔓边框','Vine Frame'],['bouquet','花束简笔画','Bouquet Sketch'],['bubble','对话框','Speech Bubble']];
const DECOR_TEXT_KINDS=['seal','wax','postmark','bubble'];
const FIELD_STEPS={x:5,y:5,w:5,h:5,angle:5,depth:1,fontSize:2,lineHeight:.1};
const RAINBOW=['#E85D75','#F29B4C','#F2D24C','#5FBF7F','#5B9BD5','#9B7FD4'];
const BUNTING=['#F299B0','#F2C94C','#7FB5D5','#9CC78F','#C9A6D9'];
const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16);return 'rgb('+[16,8,0].map(s=>Math.round(((n>>s)&255)*f)).join(',')+')'};
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
// Card decorations: vector-only, drawn inside the element's own w×h box.
function drawDecor(g,o){
 const w=o.w,h=o.h,u=Math.min(w,h)/100;g.lineJoin='round';g.lineCap='round';
 switch(o.kind){
 case 'star':{const cx=w/2,cy=h/2,r=Math.min(w,h)/2;g.fillStyle=o.color;g.beginPath();g.moveTo(cx,cy-r);g.quadraticCurveTo(cx,cy,cx+r,cy);g.quadraticCurveTo(cx,cy,cx,cy+r);g.quadraticCurveTo(cx,cy,cx-r,cy);g.quadraticCurveTo(cx,cy,cx,cy-r);g.fill();break}
 case 'heart':{const s=Math.min(w,h),x=(w-s)/2,y=(h-s)/2;g.fillStyle=o.color;g.beginPath();g.moveTo(x+s/2,y+s*.95);g.bezierCurveTo(x-s*.15,y+s*.55,x+s*.15,y,x+s/2,y+s*.32);g.bezierCurveTo(x+s*.85,y,x+s*1.15,y+s*.55,x+s/2,y+s*.95);g.fill();break}
 case 'firework':{const cx=w/2,cy=h/2,r=Math.min(w,h)/2*.9;g.strokeStyle=o.color;g.fillStyle=o.color;for(let i=0;i<12;i++){const a=i*Math.PI/6+.26;g.lineWidth=3*u+.8;g.beginPath();g.moveTo(cx+Math.cos(a)*r*.3,cy+Math.sin(a)*r*.3);g.lineTo(cx+Math.cos(a)*r*.82,cy+Math.sin(a)*r*.82);g.stroke();g.beginPath();g.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,3*u+1.5,0,7);g.fill()}g.beginPath();g.arc(cx,cy,4*u+2,0,7);g.fill();break}
 case 'bow':{const cx=w/2,cy=h/2,k=Math.min(w/2,h);g.fillStyle=o.color;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx-w*.42,cy-h*.32);g.quadraticCurveTo(cx-w*.55,cy,cx-w*.42,cy+h*.32);g.closePath();g.moveTo(cx,cy);g.lineTo(cx+w*.42,cy-h*.32);g.quadraticCurveTo(cx+w*.55,cy,cx+w*.42,cy+h*.32);g.closePath();g.fill();g.fillStyle=shade(o.color,.72);g.beginPath();g.arc(cx,cy,k*.15,0,7);g.fill();g.strokeStyle=shade(o.color,.72);g.lineWidth=3*u+.8;g.beginPath();g.moveTo(cx-k*.08,cy+k*.1);g.lineTo(cx-w*.16,cy+h*.42);g.moveTo(cx+k*.08,cy+k*.1);g.lineTo(cx+w*.16,cy+h*.42);g.stroke();break}
 case 'wave':{g.strokeStyle=o.color;g.lineWidth=2.5*u+1;g.beginPath();g.moveTo(0,h/2);const amp=h*.4;for(let i=0;i<8;i++){const x0=i*w/8;g.quadraticCurveTo(x0+w/16,h/2+(i%2?-1:1)*amp,x0+w/8,h/2)}g.stroke();break}
 case 'bunting':{g.strokeStyle='#8a8578';g.lineWidth=1.5*u+1;g.beginPath();g.moveTo(0,h*.15);g.quadraticCurveTo(w/2,h*.55,w,h*.15);g.stroke();const n=Math.max(4,Math.round(w/110));for(let i=0;i<n;i++){const t=(i+.5)/n,bx=t*w,by=h*(.15+.8*t*(1-t)),fw=w/n*.66,fh=h*.5;g.fillStyle=BUNTING[i%BUNTING.length];g.beginPath();g.moveTo(bx-fw/2,by);g.lineTo(bx+fw/2,by);g.lineTo(bx,by+fh);g.closePath();g.fill()}break}
 case 'block':{g.fillStyle=o.color;roundRect(g,0,0,w,h,Math.min(w,h)*.25);g.fill();break}
 case 'stamp':{const t=Math.max(8,Math.min(w,h)/18),nx=Math.max(4,Math.round(w/t)),ny=Math.max(4,Math.round(h/t));g.fillStyle=o.color;g.beginPath();g.moveTo(0,0);for(let i=0;i<nx;i++){g.lineTo((i+.5)*w/nx,-t*.45);g.lineTo((i+1)*w/nx,0)}for(let i=0;i<ny;i++){g.lineTo(w+t*.45,(i+.5)*h/ny);g.lineTo(w,(i+1)*h/ny)}for(let i=nx;i>0;i--){g.lineTo((i-.5)*w/nx,h+t*.45);g.lineTo((i-1)*w/nx,h)}for(let i=ny;i>0;i--){g.lineTo(-t*.45,(i-.5)*h/ny);g.lineTo(0,(i-1)*h/ny)}g.closePath();g.fill();g.strokeStyle='rgba(120,90,60,.55)';g.setLineDash([4*u+2,3*u+2]);g.lineWidth=1.2*u+.8;g.strokeRect(w*.06,h*.06,w*.88,h*.88);g.setLineDash([]);break}
 case 'postmark':{const r=Math.min(w,h)/2*.92,cx=w/2,cy=h/2;g.strokeStyle=o.color;g.fillStyle=o.color;g.lineWidth=2*u+1;g.globalAlpha=.85;g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();g.beginPath();g.arc(cx,cy,r*.66,0,7);g.stroke();g.font=Math.round(r*.34)+'px '+FONT_STACKS.type;g.textAlign='center';g.textBaseline='middle';g.fillText(o.text||'LOVE',cx,cy,r*1.15);for(let i=-1;i<=1;i++){g.beginPath();const yy=cy+i*r*.3;g.moveTo(cx+r*.72,yy);for(let k=0;k<3;k++)g.quadraticCurveTo(cx+r*.72+(k+.5)*r*.15,yy+(k%2?-1:1)*r*.12,cx+r*.72+(k+1)*r*.15,yy);g.stroke()}g.globalAlpha=1;break}
 case 'wax':{const r=Math.min(w,h)/2*.9,cx=w/2,cy=h/2;g.fillStyle=o.color;g.beginPath();for(let i=0;i<=12;i++){const a=i/12*2*Math.PI,rr=r*(1+.06*Math.sin(a*3+1)),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.5*u+1;g.beginPath();g.arc(cx,cy,r*.62,0,7);g.stroke();g.fillStyle='rgba(255,255,255,.92)';g.font=Math.round(r*.68)+'px '+FONT_STACKS.serif;g.textAlign='center';g.textBaseline='middle';g.fillText(o.text||'愿',cx,cy+1);break}
 case 'seal':{const s=Math.min(w,h)*.92,x=(w-s)/2,y=(h-s)/2;g.fillStyle=o.color;roundRect(g,x,y,s,s,s*.08);g.fill();g.fillStyle='#fdf8ef';g.font=Math.round(s*.6)+'px '+FONT_STACKS.serif;g.textAlign='center';g.textBaseline='middle';g.fillText(o.text||'福',x+s/2,y+s/2+1);break}
 case 'vine':{const m=Math.min(w,h)*.04;g.strokeStyle=o.color;g.fillStyle=o.color;g.lineWidth=2*u+1.2;const leaf=(x,y,a)=>{g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.ellipse(0,-(7*u+3),3.5*u+1.5,7*u+3,0,0,7);g.fill();g.restore()};const runs=[[m,m,w-m,m,0],[w-m,m,w-m,h-m,Math.PI/2],[w-m,h-m,m,h-m,Math.PI],[m,h-m,m,m,-Math.PI/2]];for(const [x0,y0,x1,y1,a] of runs){const len=Math.hypot(x1-x0,y1-y0),n=Math.max(4,Math.round(len/28));g.beginPath();g.moveTo(x0,y0);for(let i=1;i<=n;i++){const t=i/n,off=Math.sin(t*len/24)*3.5*u;g.lineTo(x0+(x1-x0)*t+Math.cos(a+Math.PI/2)*off,y0+(y1-y0)*t+Math.sin(a+Math.PI/2)*off)}g.stroke();const nl=Math.floor(len/52);for(let i=1;i<=nl;i++){const t=i/(nl+1);leaf(x0+(x1-x0)*t,y0+(y1-y0)*t,a+(i%2?.7:-.7))}}break}
 case 'bouquet':{const bx=w/2,by=h*.96;g.strokeStyle=o.color;g.fillStyle=o.color;g.lineWidth=2.5*u+1;const heads=[[w*.3,h*.3],[w*.5,h*.14],[w*.7,h*.3],[w*.39,h*.44],[w*.62,h*.45]];for(const [hx,hy] of heads){g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo((bx+hx)/2,(by+hy)/2+h*.08,hx,hy);g.stroke()}for(const [hx,hy] of heads){const r=Math.min(w,h)*.085;for(let p=0;p<5;p++){const a=p/5*2*Math.PI;g.beginPath();g.arc(hx+Math.cos(a)*r,hy+Math.sin(a)*r,r*.85,0,7);g.stroke()}g.beginPath();g.arc(hx,hy,r*.5,0,7);g.fill()}g.beginPath();g.moveTo(bx,by-h*.06);g.lineTo(bx-w*.09,by-h*.15);g.lineTo(bx-w*.02,by-h*.01);g.closePath();g.moveTo(bx,by-h*.06);g.lineTo(bx+w*.09,by-h*.15);g.lineTo(bx+w*.02,by-h*.01);g.closePath();g.fill();break}
 case 'bubble':{const r=Math.min(w,h)*.18,bh=h*.78;g.fillStyle=o.color;roundRect(g,0,0,w,bh,r);g.fill();g.strokeStyle='rgba(0,0,0,.15)';g.lineWidth=1.5;g.stroke();g.beginPath();g.moveTo(w*.68,bh-1);g.lineTo(w*.8,h);g.lineTo(w*.84,bh-1);g.closePath();g.fillStyle=o.color;g.fill();if(o.text){g.fillStyle='#4A4A4A';g.font=Math.round(Math.min(30,bh*.26))+'px '+FONT_STACKS.round;g.textAlign='center';g.textBaseline='middle';g.fillText(o.text,w/2,bh/2,w*.9)}break}
 }
}
// Card templates, coordinates on the fixed 1200×900 canvas.
const TEMPLATES=[
 {
  "id": "to-blessing",
  "name": "一枝心意",
  "nameEn": "A Stem of Kindness",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#FBF8F0",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "s5",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "f6",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#39453B",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#39453B",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#39453B",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "mono-statement",
  "name": "留白之间",
  "nameEn": "Quiet Form",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#F1F0E9",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "s0",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "f14",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#292F2A",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#292F2A",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#292F2A",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "letter-style",
  "name": "玫瑰来信",
  "nameEn": "Rose Letter",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#F8F1E9",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "s1",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "fb0",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#603A3C",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#603A3C",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#603A3C",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "cute-bubble",
  "name": "向阳而生",
  "nameEn": "Sunward",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#FAF2DD",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "s5",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "fb9",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#5E4A25",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#5E4A25",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#5E4A25",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "vintage-stamp",
  "name": "暮色花笺",
  "nameEn": "Amber Letter",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#30282D",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "fb4",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "fb8",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#F4E5CF",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#F4E5CF",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#F4E5CF",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "oriental-vertical",
  "name": "青枝寄语",
  "nameEn": "Olive Notes",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#EBEEE5",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "s5",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "fc14",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#374B3D",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#374B3D",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#374B3D",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "pastel-floral",
  "name": "温柔有枝",
  "nameEn": "Gentle Light",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#F7ECE7",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "s5",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "f11",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#71534F",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#71534F",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#71534F",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "fireworks-party",
  "name": "岁序新章",
  "nameEn": "A New Chapter",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#263F36",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "s4",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "fd12",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#EFE6D2",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#EFE6D2",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#EFE6D2",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "vine-frame",
  "name": "花间誓言",
  "nameEn": "Among the Flowers",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#F5EBED",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "s1",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "f8",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#61474F",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#61474F",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#61474F",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "rainbow-marker",
  "name": "明亮日常",
  "nameEn": "Everyday Sunshine",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#F9F0DD",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "fb10",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "fb11",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#695431",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#695431",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#695431",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "speech-bubble",
  "name": "热带手记",
  "nameEn": "Tropical Notes",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#E6EBDA",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "s4",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "fc11",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#344B3C",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#344B3C",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#344B3C",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 },
 {
  "id": "watercolor-space",
  "name": "晨光初至",
  "nameEn": "First Light",
  "note": "真实花材与独立文字排版，可继续调整。",
  "noteEn": "Botanical imagery with independently editable typography.",
  "paper": "#F4F2E5",
  "elements": [
   {
    "id": "botanical-leaf",
    "type": "image",
    "asset": "s5",
    "x": 75,
    "y": 210,
    "w": 300,
    "h": 450,
    "angle": -15,
    "depth": 2
   },
   {
    "id": "botanical-flower",
    "type": "image",
    "asset": "f15",
    "x": 105,
    "y": 370,
    "w": 275,
    "h": 275,
    "angle": 8,
    "depth": 4
   },
   {
    "id": "card-title",
    "type": "text",
    "text": "把心意送给你",
    "x": 490,
    "y": 245,
    "w": 610,
    "h": 200,
    "fontSize": 64,
    "font": "serif",
    "color": "#515E46",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-body",
    "type": "text",
    "text": "愿平常的日子，\n也有值得珍藏的温柔。",
    "x": 490,
    "y": 475,
    "w": 585,
    "h": 230,
    "fontSize": 34,
    "font": "sans",
    "color": "#515E46",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   },
   {
    "id": "card-sign",
    "type": "text",
    "text": "",
    "x": 490,
    "y": 770,
    "w": 585,
    "h": 55,
    "fontSize": 25,
    "font": "serif",
    "color": "#515E46",
    "align": "left",
    "lineHeight": 1.45,
    "depth": 20
   }
  ]
 }
];
const TPL_TEXTS_EN=Object.fromEntries(TEMPLATES.map(t=>[t.id,{"card-title":"A little something,\njust for you","card-body":"May ordinary days hold\nextraordinary little joys."}]));
function tplElementsFor(tpl){const els=structuredClone(tpl.elements);if(getLang()==='en'){const m=TPL_TEXTS_EN[tpl.id];if(m)for(const o of els)if(m[o.id]!==undefined)o.text=m[o.id];if(tpl.id==='oriental-vertical')fitVerticalLatin(els)}return els}
// 竖排模板的拉丁文:整行旋转90°(交换宽高、保持中心),按可用长度收窄字号。幂等——已旋转的只重算字号。
function fitVerticalLatin(els){const g=document.createElement('canvas').getContext('2d');for(const o of els){if(o.type!=='text'||!/[A-Za-z]{3}/.test(o.text||''))continue;o.text=o.text.replace(/\s+/g,' ').trim();o.angle=90;if(o.w<o.h){const w0=o.w,h0=o.h;o.w=h0;o.h=w0;o.x+=(w0-h0)/2;o.y+=(h0-w0)/2}g.font=o.fontSize+'px '+(FONT_STACKS[o.font]||FONT_STACKS.serif);while(o.fontSize>12&&g.measureText(o.text).width>o.w-16){o.fontSize-=2;g.font=o.fontSize+'px '+(FONT_STACKS[o.font]||FONT_STACKS.serif)}}}
export function createCoDesign(api){
 const {$,catalog,sprites,commit,getState,checkRevision,snapshot,toast,modal,el,download}=api;const dispCard=()=>api.displayCard?api.displayCard():getState().card;
 let chosen=null,editor=null,moving=null,editorPanel=null;
 const metadata=a=>{const {data,...rest}=a;return rest};
 async function importAsset(input){const a=await prepareAsset(input);const existing=catalog.find(x=>x.id===a.id);if(existing)return {asset:metadata(existing),duplicate:true};const sp=await assetSprite(a);await transaction('readwrite',s=>s.put(a));catalog.push(a);sprites[a.id]=sp;api.signal('asset_import',{assetId:a.id});api.refreshLibrary();return {asset:metadata(a),warning:a.transparent?'':'图片没有透明背景，将作为矩形图片显示；如需独立花材，请先抠图。'}}
 const assetsFor=s=>{const ids=new Set([...s.objects.map(o=>o.asset),...(s.card.elements||[]).map(o=>o.asset),...(s.proposals||[]).flatMap(p=>p.objects.map(o=>o.asset))]);return catalog.filter(a=>a.custom&&ids.has(a.id))};
 async function restoreBundle(bundle){
 if(!bundle||!Array.isArray(bundle.assets)||bundle.assets.length>200)throw Error(t('errBundleFormat'));
 const prepared=[];for(const a of bundle.assets){if(typeof a.data!=='string')throw Error(t('errBundleImage'));const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(a.data)))).map(v=>v.toString(16).padStart(2,'0')).join('');if(a.id!=='custom-'+digest.slice(0,20))throw Error(t('errBundleHash'));const result=await prepareAsset({...a,image:a.data});result.id=a.id;result.data=a.data;result.imageUrl=a.imageUrl||'';if(!catalog.some(x=>x.id===a.id))prepared.push({asset:result,sprite:await assetSprite(result)})}
 if(prepared.length)await transaction('readwrite',store=>{let r;for(const p of prepared)r=store.put(p.asset);return r});for(const p of prepared){catalog.push(p.asset);sprites[p.asset.id]=p.sprite}return bundle.scene;
 }

 function cardElements(s){const card=s?s.card:dispCard();if(card.elements)return structuredClone(card.elements);return [{id:'card-title',type:'text',text:card.title,x:100,y:210,w:1000,h:100,fontSize:64,font:card.font||'serif',color:'#343b32',align:'left',angle:0,depth:10,locked:false,lineHeight:1.4},{id:'card-body',type:'text',text:card.body,x:100,y:355,w:960,h:330,fontSize:38,font:card.font||'serif',color:'#50564d',align:'left',angle:0,depth:11,locked:false,lineHeight:1.9},{id:'card-sign',type:'text',text:card.sign,x:100,y:760,w:960,h:80,fontSize:30,font:card.font||'serif',color:'#666b62',align:'right',angle:0,depth:12,locked:false,lineHeight:1.5}]}
 function validateElements(elements){if(!Array.isArray(elements)||elements.length>100)throw Error(t('errTooManyEls'));const ids=new Set();for(const o of elements){if(typeof o.id!=='string'||!o.id||ids.has(o.id))throw Error(t('errElId'));ids.add(o.id);if(!['text','image','decor'].includes(o.type))throw Error(t('errElType'));for(const k of ['x','y','w','h','angle','depth'])if(!Number.isFinite(o[k]))throw Error(t('errElNum'));if(o.w<10||o.h<10||o.w>2400||o.h>1800||Math.abs(o.x)>2400||Math.abs(o.y)>1800||Math.abs(o.angle)>360||Math.abs(o.depth)>200)throw Error(t('errElBounds'));if(o.type==='image'&&!catalog.some(a=>a.id===o.asset))throw Error(t('errElAsset'));if(o.type==='decor'&&(!DECOR_KINDS.some(([k])=>k===o.kind)||!/^#[\da-f]{6}$/i.test(o.color)||(o.text!==undefined&&(typeof o.text!=='string'||o.text.length>40))))throw Error(t('errElDecor'));if(o.type==='text'&&(typeof o.text!=='string'||o.text.length>2000||!Number.isFinite(o.fontSize)||o.fontSize<12||o.fontSize>180||!/^#[\da-f]{6}$/i.test(o.color)||!FONT_STACKS[o.font]||!['left','center','right'].includes(o.align)||!Number.isFinite(o.lineHeight)||o.lineHeight<1||o.lineHeight>3||(o.stroke!==undefined&&!/^#[\da-f]{6}$/i.test(o.stroke))||(o.rainbow!==undefined&&typeof o.rainbow!=='boolean')))throw Error(t('errElText'))}}
 function layoutText(g,o){g.font=o.fontSize+'px '+(FONT_STACKS[o.font]||FONT_STACKS.serif);const lines=[];const W=t=>g.measureText(t).width
 for(const line of o.text.split('\n')){
  let current=''
  for(const w of line.split(/(\s+)/)){
   if(!w)continue
   if(W(current+w)<=o.w){current+=w;continue}
   if(current){lines.push(current.trimEnd());current=''}
   const word=w.trimStart()
   if(W(word)<=o.w){current=word}
   else{let part='';for(const ch of word){if(part&&W(part+ch)>o.w){lines.push(part);part=ch}else part+=ch}current=part}
  }
  lines.push(current)}
 return lines}
 function paintCard(g,paper,elements,selectedId){g.fillStyle=paper||'#fcfaf5';g.fillRect(0,0,1200,900);for(const o of [...elements].sort((a,b)=>a.depth-b.depth)){g.save();g.translate(o.x+o.w/2,o.y+o.h/2);g.rotate(o.angle*Math.PI/180);g.translate(-o.w/2,-o.h/2);if(o.type==='image'){const sp=sprites[o.asset];if(sp)g.drawImage(sp,0,0,o.w,o.h)}else if(o.type==='decor'){drawDecor(g,o)}else{const lines=layoutText(g,o);g.textBaseline='top';g.textAlign=o.align;const ax=o.align==='left'?0:o.align==='center'?o.w/2:o.w;lines.forEach((line,i)=>{const y=i*o.fontSize*o.lineHeight;if(o.rainbow){g.textAlign='left';let cx=o.align==='left'?0:o.align==='center'?o.w/2-g.measureText(line).width/2:o.w-g.measureText(line).width;[...line].forEach((ch,j)=>{g.fillStyle=RAINBOW[j%RAINBOW.length];g.fillText(ch,cx,y);cx+=g.measureText(ch).width})}else{if(o.stroke){g.lineJoin='round';g.strokeStyle=o.stroke;g.lineWidth=Math.max(3,o.fontSize/10);g.strokeText(line,ax,y)}g.fillStyle=o.color;g.fillText(line,ax,y)}})}if(selectedId&&o.id===selectedId){g.strokeStyle='#5b785e';g.lineWidth=3;g.setLineDash([9,6]);g.strokeRect(-5,-5,o.w+10,o.h+10)}g.restore()}}
 function drawCard(c,selection=false){c.width=1200;c.height=900;paintCard(c.getContext('2d'),dispCard().paper,cardElements(),selection?chosen:null)}
 function cardWarnings(elements=cardElements()){const c=document.createElement('canvas'),g=c.getContext('2d'),warnings=[];for(const o of elements){const r=o.angle*Math.PI/180,bw=Math.abs(o.w*Math.cos(r))+Math.abs(o.h*Math.sin(r)),bh=Math.abs(o.w*Math.sin(r))+Math.abs(o.h*Math.cos(r));if(o.x+o.w/2-bw/2<0||o.y+o.h/2-bh/2<0||o.x+o.w/2+bw/2>1200||o.y+o.h/2+bh/2>900)warnings.push({id:o.id,issue:t('warnBounds')});if(o.type==='text'&&layoutText(g,o).length*o.fontSize*o.lineHeight>o.h)warnings.push({id:o.id,issue:t('warnOverflow')})}return warnings}
 function editCard(input){checkRevision(input.expectedRevision);if(moving)throw Error(t('errCardMoving'));if(input.template!==undefined){const tpl=TEMPLATES.find(x=>x.id===input.template);if(!tpl)throw Error(t('errCardTpl')+' '+input.template);input={...input,removeIds:cardElements().map(o=>o.id),additions:tplElementsFor(tpl),paper:tpl.paper}}const s=getState(),elements=cardElements();for(const id of input.removeIds||[]){if(!elements.find(o=>o.id===id))throw Error(t('errElMissing'))}
 let next=elements.filter(o=>!(input.removeIds||[]).includes(o.id));for(const patch of input.updates||[]){const o=next.find(o=>o.id===patch.id);if(!o)throw Error(t('errElMissing'));Object.assign(o,patch)}for(const a of input.additions||[])next.push({...(a.type==='text'?{text:'',fontSize:42,font:'serif',color:'#343b32',align:'left',lineHeight:1.6}:a.type==='decor'?{kind:'star',color:'#8a8578'}:{}),...a,id:a.id||'card-'+crypto.randomUUID(),angle:a.angle??0,depth:a.depth??20,locked:false});validateElements(next);if(input.paper!==undefined&&!/^#[\da-f]{6}$/i.test(input.paper))throw Error(t('errPaper'));commit(()=>{s.card.elements=next;s.card.paper=input.paper||s.card.paper||'#fcfaf5';if(input.template)s.card.template=input.template;s.cardEdited=true;syncLegacy(s)},'card_edit');return {...readCard(),warnings:cardWarnings(next)}}
 // 旧字段 title/body/sign 以 elements 为单源回写,保证 get_card_state/get_scene_state 与画面一致。
 function legacyFields(elements){const r={title:'',body:'',sign:''};for(const [id,key] of [['card-title','title'],['card-body','body'],['card-sign','sign']]){const o=(elements||[]).find(o=>o.id===id&&o.type==='text');r[key]=o?o.text.slice(0,key==='body'?400:50):''}return r}
 function syncLegacy(s){Object.assign(s.card,legacyFields(s.card.elements))}
 function readCard(){return {revision:snapshot().revision,width:1200,height:900,paper:dispCard().paper||'#fcfaf5',template:dispCard().template||null,...legacyFields(cardElements()),elements:cardElements(),warnings:cardWarnings()}}
 function patchSelected(patch){if(!chosen)return;try{editCard({expectedRevision:snapshot().revision,updates:[{id:chosen,...patch}]})}catch(e){toast(e.message)}}
 function render(){const preview=$('#card-preview');if(preview)drawCard(preview);if(editor&&editor.isConnected){drawCard(editor,true);if(editorPanel&&!editorPanel.contains(document.activeElement))inspector(editorPanel);const warning=$('#card-warning');if(warning)warning.textContent=cardWarnings().map(x=>x.issue).join('；')}}
 function inspector(root){root.replaceChildren();const o=cardElements().find(o=>o.id===chosen);if(!o){root.append(el('p',t('inspectorHint')));return}
 root.append(el('strong',o.type==='text'?t('typeText'):o.type==='decor'?t('typeDecor')+' · '+((DECOR_KINDS.find(([k])=>k===o.kind)||[])[getLang()==='en'?2:1]||o.kind):t('typeImage')));
 // 紧凑行式布局:标签左、控件右;X/Y/Angle 由画布拖拽与手柄调整,不在此提供输入。
 const row=(label,...ctl)=>{const l=el('label',null,'if-row'),c=el('span',null,'if-ctl');c.append(...ctl);l.append(el('span',label),c);root.append(l);return c};
 const stepBtn=(key,d,sym)=>{const btn=el('button',sym);btn.setAttribute('aria-label',t(({w:'fW',h:'fH',depth:'fDepth',fontSize:'fSize',lineHeight:'fLh'})[key])+sym);btn.onclick=()=>{const cur=cardElements().find(x=>x.id===chosen);if(cur)patchSelected({[key]:Math.round((cur[key]+d*FIELD_STEPS[key])*100)/100})};return btn};
 const numInput=key=>{const i=el('input');i.type='number';i.value=Math.round(o[key]*100)/100;i.setAttribute('aria-label',t(({w:'fW',h:'fH',fontSize:'fSize',lineHeight:'fLh'})[key]));i.onchange=()=>patchSelected({[key]:Number(i.value)});return i};
 const numRow=(label,key)=>row(label,stepBtn(key,-1,'−'),numInput(key),stepBtn(key,1,'＋'));
 const stepRow=(label,key)=>row(label,stepBtn(key,-1,'−'),stepBtn(key,1,'＋'));
 
 if(o.type==='decor'){const c=el('input');c.type='color';c.value=o.color;c.setAttribute('aria-label',t('color'));c.onchange=()=>patchSelected({color:c.value});row(t('color'),c);if(DECOR_TEXT_KINDS.includes(o.kind)){const ti=el('input');ti.value=o.text||'';ti.setAttribute('aria-label',t('decorText'));ti.onchange=()=>patchSelected({text:ti.value.slice(0,20)});row(t('decorText'),ti)}}
 if(o.type==='text'){const txt=el('textarea');txt.value=o.text;txt.setAttribute('aria-label',t('textAria'));txt.onchange=()=>patchSelected({text:txt.value});root.append(txt);numRow(t('fSize'),'fontSize');numRow(t('fLh'),'lineHeight');const c2=el('input');c2.type='color';c2.value=o.color;c2.setAttribute('aria-label',t('fColor'));c2.onchange=()=>patchSelected({color:c2.value});row(t('fColor'),c2);for(const [key,options,aria] of [['font',FONT_OPTIONS,t('fontAria')],['align',[['left','alignLeft'],['center','alignCenter'],['right','alignRight']],t('alignAria')]]){const select=el('select');select.setAttribute('aria-label',aria);for(const [value,label,labelEn] of options){const op=el('option',labelEn?(getLang()==='en'?labelEn:label):t(label));op.value=value;select.append(op)}select.value=o[key];select.onchange=()=>patchSelected({[key]:select.value});row(aria,select)}}
 const position=el('select');position.setAttribute('aria-label',t('elementPosition'));for(const [value,key] of [['','elementPosition'],['horizontal','centerHorizontal'],['vertical','centerVertical']]){const option=el('option',t(key));option.value=value;position.append(option)}position.onchange=()=>{const current=cardElements().find(x=>x.id===chosen);if(current){if(position.value==='horizontal')patchSelected({x:(1200-current.w)/2});if(position.value==='vertical')patchSelected({y:(900-current.h)/2})}position.value=''};row(t('elementPosition'),position);
 numRow(t('fW'),'w');numRow(t('fH'),'h');stepRow(t('fDepth'),'depth');
 const remove=el('button',t('deleteEl'));remove.onclick=()=>{try{editCard({expectedRevision:snapshot().revision,removeIds:[chosen]});chosen=null;inspector(root)}catch(e){toast(e.message)}};root.append(remove)}
 function openTemplates(){modal(t('tplTitle'),body=>{const back=el('button',t('backToCard'));back.onclick=openEditor;body.append(back,el('p',t('tplIntro')));const grid=el('div',null,'tpl-grid');for(const tpl of TEMPLATES){const b=el('button',null,'tpl-card');const cv=el('canvas');cv.width=300;cv.height=225;const g=cv.getContext('2d');g.scale(.25,.25);paintCard(g,tpl.paper,tplElementsFor(tpl),null);b.append(cv,el('strong',getLang()==='en'?tpl.nameEn:tpl.name));b.onclick=()=>{if(cardElements().length&&!confirm(t('tplConfirm')))return;try{editCard({expectedRevision:snapshot().revision,template:tpl.id});chosen=null;openEditor();toast(t('tplApplied')+(getLang()==='en'?tpl.nameEn+'"':tpl.name+'」'))}catch(e){toast(e.message)}};grid.append(b)}body.append(grid)});const dialog=$('#modal');const back=()=>{dialog.oncancel=null;$('#close-modal').onclick=()=>dialog.close();openEditor()};$('#close-modal').onclick=back;dialog.oncancel=e=>{e.preventDefault();back()}}
 function openEditor(){$('#modal').oncancel=null;$('#close-modal').onclick=()=>$('#modal').close();modal(t('cardEditorTitle'),body=>{body.classList.add('card-editor-body');const actions=el('div',null,'card-actions'),work=el('div',null,'card-work'),surface=el('canvas'),panel=el('div',null,'card-inspector');editor=surface;editorPanel=panel;surface.setAttribute('aria-label',t('surfaceAria'));surface.tabIndex=0;const text=el('button',t('addText'));text.onclick=()=>{const id='card-'+crypto.randomUUID();editCard({expectedRevision:snapshot().revision,additions:[{id,type:'text',text:t('newTextDefault'),x:110,y:120,w:700,h:110,fontSize:48,font:'serif',color:'#343b32',align:'left',lineHeight:1.6}]});chosen=id;inspector(panel);render()};const select=el('select');select.setAttribute('aria-label',t('pickImage'));select.append(el('option',t('pickImage')));for(const a of catalog){const op=el('option',getLang()==='en'?(a.nameEn||a.name):a.name);op.value=a.id;select.append(op)}select.onchange=()=>{const a=catalog.find(a=>a.id===select.value),sp=sprites[a?.id];if(!sp)return;const id='card-'+crypto.randomUUID();editCard({expectedRevision:snapshot().revision,additions:[{id,type:'image',asset:a.id,x:800,y:120,w:230,h:230*sp.height/sp.width}]});chosen=id;inspector(panel);render()};const decorSel=el('select');decorSel.setAttribute('aria-label',t('addDecor'));decorSel.append(el('option',t('addDecor')));for(const [k,label,labelEn] of DECOR_KINDS){const op=el('option',getLang()==='en'?labelEn:label);op.value=k;decorSel.append(op)}decorSel.onchange=()=>{const kind=decorSel.value;if(!DECOR_KINDS.some(([k])=>k===kind))return;const id='card-'+crypto.randomUUID();try{editCard({expectedRevision:snapshot().revision,additions:[{id,type:'decor',kind,x:460,y:360,w:kind==='vine'?1080:kind==='bunting'?600:kind==='wave'?400:kind==='block'?500:180,h:kind==='vine'?800:kind==='bunting'?90:kind==='wave'?40:kind==='block'?90:170,color:'#E88AA5'}]});chosen=id;inspector(panel);render()}catch(e){toast(e.message)}decorSel.value=''};const tpl=el('button',t('templates'));tpl.onclick=openTemplates;const paper=el('input');paper.type='color';paper.value=getState().card.paper||'#fcfaf5';paper.setAttribute('aria-label',t('paperAria'));paper.onchange=()=>editCard({expectedRevision:snapshot().revision,paper:paper.value});const undo=el('button',t('undo'));undo.onclick=()=>{api.undo();inspector(panel)};const out=el('button',t('exportCard'),'primary');out.onclick=exportCard;const upload=el('button',t('importImage'));upload.onclick=openLibrary;const addGroup=el('div',null,'card-action-group'),finishGroup=el('div',null,'card-action-group');const paperLabel=el('label',null,'card-paper');paperLabel.append(el('span',t('paperAria')),paper);addGroup.append(text,select,decorSel,tpl,upload);finishGroup.append(paperLabel,undo,out);actions.append(addGroup,finishGroup);const stage=el('div',null,'card-stage');stage.append(surface);work.append(stage,panel);const warn=el('p');warn.id='card-warning';body.append(actions,work,warn);inspector(panel);const pt=e=>{const r=surface.getBoundingClientRect();return {x:(e.clientX-r.left)*1200/r.width,y:(e.clientY-r.top)*900/r.height}};surface.onpointerdown=e=>{const p=pt(e),all=cardElements();const o=all.sort((a,b)=>b.depth-a.depth).find(o=>{const r=-o.angle*Math.PI/180,dx=p.x-o.x-o.w/2,dy=p.y-o.y-o.h/2;return Math.abs(dx*Math.cos(r)-dy*Math.sin(r))<=o.w/2&&Math.abs(dx*Math.sin(r)+dy*Math.cos(r))<=o.h/2});chosen=o?.id||null;inspector(panel);render();if(o){moving={p,o:structuredClone(o),all:cardElements()};surface.setPointerCapture(e.pointerId)}};surface.onpointermove=e=>{if(!moving)return;const p=pt(e),o=cardElements().find(o=>o.id===chosen);if(!o)return;const next=moving.all.map(x=>x.id===chosen?{...x,x:Math.max(-1200,Math.min(1200,moving.o.x+p.x-moving.p.x)),y:Math.max(-900,Math.min(900,moving.o.y+p.y-moving.p.y))}:x);getState().card.elements=next;drawCard(surface,true)};surface.onpointerup=()=>{if(!moving)return;const next=cardElements(),before=moving.all;getState().card.elements=before;moving=null;commit(()=>{getState().card.elements=next;getState().cardEdited=true;syncLegacy(getState())},'card_drag');inspector(panel)};surface.onpointercancel=()=>{if(moving){getState().card.elements=moving.all;moving=null;render()}};render()});$('#modal').classList.add('wide-card')}
 function exportCard(){const c=document.createElement('canvas');drawCard(c);c.toBlob(b=>b&&download(b,'心意贺卡.png'))}
 function openLibrary(){modal(t('libTitle'),body=>{body.append(el('p',t('libIntro')));const name=el('input');name.placeholder=t('assetName');name.setAttribute('aria-label',t('assetName'));const category=el('select');category.setAttribute('aria-label',t('assetCat'));for(const [id,label] of [['flowers','catFlowers'],['wrap','catWrap'],['extras','catExtras'],['card','catCard']]){const o=el('option',t(label));o.value=id;category.append(o)}const role=el('select');role.setAttribute('aria-label',t('assetRole'));const roles={flowers:['花材','叶材'],wrap:['花器','包装'],extras:['饰品'],card:['卡片图片','纸张纹理']};const roleLabel={'花材':'roleFlower','叶材':'roleLeaf','包装':'roleWrap','花器':'roleVase','饰品':'roleAcc','卡片图片':'roleCardImg','纸张纹理':'rolePaper'};const updateRoles=()=>{role.replaceChildren();for(const value of roles[category.value]){const op=el('option',t(roleLabel[value]));op.value=value;role.append(op)}};category.onchange=updateRoles;updateRoles();const url=el('input');url.placeholder=t('urlPh');url.setAttribute('aria-label',t('urlPh'));const source=el('input');source.placeholder=t('sourcePh');source.setAttribute('aria-label',t('sourcePh'));const file=el('input');file.type='file';file.accept='image/png,image/jpeg,image/webp';file.setAttribute('aria-label',t('uploadAria'));file.style.display='none';const fileName=el('small');const pickBtn=el('button',t('chooseImage'));pickBtn.onclick=()=>file.click();file.onchange=()=>{fileName.textContent=file.files[0]?.name||''};const pickRow=el('div',null,'file-pick');pickRow.append(file,pickBtn,fileName);const save=el('button',t('addToLibrary'),'primary'),status=el('p');save.onclick=async()=>{save.disabled=true;status.textContent=t('importing');try{let image=url.value;if(file.files[0]){if(file.files[0].size>8000000)throw Error(t('errImageSize'));image=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file.files[0])})}const r=await importAsset({name:name.value,category:category.value,role:role.value,image,sourcePage:source.value});status.textContent=t('savedDot')+(r.warning||t('usable'));list()}catch(e){status.textContent=e.message}finally{save.disabled=false}};const grid=el('div',null,'personal-assets');const list=()=>{grid.replaceChildren();const mine=catalog.filter(a=>a.custom);if(!mine.length){const empty=el('div',null,'empty-state');empty.append(el('span','✿','empty-icon'),el('strong',t('emptyTitle')),el('p',t('emptyBody')));grid.append(empty)}for(const a of mine){const row=el('div'),im=el('img');im.src=a.data;im.alt=a.name;const use=el('button',t('addToBouquet'));use.disabled=a.category==='card';use.onclick=()=>{api.addAsset(a.id);$('#modal').close()};const cardUse=el('button',t('useForCard'));cardUse.onclick=openEditor;row.append(im,el('span',a.name),use,cardUse);if(a.sourcePage){const link=el('a',t('source'));link.href=a.sourcePage;link.target='_blank';link.rel='noopener noreferrer';row.append(link)}grid.append(row)}};const backup=el('button',t('backupLibrary'));backup.onclick=()=>download(new Blob([JSON.stringify({format:'flora-library-v1',assets:catalog.filter(a=>a.custom)})],{type:'application/json'}),'我的花艺素材库.json');const restore=el('input');restore.type='file';restore.accept='.json';restore.setAttribute('aria-label',t('restoreLibAria'));restore.style.display='none';const restoreName=el('small');const restoreBtn=el('button',t('restoreLibrary'));restoreBtn.onclick=()=>restore.click();const restoreRow=el('div',null,'file-pick');restoreRow.append(restore,restoreBtn,restoreName);restore.onchange=async()=>{restoreName.textContent=restore.files[0]?.name||'';try{if(restore.files[0].size>80000000)throw Error(t('errBackupSize'));const bundle=JSON.parse(await restore.files[0].text());if(bundle.format!=='flora-library-v1')throw Error(t('errNotLibBackup'));await restoreBundle(bundle);status.textContent=t('libRestored');list();api.refreshLibrary()}catch(e){status.textContent=e.message}};body.append(name,category,role,url,source,pickRow,save,status,backup,restoreRow,grid);list()})}
 const elementProps={id:{type:'string'},type:{type:'string',enum:['text','image','decor']},text:{type:'string'},asset:{type:'string'},kind:{type:'string',enum:DECOR_KINDS.map(([k])=>k)},x:{type:'number'},y:{type:'number'},w:{type:'number'},h:{type:'number'},angle:{type:'number'},depth:{type:'number'},fontSize:{type:'number'},font:{type:'string',enum:Object.keys(FONT_STACKS)},color:{type:'string'},stroke:{type:'string'},rainbow:{type:'boolean'},align:{type:'string',enum:['left','center','right']},lineHeight:{type:'number'}};
 const tools=[{name:'get_asset_requirements',description:'读取素材导入规范及搜索建议。Agent 使用自己的网页搜索工具找图，然后调用 import_asset；本工具不执行搜索。 EN: Read asset import rules and search guidance. The agent searches the web with its own tools, then calls import_asset; this tool does not search.',read:true,schema:{},run:()=>({formats:['PNG','JPEG','WebP'],maxBytes:8000000,input:'HTTPS 图片直链（必须支持跨域），或图片 data URL。跨域失败由 Agent 下载或上传，不代理绕过。 EN: HTTPS direct image URL (CORS-enabled) or an image data URL. On CORS failure the agent downloads or uploads the file itself; no proxying.',categories:['flowers','wrap','extras','card'],roles:['花材','叶材','包装','花器','饰品','卡片图片','纸张纹理'],guidance:'优先独立透明背景素材。填写来源网页和授权信息；网页图片不是天然可商用。花器提供归一化瓶口 anchor，花材提供茎末端 anchor。整束参考照作为卡片图片，不冒充独立花材。 EN: Prefer standalone transparent-background assets. Always fill in source page and license; web images are not automatically commercial-safe. Vases need a normalized mouth anchor, flowers a stem-end anchor. Whole-bouquet reference photos go in as card images, not fake standalone stems.',storage:'当前浏览器 IndexedDB；可导出素材库备份或随作品携带。 EN: IndexedDB of the current browser; exportable as a library backup or bundled with projects.'})},{name:'import_asset',description:'把用户要求的网上或生成的图片导入个人素材库，保存实际图片供离线编辑；不自动加入花束。 EN: Import an online or generated image into the personal library, storing the actual image for offline editing; it is not added to the bouquet automatically.',schema:{name:{type:'string'},category:{type:'string',enum:['flowers','wrap','extras','card']},role:{type:'string'},image:{type:'string'},sourcePage:{type:'string'},license:{type:'string'},anchor:{type:'object',properties:{x:{type:'number'},y:{type:'number'}},required:['x','y'],additionalProperties:false}},required:['name','category','image'],run:importAsset},{name:'get_card_state',description:'读取贺卡1200×900坐标、全部文字图片装饰元素、当前模板、锁定及布局警告。 EN: Read the 1200×900 card coordinates, all text/image/decoration elements, current template, locks and layout warnings.',read:true,schema:{},run:readCard},{name:'list_card_templates',description:'读取可用贺卡模板(id、名称、版式说明),配合 apply_card_design 的 template 参数一键应用整套版式。 EN: List available card templates (id, name, layout note); apply one via the template parameter of apply_card_design.',read:true,schema:{},run:()=>TEMPLATES.map(t=>({id:t.id,name:t.name,nameEn:t.nameEn,note:t.note,noteEn:t.noteEn,elements:t.elements.length}))},{name:'apply_card_design',description:'批量编辑贺卡文字排版、素材图片与装饰元素;template 参数可整体应用贺卡模板。x/y是元素左上角；图片可引用内置或导入素材。一次提交可撤销；遵守 revision。 EN: Batch-edit card text layout, images and decorations; the template parameter applies a full card template. x/y is the element top-left; images may reference built-in or imported assets. Each commit is one undoable step; revision is enforced.',schema:{expectedRevision:{type:'integer'},template:{type:'string',enum:TEMPLATES.map(t=>t.id)},paper:{type:'string'},updates:{type:'array',items:{type:'object',properties:elementProps,required:['id'],additionalProperties:false}},additions:{type:'array',items:{type:'object',properties:elementProps,required:['type','x','y','w','h'],additionalProperties:false}},removeIds:{type:'array',items:{type:'string'}}},required:['expectedRevision'],run:editCard}];
 function templateCard(id,texts={}){
 const t=TEMPLATES.find(t=>t.id===id);if(!t)return null;
 const elements=tplElementsFor(t).map(e=>({angle:0,depth:20,locked:false,...e})),g=document.createElement('canvas').getContext('2d');
 for(const o of elements){
  if(o.type==='image'){const sp=sprites[o.asset];if(sp){const scale=Math.min(o.w/sp.width,o.h/sp.height);const w=sp.width*scale,h=sp.height*scale;o.x+=(o.w-w)/2;o.y+=(o.h-h)/2;o.w=w;o.h=h}continue}
  if(o.type!=='text')continue;
  const key={'card-title':'title','card-body':'body','card-sign':'sign'}[o.id];if(key&&texts[key]!==undefined)o.text=String(texts[key]);
  if(o.id==='card-title'&&/[A-Za-z]/.test(o.text))o.fontSize=58;
  while(o.fontSize>12&&layoutText(g,o).length*o.fontSize*o.lineHeight+8>o.h)o.fontSize-=1;
 }
 return {paper:t.paper,template:id,elements,...legacyFields(elements)}
 }
 // 判断贺卡是否仍为某模板的标准产物(忽略文字内容与高度——文字来自预设文案,高度可能自适应)
 function isTemplateProduct(card){if(!card.elements)return false;const FIELDS=['id','type','kind','x','y','w','angle','depth','fontSize','font','color','stroke','rainbow','align','lineHeight','asset'];
 return TEMPLATES.some(t=>{if((card.paper||'#fcfaf5').toLowerCase()!==t.paper.toLowerCase())return false;if(card.elements.length!==t.elements.length)return false;return card.elements.every((o,i)=>{const e=t.elements[i];return FIELDS.every(f=>o[f]===e[f]||(o[f]===undefined&&e[f]===undefined))})})}
 return {cardImage:()=>{const c=document.createElement('canvas');drawCard(c);return c.toDataURL('image/png')},templateCard,isTemplateProduct,syncLegacy,tools,render,openEditor,openLibrary,exportCard,validateElements,cardElements,restoreBundle,assetsFor,metadata,isDragging:()=>!!moving,backup:()=>({format:'flora-bundle-v1',scene:structuredClone(getState()),assets:assetsFor(getState())})};
}
