import {festivalPresets} from './festival-presets.js';
const names=['花园玫瑰·正面','花园玫瑰·侧开','花园玫瑰·斜侧','花园玫瑰·花苞','洋桔梗·正面','洋桔梗·侧面','白郁金香','白郁金香·斜侧','粉芍药','芍药·半开','白绣球','粉康乃馨','白百合','粉红掌','白马蹄莲','黄色洋牡丹'];
const sprigNames=['圆叶尤加利','细枝尤加利','白蜡花','满天星','蕨叶','橄榄枝','白飞燕草','垂穗苋'];
const extraNames=['奶油蕾丝包装','象牙白丝带','珍珠垂链','粉色蝴蝶结','透纱蕾丝','牛皮纸包装','奶油陶瓷瓶','草编花篮'];
const catalog=[...names.map((name,i)=>({id:'f'+i,name,sheet:'flowers',index:i,category:'flowers',role:i<4?'主花':i>=8?'主花':'配花'})),...sprigNames.map((name,i)=>({id:'s'+i,name,sheet:'sprigs',index:i,category:'flowers',role:i===2||i===3||i===6?'配花':'叶材'})),...extraNames.map((name,i)=>({id:'e'+i,name,sheet:'extras',index:i,category:[0,4,5,6,7].includes(i)?'wrap':'extras',role:[0,4,5].includes(i)?'包装':[6,7].includes(i)?'花器':'饰品'}))];
const expandedFlowers={
'flowers-b':['红玫瑰','白玫瑰','紫玫瑰','珊瑚玫瑰','酒红大丽花','蜜桃大丽花','粉洋牡丹','白洋牡丹','橙洋牡丹','向日葵','白雏菊','黄非洲菊','橙非洲菊','紫洋桔梗','粉洋桔梗','蓝绣球'],
'flowers-c':['紫绣球','绿绣球','粉百合','橙百合','白蝴蝶兰','紫蝴蝶兰','粉蝴蝶兰','黄马蹄莲','酒红马蹄莲','绿红掌','红红掌','天堂鸟','白山茶','粉山茶','白菊','粉菊'],
'flowers-d':['矢车菊','紫松虫草','粉波斯菊','白波斯菊','蓝黑种草','红银莲花','白银莲花','紫银莲花','橙罂粟','粉香豌豆','紫香豌豆','帝王花','棉花','干莲蓬','蒲苇','金球花']};
Object.entries(expandedFlowers).forEach(([sheet,list])=>list.forEach((name,index)=>catalog.push({id:'f'+sheet.slice(-1)+index,name,sheet,index,category:'flowers',role:'花材'})));
const accessorySheets={'accessories-b':['粉纱蝴蝶','蕾丝蝴蝶','银色蝴蝶胸针','单颗珍珠','三颗珍珠','水钻星星','水钻爱心','字母 A 吊饰','字母 M 吊饰','迷你信封','粉色吊牌','封蜡贴','奶油小熊','白兔玩偶','针织爱心','白羽毛'],'accessories-c':['鼠尾草丝带','酒红丝绒结','黑色丝带','格纹蝴蝶结','麻绳结','金色卷带','银色卷带','奶蓝丝带','松果','干橙片','肉桂束','贝壳','樱桃吊饰','蕾丝扇饰','薄纱花边','单股垂珠']};
Object.entries(accessorySheets).forEach(([sheet,list])=>list.forEach((name,index)=>catalog.push({id:'e'+sheet.slice(-1)+index,name,sheet,index,category:'extras',role:'饰品'})));
['粉雾包装','鼠尾草包装','墨黑包装','奶蓝包装','酒红包装','象牙薄纱包装','棉麻包装','奶油褶纸包装','铜色陶瓶','哑黑陶瓶','透明玻璃瓶','小藤编篮','薰衣草丝带','蕾丝长尾结','银色珍珠胸针','迷你卷轴'].forEach((name,index)=>catalog.push({id:'en'+index,name,sheet:'finishing',index,category:index<12?'wrap':'extras',role:index<8?'包装':index<12?'花器':'饰品'}));

const byId=id=>catalog.find(a=>a.id===id),isFlower=id=>byId(id)?.category==='flowers';let images={},sprites={},state,selected=null;const camera={x:500,y:525,zoom:1};const backgrounds={stone:['','#dddcd7'],ivory:['','#f5f2eb'],dark:['','#333a33']};
function dimensions(o){const sp=sprites[o.asset];return {w:o.w,h:sp?o.w*sp.height/sp.width:o.w}}
function drawObject(c,o,shadow=true){const sp=sprites[o.asset];if(!sp)return;const {w,h}=dimensions(o);c.save();c.translate(o.x,o.y);c.rotate(o.angle*Math.PI/180);if(shadow){c.shadowColor=isFlower(o.asset)?'rgba(55,44,27,.18)':'rgba(55,44,27,.12)';c.shadowBlur=isFlower(o.asset)?14:9;c.shadowOffsetX=4;c.shadowOffsetY=7;}c.drawImage(sp,-w/2,-h/2,w,h);c.restore()}
function drawScene(c,selection=true){const bg=backgrounds[state.bg][1];c.fillStyle=bg;c.fillRect(0,0,1000,1050);c.save();c.translate(500,525);c.scale(camera.zoom,camera.zoom);c.translate(-camera.x,-camera.y);c.save();c.translate(525,979);c.scale(1,.17);const sh=c.createRadialGradient(0,0,4,0,0,270);sh.addColorStop(0,'#54482b27');sh.addColorStop(1,'#54482b00');c.fillStyle=sh;c.fillRect(-280,-280,560,560);c.restore();
 const sorted=[...state.objects].sort((a,b)=>a.depth-b.depth);
 sorted.filter(o=>o.depth<=0).forEach(o=>drawObject(c,o));
 // Resolve the insertion point from the actual vessel or sleeve, including rotation.
 const localPoint=(o,u,v)=>{const {w,h}=dimensions(o),r=o.angle*Math.PI/180,dx=(u-.5)*w,dy=(v-.5)*h;return {x:o.x+dx*Math.cos(r)-dy*Math.sin(r),y:o.y+dx*Math.sin(r)+dy*Math.cos(r)}};
 for(const slot of [1,2,3]){const objs=sorted.filter(o=>(o.slot||1)===slot);if(!objs.length)continue;
 const container=objs.find(o=>byId(o.asset).role==='花器')||objs.find(o=>byId(o.asset).role==='包装'&&o.depth<=0);
 const vessel=container&&byId(container.asset).role==='花器';
 const root=container?localPoint(container,byId(container.asset).anchor?.x??.5,byId(container.asset).anchor?.y??(vessel?.09:.74)):state.slotAnchors[1];
 for(const o of objs.filter(o=>byId(o.asset).category==='flowers')){
  const anchors={s0:[.52,.98],s1:[.35,.98],s2:[.47,.98],s3:[.42,.98],s4:[.5,.98],s5:[.40,.98],s6:[.47,.98],s7:[.22,.8],fc0:[.74,.97],fc1:[.54,.97],fc2:[.44,.97],fc3:[.45,.97],fc4:[.48,.93],fc5:[.55,.93],fc6:[.49,.93],fc7:[.48,.95],fc8:[.49,.92],fc9:[.36,.9],fc10:[.4,.88],fc11:[.6,.92],fc12:[.56,.86],fc13:[.67,.8],fc14:[.52,.85],fc15:[.48,.87]};const uv=byId(o.asset).anchor?[byId(o.asset).anchor.x,byId(o.asset).anchor.y]:anchors[o.asset]||[.5,.89];const tip=localPoint(o,...uv);
  const sx=o.tx??root.x+(vessel?0:(o.x-root.x)*.025),sy=o.ty??root.y;
  const dx=tip.x-sx,dy=tip.y-sy;
  c.save();c.beginPath();c.moveTo(sx,sy);
  c.quadraticCurveTo(o.cx??sx+dx*.32,o.cy??sy+dy*.5,tip.x,tip.y);
  c.strokeStyle=o.asset.startsWith('s')?'#626b45':'#718052';c.lineWidth=o.asset.startsWith('s')?2.3:3.4;c.lineCap='round';c.stroke();c.restore();
 }}
 // Draw the lower/front sleeve over stems, before blooms, so stems enter the wrap.
 for(const o of sorted.filter(o=>o.depth<=0&&(byId(o.asset).category==='wrap'&&byId(o.asset).role!=='花器'&&!['e6','e7'].includes(o.asset)))){const sp=sprites[o.asset];if(!sp)continue;const {w,h}=dimensions(o);c.save();c.translate(o.x,o.y);c.rotate(o.angle*Math.PI/180);c.beginPath();c.rect(-w/2,-h*.22,w,h*.72);c.clip();c.drawImage(sp,-w/2,-h/2,w,h);c.restore()}
 sorted.filter(o=>o.depth>0).forEach(o=>drawObject(c,o));
 if(selection&&selected){const o=state.objects.find(o=>o.id===selected);if(o){const{w,h}=dimensions(o);c.save();c.translate(o.x,o.y);c.rotate(o.angle*Math.PI/180);c.strokeStyle=o.locked?'#a67d56':'#6e8059';c.lineWidth=1.5;c.setLineDash([5,5]);c.strokeRect(-w/2-6,-h/2-6,w+12,h+12);if(!o.locked){c.setLineDash([]);c.strokeStyle='#6e8059';c.fillStyle='#fffefa';c.lineWidth=2;c.beginPath();c.moveTo(0,-h/2-6);c.lineTo(0,-h/2-30);c.stroke();for(const [hx,hy,name] of [[0,-h/2-30,'rotate'],[w/2+6,h/2+6,'scale']]){c.beginPath();c.arc(hx,hy,hoverHandle===name?10:7,0,7);c.fill();c.stroke()}c.strokeStyle='#6e8059';c.beginPath();c.arc(0,-h/2-30,3.8,Math.PI*.35,Math.PI*1.9);c.stroke();const ex=3.8*Math.cos(Math.PI*1.9),ey=-h/2-30+3.8*Math.sin(Math.PI*1.9);c.beginPath();c.moveTo(ex+.7,ey+2.6);c.lineTo(ex,ey);c.lineTo(ex-2.3,ey+.8);c.stroke();const sx=w/2+6,sy=h/2+6;c.beginPath();c.moveTo(sx-3.2,sy+3.2);c.lineTo(sx+3.2,sy-3.2);c.moveTo(sx+.4,sy-3.2);c.lineTo(sx+3.2,sy-3.2);c.lineTo(sx+3.2,sy-.4);c.moveTo(sx-3.2,sy+.4);c.lineTo(sx-3.2,sy+3.2);c.lineTo(sx-.4,sy+3.2);c.stroke()}c.restore()}}c.restore()}
function cleanCellSprite(g,w,h){
 const im=g.getImageData(0,0,w,h),d=im.data,rowA=new Float64Array(h),colA=new Float64Array(w);let total=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=d[(y*w+x)*4+3];if(a>=28){total++;rowA[y]++;colA[x]++}}
 if(!total)return;
 const GAP=6;
 const stripCut=arr=>{if(arr[0]<=0)return -1;let alpha=0,rows=0,gap=0;
  for(let i=0;i<arr.length;i++){if(arr[i]>0){alpha+=arr[i];rows++;gap=0;continue}
   if(++gap>=GAP){let above=false;for(let k=i+1;k<arr.length;k++)if(arr[k]>0){above=true;break}
    return above&&rows<=arr.length*.25&&alpha<=total*.12?i-gap+1:-1}}
  return -1};
 const rev=a=>[...a].reverse();
 const eraseRows=(y0,y1)=>{for(let y=y0;y<y1;y++)for(let x=0;x<w;x++)d[(y*w+x)*4+3]=0};
 const eraseCols=(x0,x1)=>{for(let y=0;y<h;y++)for(let x=x0;x<x1;x++)d[(y*w+x)*4+3]=0};
 const b=stripCut(rev(rowA)),tt=stripCut(rowA),r=stripCut(rev(colA)),l=stripCut(colA);
 if(b<0&&tt<0&&r<0&&l<0)return;
 if(b>=0)eraseRows(h-b,h);if(tt>=0)eraseRows(0,tt);if(r>=0)eraseCols(w-r,w);if(l>=0)eraseCols(0,l);
 g.putImageData(im,0,0);
}
function cleanWrapSprite(g,w,h){ const im=g.getImageData(0,0,w,h),d=im.data,seen=new Uint8Array(w*h),parts=[];
 for(let n=0;n<w*h;n++){if(seen[n]||d[n*4+3]<28)continue;const part=[],queue=[n];seen[n]=1;for(let k=0;k<queue.length;k++){const j=queue[k];part.push(j);const x=j%w,y=Math.floor(j/w);for(const q of [x>0?j-1:-1,x<w-1?j+1:-1,y>0?j-w:-1,y<h-1?j+w:-1])if(q>=0&&!seen[q]&&d[q*4+3]>=28){seen[q]=1;queue.push(q)}}parts.push(part)}
 const largest=Math.max(0,...parts.map(p=>p.length));for(const part of parts)if(part.length<largest*.015)for(const n of part)d[n*4+3]=0;g.putImageData(im,0,0);
}
async function load(){try{await Promise.all([...new Set(catalog.filter(a=>!a.custom).map(a=>a.sheet))].map(key=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve()};im.onerror=()=>reject(Error(key+' 加载失败'));im.src='../../assets/'+key+'.webp'})));for(const a of catalog){if(a.custom){sprites[a.id]=await assetSprite(a);continue}const im=images[a.sheet],rows=a.sheet==='sprigs'||a.sheet==='extras'?2:4;let xb=[0,.25,.5,.75,1],yb=rows===2?[0,.5,1]:[0,.25,.5,.75,1];if(a.sheet==='accessories-b'){xb=[0,.29,.54,.79,1];yb=[0,.285,.49,.70,1]}if(a.sheet==='accessories-c')yb=[0,.27,.55,.74,1];if(a.sheet==='finishing')yb=[0,.265,.52,.745,1];const col=a.index%4,row=Math.floor(a.index/4),sx=im.width*xb[col],sy=im.height*yb[row],sw=im.width*(xb[col+1]-xb[col]),sh=im.height*(yb[row+1]-yb[row]);const c=document.createElement('canvas');c.width=Math.floor(sw);c.height=Math.floor(sh);const g=c.getContext('2d');g.drawImage(im,sx,sy,sw,sh,0,0,c.width,c.height);if(a.category==='wrap')cleanWrapSprite(g,c.width,c.height);cleanCellSprite(g,c.width,c.height);sprites[a.id]=c}showAll();}catch(e){document.body.textContent='花材未能加载，请刷新重试：'+e.message}}
// 三连帧断言:连续绘制三帧后画布变换必须回到单位矩阵(相机零累积位移),且 camera 不被绘制改写。
function testCameraDrift(){const before={...camera};const c=document.createElement('canvas');c.width=1000;c.height=1050;const g=c.getContext('2d');const read=()=>{const m=g.getTransform();return [m.a,m.b,m.c,m.d,m.e,m.f]};for(let i=0;i<3;i++)drawScene(g,false);const m=read();const pass=m.every((v,i)=>v===[1,0,0,1,0,0][i])&&before.x===camera.x&&before.y===camera.y&&before.zoom===camera.zoom;return {pass,transform:m,camera:{...camera}}}

function showAll(){for(const p of festivalPresets){state={...p,slotAnchors:{1:p.tie}};const box=document.createElement('section'),h=document.createElement('h2'),cv=document.createElement('canvas');h.textContent=p.title;cv.width=1000;cv.height=1050;box.append(h,cv);document.querySelector('main').append(box);drawScene(cv.getContext('2d'),false)}}load();