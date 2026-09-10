import {restoreLibrary,assetSprite,createCoDesign} from './co-design.js?v=9';
import {createFestivalDesigns,festivalTitles} from './festival-presets.js?v=1';
import {t,getLang,applyI18n,onLangChange} from './i18n.js?v=2';
let co;
let loginUser=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clone=o=>JSON.parse(JSON.stringify(o));
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
catalog.push(...await restoreLibrary());
/* ---- 素材英文名(显示层):数据层 id/中文名不变,英文界面按此映射显示 ---- */
const EN_FLOWERS=['Garden Rose · Front','Garden Rose · Side','Garden Rose · Tilted','Garden Rose · Bud','Lisianthus · Front','Lisianthus · Side','White Tulip','White Tulip · Tilted','Pink Peony','Peony · Half Open','White Hydrangea','Pink Carnation','White Lily','Pink Anthurium','White Calla','Yellow Ranunculus'];
const EN_SPRIGS=['Round Eucalyptus','Slender Eucalyptus','White Waxflower',"Baby's Breath",'Fern','Olive Branch','White Delphinium','Trailing Amaranth'];
const EN_EXTRAS=['Cream Lace Wrap','Ivory Ribbon','Pearl Drape','Pink Bow','Sheer Lace','Kraft Wrap','Cream Ceramic Vase','Wicker Basket'];
const EN_BY_SHEET={'flowers-b':['Red Rose','White Rose','Purple Rose','Coral Rose','Wine Dahlia','Peach Dahlia','Pink Ranunculus','White Ranunculus','Orange Ranunculus','Sunflower','White Daisy','Yellow Gerbera','Orange Gerbera','Purple Lisianthus','Pink Lisianthus','Blue Hydrangea'],'flowers-c':['Purple Hydrangea','Green Hydrangea','Pink Lily','Orange Lily','White Phalaenopsis','Purple Phalaenopsis','Pink Phalaenopsis','Yellow Calla','Wine Calla','Green Anthurium','Red Anthurium','Bird of Paradise','White Camellia','Pink Camellia','White Chrysanthemum','Pink Chrysanthemum'],'flowers-d':['Cornflower','Purple Scabiosa','Pink Cosmos','White Cosmos','Nigella','Red Anemone','White Anemone','Purple Anemone','Orange Poppy','Pink Sweet Pea','Purple Sweet Pea','King Protea','Cotton Boll','Dried Lotus Pod','Pampas Grass','Golden Pom'],'accessories-b':['Pink Tulle Butterfly','Lace Butterfly','Silver Butterfly Pin','Single Pearl','Triple Pearls','Crystal Star','Crystal Heart','Letter A Charm','Letter M Charm','Mini Envelope','Pink Tag','Wax Seal Sticker','Cream Teddy','White Bunny','Knit Heart','White Feather'],'accessories-c':['Sage Ribbon','Burgundy Velvet Bow','Black Ribbon','Plaid Bow','Twine Bow','Gold Curl Ribbon','Silver Curl Ribbon','Baby Blue Ribbon','Pine Cone','Dried Orange Slice','Cinnamon Bundle','Seashell','Cherry Charm','Lace Fan','Tulle Trim','Pearl Strand'],'finishing':['Pink Mist Wrap','Sage Wrap','Black Wrap','Baby Blue Wrap','Burgundy Wrap','Ivory Tulle Wrap','Cotton Linen Wrap','Cream Pleated Wrap','Copper Vase','Matte Black Vase','Glass Vase','Small Wicker Basket','Lavender Ribbon','Lace Long Bow','Silver Pearl Pin','Mini Scroll']};
for(const a of catalog){const en=a.sheet==='flowers'?EN_FLOWERS[a.index]:a.sheet==='sprigs'?EN_SPRIGS[a.index]:a.sheet==='extras'?EN_EXTRAS[a.index]:EN_BY_SHEET[a.sheet]?.[a.index];if(en)a.nameEn=en}
const assetName=a=>getLang()==='en'?(a?.nameEn||a?.name||''):(a?.name||'');
const byId=id=>catalog.find(a=>a.id===id);
const isFlower=id=>byId(id)?.category==='flowers';
const backgrounds={ivory:['bgIvory','#f5f2eb'],sage:['bgSage','#e0e5da'],pink:['bgPink','#f0e3e2'],stone:['bgStone','#dddcd7'],dark:['bgDark','#333a33'],mooncream:['bgMooncream','#f8f0dc'],night:['bgNight','#242b47'],festive:['bgFestive','#56262b']};
const TITLES={...festivalTitles,cream:['给她的新开始','A New Beginning for Her'],green:['留一份自在','Room to Breathe'],pink:['把温柔送给你','Tenderness for You'],sunny:['愿你明亮如初','Bright as Ever'],pearl:['一份纯白的心意','A Pure White Thought'],linear:['直线之间','Between Straight Lines'],tropic:['热带体量','Tropical Volume'],wild:['野外手记','Field Notes'],vintage:['旧时光','Old Times'],pop:['晴天撞色','Sunny Clash'],zen:['一枝知秋','One Stem of Autumn'],'sunny-teacher':['谢师恩 · 桃李向阳','Teachers’ Day · Sunward Blooms'],'blush-vow':['囍宴 · 粉雾手捧','Wedding Feast · Pink Mist'],'moon-gold':['中秋 · 月满金秋','Mid-Autumn · Golden Harvest'],'autumn-ode':['秋日叙 · 焦糖时光','Autumn Ode · Caramel Hours'],'crimson-blessing':['重阳 · 福寿绵长','Double Ninth · Blessings'],'christmas-hearth':['圣诞 · 炉边来客','Christmas · Hearthside'],'duanwu-breeze':['端午 · 青风入夏','Dragon Boat · Summer Breeze'],'qixi-nocturne':['七夕 · 夜色来信','Qixi · Night Letter'],'newyear-lantern':['春节 · 灯火初上','Spring Festival · Lanterns Aglow'],'valentine-99':['绯红誓言','Crimson Devotion'],'graduation-day':['一路生花','Bloom Into Your Future'],'christmas-carol':['圣诞颂歌','A Carol of Roses']};
const enText=str=>{const m=String(str||'').split(/EN[:：]/);return m.length>1?m[1].trim():str};
const BASE_CARD_EN={title:'To New Beginnings',body:'May you grow freely and run toward the life you love.',sign:''};
const BASE_CARD_ZH={title:'给新的开始',body:'愿你自在生长，奔赴喜欢的生活。',sign:''};
function presetCardPair(preset){const d=designs[preset];const zh=d?.card||( ['cream','green','pink','sunny','pearl'].includes(preset)?BASE_CARD_ZH:null);const en=d?.cardEn||(['cream','green','pink','sunny','pearl'].includes(preset)?BASE_CARD_EN:null);return zh&&en?{zh,en}:null}
// 未修改过的预设贺卡:数据不动,显示层按界面语言出 cardEn 版本(与 displayTitle 同一思路)。
// 部分修改过的贺卡:逐元素映射——仍等于预设默认文案的元素(title/body/sign)显示对应语言版本。
function displayCard(){const s=state;if(getLang()!=='en'||!co)return s.card;
 const en=designs[s.preset]?.cardEn||(['cream','green','pink','sunny','pearl'].includes(s.preset)?BASE_CARD_EN:null);
 if(en&&s.card.template&&cardFollowsPreset(s)){const tc=co.templateCard(s.card.template,en);if(tc)return {...s.card,...tc}}
 const pair=presetCardPair(s.preset);if(!pair)return s.card;
 const map={title:[pair.zh.title,pair.en.title],body:[pair.zh.body,pair.en.body],sign:[pair.zh.sign,pair.en.sign]};
 const out={...s.card};
 if(Array.isArray(s.card.elements))out.elements=s.card.elements.map(e=>{const m=map[e.id?.replace('card-','')];return m&&e.text===m[0]?{...e,text:m[1]}:e});
 if(map.title&&s.card.title===map.title[0])out.title=map.title[1];
 if(map.body&&s.card.body===map.body[0])out.body=map.body[1];
 if(map.sign&&s.card.sign===map.sign[0])out.sign=map.sign[1];
 return out}
function displayTitle(){const pt=TITLES[state.preset];return pt&&(state.title===pt[0]||state.title===pt[1])?(getLang()==='en'?pt[1]:pt[0]):state.title}
const canvas=$('#scene'),ctx=canvas.getContext('2d');let images={},sprites={},selected=null,drag=null,gesture=null,tab='flowers',undoStack=[],redoStack=[],revision=Date.now(),events=[],assetReady=false,agentConnected=false;
let seq=1;const item=(asset,x,y,w,angle=0,depth=20,extra)=>({id:'o'+seq++,asset,x,y,w,angle,depth,locked:false,...extra});
const designs={...createFestivalDesigns(item),
 'newyear-lantern':{bg:'ivory',title:'春节 · 灯火初上',cardTemplate:'fireworks-party',tie:{x:505,y:850},card:{title:'新岁有光',body:'愿新的一年，日子热气腾腾，心里常有盼头。',sign:'',style:'ivory'},cardEn:{title:'Light for the New Year',body:'May the new year be warm and full of things to look forward to.',sign:''},notes:'橙色洋牡丹与红掌如错落灯火，金球花点出亮色；宽展的酒红包装承接向两侧展开的花团。 EN: Orange ranunculus and anthurium stagger like lantern lights, golden poms spark the highlights; the wide burgundy wrap holds the blooms spreading to both sides.',objects:()=>[
  item('en4',505,724,535,0,0),
  item('s5',333,430,210,-48,3,{tx:501,ty:805,cx:433,cy:691}),
  item('s5',669,480,195,54,3,{tx:508,ty:811,cx:574,cy:697}),
  item('fc10',422,356,190,-25,9,{tx:515,ty:817,cx:466,cy:681}),
  item('fc10',635,424,181,32,10,{tx:495,ty:799,cx:561,cy:690}),
  item('fd15',535,344,140,8,11,{tx:502,ty:805,cx:508,cy:680}),
  item('fb8',405,459,224,-22,17,{tx:509,ty:811,cx:476,cy:695}),
  item('fb12',534,425,192,8,15,{tx:516,ty:817,cx:508,cy:690}),
  item('fb8',601,523,228,23,21,{tx:496,ty:799,cx:549,cy:703}),
  item('fb12',339,537,185,-38,19,{tx:503,ty:805,cx:436,cy:705}),
  item('fb8',471,560,251,-8,24,{tx:510,ty:811,cx:500,cy:708}),
  item('fc10',659,589,156,42,25,{tx:517,ty:817,cx:554,cy:712}),
  item('fb8',400,635,170,-24,27,{tx:497,ty:799,cx:474,cy:718}),
  item('fd15',570,636,126,18,28,{tx:504,ty:805,cx:521,cy:718}),
  item('fd15',330,455,116,-33,16,{tx:511,ty:811,cx:448,cy:694}),
  item('ec5',556,833,95,15,61)
 ]},
 'qixi-nocturne':{bg:'stone',title:'七夕 · 夜色来信',cardTemplate:'letter-style',tie:{x:505,y:850},card:{title:'只写给你',body:'人海很大，幸好我们认出了彼此。今天，也想把喜欢说给你听。',sign:'',style:'ivory'},cardEn:{title:'Only for You',body:'The world is vast, yet we found each other. Today I want to say I like you out loud.',sign:''},notes:'酒红大丽花构成低重心，紫色洋桔梗与马蹄莲向左上方舒展；墨黑纸与细银带，让浓郁色彩保持安静。 EN: Wine dahlias form a low heart, purple lisianthus and callas stretch up and left; black paper with a thin silver band keeps the rich colors quiet.',objects:()=>[
  item('en2',501,720,490,0,0),
  item('s1',355,433,190,-28,3,{tx:501,ty:805,cx:442,cy:691}),
  item('s1',646,514,170,44,3,{tx:508,ty:811,cx:565,cy:702}),
  item('fc8',383,345,183,-18,9,{tx:515,ty:817,cx:452,cy:680}),
  item('fc8',465,404,164,-4,10,{tx:495,ty:799,cx:498,cy:688}),
  item('fb13',360,464,164,-29,13,{tx:502,ty:805,cx:443,cy:695}),
  item('fb2',523,440,178,13,14,{tx:509,ty:811,cx:520,cy:692}),
  item('fb4',433,516,252,-16,20,{tx:516,ty:817,cx:470,cy:702}),
  item('fb4',584,551,232,19,22,{tx:496,ty:799,cx:542,cy:707}),
  item('fb13',643,481,156,33,18,{tx:503,ty:805,cx:548,cy:698}),
  item('fb2',343,570,169,-31,21,{tx:510,ty:811,cx:453,cy:709}),
  item('fb2',506,628,190,8,25,{tx:517,ty:817,cx:497,cy:717}),
  item('fd1',632,633,129,33,27,{tx:497,ty:799,cx:560,cy:717}),
  item('fb13',405,647,151,-19,26,{tx:504,ty:805,cx:460,cy:719}),
  item('fd1',581,382,115,15,12,{tx:511,ty:811,cx:541,cy:685}),
  item('ec6',521,844,81,8,61)
 ]},
 'duanwu-breeze':{bg:'ivory',title:'端午 · 青风入夏',cardTemplate:'oriental-vertical',tie:{x:505,y:850},card:{title:'一夏安康',body:'把清风装进这束花，愿你自在舒展，一夏安康。',sign:'',style:'ivory'},cardEn:{title:'A Healthy Summer',body:'A breeze tucked into this bouquet — may you stretch freely and stay well all summer.',sign:''},notes:'绿绣球、白马蹄莲与蕨叶构成清爽的白绿组合。高低错落的线条留在顶部，花团在棉麻包装口聚拢；以清绿表达安康，不冒充艾草或菖蒲。 EN: Green hydrangeas, white callas and ferns make a crisp white-green set. Staggered lines stay on top, blooms gather at the linen mouth; clear green for health, not pretending to be mugwort or calamus.',objects:()=>[
  item('en6',505,725,475,0,0),
  item('s4',351,444,232,-32,3,{tx:501,ty:805,cx:440,cy:693}),
  item('s5',629,422,220,30,3,{tx:508,ty:811,cx:559,cy:690}),
  item('s4',630,571,173,55,4,{tx:515,ty:817,cx:543,cy:709}),
  item('f14',430,332,170,-13,9,{tx:495,ty:799,cx:485,cy:678}),
  item('f14',547,399,170,17,10,{tx:502,ty:805,cx:513,cy:687}),
  item('fc1',415,492,244,-16,15,{tx:509,ty:811,cx:480,cy:699}),
  item('fc1',582,533,237,22,18,{tx:516,ty:817,cx:525,cy:704}),
  item('f14',353,542,165,-33,19,{tx:496,ty:799,cx:457,cy:705}),
  item('f14',607,446,144,28,17,{tx:503,ty:805,cx:535,cy:693}),
  item('fc12',492,461,167,-3,20,{tx:510,ty:811,cx:508,cy:695}),
  item('fc12',461,588,191,-12,24,{tx:517,ty:817,cx:481,cy:711}),
  item('f5',574,622,160,20,25,{tx:497,ty:799,cx:539,cy:716}),
  item('f5',384,623,143,-24,25,{tx:504,ty:805,cx:452,cy:716}),
  item('s2',505,347,135,2,4,{tx:511,ty:811,cx:513,cy:680}),
  item('ec4',503,844,79,0,61)
 ]},
 'christmas-hearth':{bg:'sage',title:'圣诞 · 炉边来客',cardTemplate:'vintage-stamp',tie:{x:505,y:850},card:{title:'愿你被温暖围绕',body:'窗外是冬天，屋里有花、有笑声，也有留给你的位置。',sign:'',style:'ivory'},cardEn:{title:'Warmth Around You',body:'Winter outside; inside there are flowers, laughter, and a place kept for you.',sign:''},notes:'奶白棉花与红玫瑰组成松软的冬日花团，低位蕨叶和尤加利衬出红白对比；牛皮纸、松果和格纹结保留手作礼物的温度。 EN: Cream cotton and red roses make a soft winter mound, low ferns and eucalyptus set off the red-white contrast; kraft paper, a pine cone and a plaid bow keep the handmade warmth.',objects:()=>[
  item('e5',505,718,500,0,0),
  item('s4',351,442,225,-38,3,{tx:501,ty:805,cx:440,cy:692}),
  item('s4',648,473,213,42,3,{tx:508,ty:811,cx:566,cy:696}),
  item('s0',489,354,175,4,3,{tx:515,ty:817,cx:491,cy:681}),
  item('fd12',414,408,174,-22,11,{tx:495,ty:799,cx:479,cy:688}),
  item('fd12',582,420,174,20,12,{tx:502,ty:805,cx:525,cy:690}),
  item('fb0',488,448,205,-6,16,{tx:509,ty:811,cx:507,cy:693}),
  item('fb0',366,517,191,-27,19,{tx:516,ty:817,cx:446,cy:702}),
  item('fb0',618,529,197,28,20,{tx:496,ty:799,cx:555,cy:704}),
  item('fd12',507,548,197,8,23,{tx:503,ty:805,cx:498,cy:706}),
  item('fb0',434,619,183,-17,25,{tx:510,ty:811,cx:487,cy:715}),
  item('fd12',616,620,150,24,26,{tx:517,ty:817,cx:538,cy:716}),
  item('fd12',335,589,146,-30,24,{tx:497,ty:799,cx:450,cy:712}),
  item('fb0',552,638,175,13,27,{tx:504,ty:805,cx:514,cy:718}),
  item('ec8',367,650,85,-25,58),
  item('ec3',508,842,116,0,61)
 ]},
 linear:{bg:'stone',title:'直线之间',cardTemplate:'mono-statement',tie:{x:455,y:895},card:{title:'一切顺利',body:'话不必多，一句就够：向前，别回头。',sign:'',style:'ivory'},cardEn:{title:'All the Best',body:'Few words needed, just one: forward, never back.',sign:''},notes:'以马蹄莲与飞燕草的竖向线条搭建骨架，花材向一侧偏置，留出大片空白——像建筑立面，克制而确定。墨黑包装收住所有向下的杂线。 EN: Callas and delphinium draw a vertical skeleton, stems offset to one side with open space left — like a facade, restrained and certain. The black wrap gathers every stray downward line.',objects:()=>[item('en2',505,685,395,0,0),item('s1',455,335,290,-14,3,{tx:492,ty:752,cx:428,cy:520}),item('s6',548,300,270,6,4,{tx:502,ty:758,cx:562,cy:520}),item('s6',618,390,215,24,5,{tx:516,ty:768,cx:592,cy:545}),item('s0',360,498,225,-38,6,{tx:480,ty:782,cx:348,cy:645}),item('s1',640,486,225,52,6,{tx:526,ty:786,cx:664,cy:628}),item('f14',435,365,168,-16,13,{tx:478,ty:748,cx:418,cy:558}),item('f14',520,428,172,8,14,{tx:506,ty:742,cx:546,cy:568}),item('f14',398,475,150,-22,15,{tx:482,ty:768,cx:384,cy:608}),item('fc7',585,488,148,14,16,{tx:522,ty:762,cx:602,cy:612}),item('f14',492,528,172,-8,17,{tx:498,ty:752,cx:452,cy:638}),item('fc7',380,560,142,-24,18,{tx:476,ty:782,cx:358,cy:678}),item('f14',562,575,158,18,19,{tx:520,ty:772,cx:586,cy:658}),item('fc9',382,668,135,-42,20,{tx:472,ty:798,cx:392,cy:735}),item('ec6',520,853,88,5,61)]},
 tropic:{bg:'dark',title:'热带体量',cardTemplate:'speech-bubble',tie:{x:490,y:655},card:{title:'活得热烈',body:'不做陪衬，不做背景，大大方方地盛开。',sign:'',style:'ivory'},cardEn:{title:'Live Boldly',body:'No supporting role, no backdrop — bloom out loud.',sign:''},notes:'天堂鸟向上拔起，帝王花压住重心，红掌穿插其间，高低落差与体量对比是这束的全部语言。哑黑陶瓶让颜色自己说话。 EN: Bird of paradise reaches up, protea anchors the weight, anthurium threads between — height and mass are the whole language here. The matte black vase lets the colors speak.',objects:()=>[item('en9',505,826,325,0,55),item('s4',350,544,350,-48,3),item('s4',665,521,345,52,4),item('s0',620,392,260,28,5),item('fc11',432,282,255,-17,8),item('fc11',585,363,250,16,9),item('fc9',325,464,195,-35,10),item('fc10',650,466,215,28,11),item('fd11',457,475,260,-9,15),item('fc10',565,570,218,18,18),item('fc9',358,610,183,-35,19),item('fd11',445,606,186,-10,20)]},
 wild:{bg:'sage',title:'野外手记',cardTemplate:'pastel-floral',card:{title:'去野吧',body:'不修剪、不驯服，风把你吹成什么样，就是什么样。',sign:'',style:'ivory'},cardEn:{title:'Go Wild',body:'No pruning, no taming — however the wind shapes you, that is you.',sign:''},notes:'草穗四散、花枝松散不对称，矢车菊与波斯菊像随手从路边采的。棉麻和麻绳不包装它，只是暂时拢住它。 EN: Grasses scatter, stems loose and asymmetric, cornflowers and cosmos as if picked by the road. Linen and twine do not wrap it — they only hold it for now.',objects:()=>[item('en6',495,742,420,-5,0),item('fd14',356,314,290,-28,3),item('fd14',629,349,270,34,4),item('s5',290,488,265,-49,5),item('s5',721,511,240,51,5),item('s2',418,375,230,-14,6),item('s3',600,458,245,28,7),item('fd0',359,416,152,-21,12),item('fd2',508,359,164,12,13),item('fd3',586,455,164,16,14),item('fd8',446,477,173,-17,15),item('fd4',664,508,151,31,16,{tx:518,ty:740,cx:680,cy:630}),item('fd2',322,544,158,-28,17,{tx:482,ty:742,cx:310,cy:640}),item('fd3',508,563,181,10,18,{tx:498,ty:742,cx:520,cy:660}),item('fd0',408,610,148,-16,19,{tx:488,ty:748,cx:400,cy:680}),item('fd9',626,603,160,20,20,{tx:512,ty:748,cx:640,cy:675}),item('fd8',546,655,153,15,21,{tx:505,ty:755,cx:560,cy:695}),item('s2',358,654,210,-30,23,{tx:485,ty:760,cx:350,cy:700}),item('ec4',489,870,113,-5,61)]},
 vintage:{bg:'dark',title:'旧时光',cardTemplate:'vintage-stamp',card:{title:'敬旧时光',body:'浓烈过，沉淀过，剩下的都是值得留的。',sign:'',style:'ivory'},cardEn:{title:'To Old Times',body:'Burned bright, settled slow — what remains is worth keeping.',sign:''},notes:'酒红大丽花与紫蝴蝶兰叠出低重心的深色层次，蜜桃大丽花是暗部里的一点暖光。酒红丝绒结把整束收进旧电影的气氛里。 EN: Wine dahlias and purple phalaenopsis layer a low, dark center of gravity; a peach dahlia is one warm note in the shadow. A burgundy velvet bow seals it like an old film.',objects:()=>[item('en4',510,778,430,3,0),item('s0',304,429,245,-40,3),item('s5',690,409,270,38,4),item('fc5',612,336,235,24,9),item('fc8',377,370,175,-20,10),item('fc8',710,507,173,31,11),item('fc13',482,387,171,-10,12),item('fb4',400,481,248,-17,15),item('fb5',578,457,233,12,16),item('fc5',688,578,195,33,17),item('fb4',532,590,261,9,20),item('fb5',345,614,198,-24,21),item('fc12',430,673,150,-10,22),item('fc8',636,655,159,22,23),item('ec1',501,875,135,4,61)]},
 pop:{bg:'ivory',title:'晴天撞色',cardTemplate:'rainbow-marker',card:{title:'今天开心',body:'理由不需要大，天气好、花开了，都算数。',sign:'',style:'ivory'},cardEn:{title:'Happy Today',body:'Reasons need not be big — good weather and open flowers count.',sign:''},notes:'黄与橙的非洲菊、洋牡丹撞在白雏菊之间，花数刻意减少、间距拉大、角度放开——热闹但不拥挤，一颗向日葵点睛。 EN: Yellow and orange gerberas and ranunculus collide among white daisies — fewer stems, wider spacing, looser angles: lively but never crowded, one sunflower as the finishing touch.',objects:()=>[item('en3',500,783,420,-3,0),item('s2',360.7,419.3,220,-25,4,{tx:500,ty:820,cx:430.3,cy:700}),item('s2',638.5,443.0,218,30,5,{tx:500,ty:820,cx:569.2,cy:700}),item('fb9',494.0,391.2,197,0,10,{tx:500,ty:820,cx:497.0,cy:700}),item('fb11',377.9,456.7,190,-20,12,{tx:500,ty:820,cx:438.9,cy:700}),item('fb12',611.8,462.5,205,20,13,{tx:500,ty:820,cx:555.9,cy:700}),item('fb10',488.0,476.9,155,5,15,{tx:500,ty:820,cx:494.0,cy:700}),item('fb8',420.9,551.8,200,-12,16,{tx:500,ty:820,cx:460.4,cy:700}),item('f15',555.9,545.3,199,13,17,{tx:500,ty:820,cx:528.0,cy:700}),item('fb10',336.6,566.9,143,-28,18,{tx:500,ty:820,cx:418.3,cy:700}),item('fb11',650.5,571.9,174,25,19,{tx:500,ty:820,cx:575.2,cy:700}),item('fb10',494.0,618.0,149,0,20,{tx:500,ty:820,cx:497.0,cy:700}),item('ec3',497,873,120,-3,61)]},
 zen:{bg:'stone',title:'一枝知秋',cardTemplate:'oriental-vertical',tie:{x:490,y:688},card:{title:'清安',body:'一枝便是一季。愿你安静，也愿你丰盛。',sign:'',style:'ivory'},cardEn:{title:'Quiet Peace',body:'One stem is a whole season. May you be calm, and may you be full.',sign:''},notes:'主花只取一两朵，橄榄枝的走势才是画面主体；大片留白不是空，是呼吸。铜色陶瓶压住下方，花枝从瓶口向上生长。 EN: Only one or two blooms; the olive branch is the real subject. The wide blank is not emptiness — it is breathing room. A copper vase grounds the bottom as stems grow up from its mouth.',objects:()=>[item('en8',519,838,276,0,55),item('s5',417,380,354,-33,3),item('s5',625,460,290,43,4),item('s1',494,275,200,-7,2),item('fc14',488,479,161,-12,14),item('fc12',572,616,137,22,16)]},
'sunny-teacher':{bg:'ivory',title:'谢师恩 · 桃李向阳',cardTemplate:'oriental-vertical',tie:{x:505,y:890},card:{title:'送给老师',body:'您讲过的每一句话，都在我身上发了芽。桃李满园，师恩如山。',sign:'',style:'ivory'},cardEn:{title:'To My Teacher',body:'Every word you taught has sprouted in me. Students everywhere; a debt deep as mountains.',sign:''},notes:'教师节感恩束：一朵大向日葵居中向阳，小朵环绕如学生围绕，雏菊与白蜡花填空，牛皮纸麻绳结守住朴素。EN: A Teachers’ Day bouquet — one big sunflower facing the sun with smaller ones around it like students, daisies and waxflowers filling in, kraft paper and twine keeping it humble.',objects:()=>[
  item('e5',505,714,490,0,0),
  item('s0',339,409,205,-43,3,{tx:503,ty:807,cx:433,cy:694}),
  item('s0',647,416,195,42,3,{tx:510,ty:812,cx:568,cy:695}),
  item('s2',411,353,150,-17,4,{tx:517,ty:817,cx:460,cy:687}),
  item('s2',622,442,145,26,4,{tx:499,ty:802,cx:558,cy:698}),
  item('fb9',429,418,224,-20,13,{tx:506,ty:807,cx:467,cy:695}),
  item('fb9',586,425,200,18,14,{tx:513,ty:812,cx:545,cy:696}),
  item('fb9',507,510,265,-4,21,{tx:520,ty:817,cx:497,cy:706}),
  item('fb9',387,549,183,-28,22,{tx:502,ty:802,cx:469,cy:711}),
  item('fb9',625,549,175,23,23,{tx:509,ty:807,cx:542,cy:711}),
  item('fb10',514,369,113,5,16,{tx:516,ty:812,cx:517,cy:689}),
  item('fb10',350,448,104,-28,17,{tx:498,ty:817,cx:437,cy:699}),
  item('fb10',650,465,100,30,18,{tx:505,ty:802,cx:569,cy:701}),
  item('fb10',437,611,113,-15,25,{tx:512,ty:807,cx:470,cy:718}),
  item('fb10',572,602,115,13,26,{tx:519,ty:812,cx:539,cy:717}),
  item('fb10',514,646,102,-3,27,{tx:501,ty:817,cx:499,cy:723}),
  item('ec4',502,838,85,0,61)
 ]},
'blush-vow':{bg:'pink',title:'囍宴 · 粉雾手捧',cardTemplate:'vine-frame',tie:{x:505,y:900},card:{title:'给新人',body:'从此一屋两人，三餐四季，皆是浪漫。佳偶天成，百年好合。',sign:'',style:'pink'},cardEn:{title:'To the Newlyweds',body:'From now on: one home, two people, three meals, four seasons — all romance. A match made in heaven.',sign:''},notes:'红粉抱抱桶：正红玫瑰为主，花园玫瑰与酒红大丽花过渡层次，蝴蝶兰与粉百合放大体量，红掌点睛，雏菊波斯菊添活，垂穗苋与尤加利垂坠收边——红粉浓郁，上宽下窄。EN: A crimson-pink hug bucket — red roses lead, garden roses and wine dahlias bridge the tones, phalaenopsis and pink lilies carry the volume, anthurium accents, daisies and cosmos lighten, amaranth and eucalyptus trail off the sides.',objects:()=>[
  item('en4',505,770,470,0,0),
  item('s1',350,430,200,-38,3,{tx:498,ty:845,cx:430,cy:660}),
  item('s1',660,440,195,40,3,{tx:512,ty:845,cx:580,cy:665}),
  item('s7',352,625,200,-42,6,{tx:498,ty:850,cx:440,cy:740}),
  item('fc6',325,475,225,-28,32,{tx:495,ty:840,cx:430,cy:660}),
  item('fc4',685,475,225,28,33,{tx:515,ty:840,cx:580,cy:660}),
  item('fb0',400,420,200,-15,16,{tx:500,ty:845,cx:475,cy:640}),
  item('fb0',505,390,210,0,17,{tx:505,ty:845,cx:508,cy:620}),
  item('fb0',610,420,200,14,18,{tx:510,ty:845,cx:540,cy:640}),
  item('f0',350,545,180,-20,29,{tx:496,ty:850,cx:455,cy:690}),
  item('f1',660,545,180,20,30,{tx:514,ty:850,cx:555,cy:690}),
  item('f1',515,465,195,2,21,{tx:505,ty:845,cx:506,cy:660}),
  item('fb0',455,520,205,-6,22,{tx:502,ty:850,cx:490,cy:680}),
  item('fb0',555,515,205,8,23,{tx:508,ty:850,cx:522,cy:680}),
  item('fc2',420,565,230,-12,34,{tx:500,ty:850,cx:480,cy:700}),
  item('fc10',635,625,175,20,35,{tx:514,ty:855,cx:555,cy:740}),
  item('fb4',430,610,215,-10,26,{tx:500,ty:855,cx:480,cy:720}),
  item('fb4',580,615,215,10,27,{tx:510,ty:855,cx:530,cy:720}),
  item('fb10',395,665,120,-15,28,{tx:497,ty:858,cx:465,cy:750}),
  item('fb10',545,690,115,10,29,{tx:508,ty:858,cx:520,cy:760}),
  item('fd2',465,700,130,-8,30,{tx:502,ty:860,cx:490,cy:770}),
  item('fd2',600,705,130,12,31,{tx:512,ty:860,cx:540,cy:770}),
  item('e2',520,600,125,6,63)
 ]},
'moon-gold':{bg:'mooncream',title:'中秋 · 月满金秋',cardTemplate:'oriental-vertical',tie:{x:505,y:890},card:{title:'月圆人团圆',body:'月亮在变圆，我在回家的路上了。花好月圆，阖家安康。',sign:'',style:'ivory'},cardEn:{title:'Full Moon, Full Hearts',body:'The moon is waxing round, and I am on my way home. Blooming flowers, full moon, peace for all.',sign:''},notes:'暖秋丰收花篮：天堂鸟与橙黄马蹄莲挑起两侧线条，蜜桃大丽花与金球花结成主花球，粉洋牡丹、红银莲花点缀，绿白绣球填空，干橙片作秋收果子，矮圆藤篮横向展开——丰盛而不乱。EN: An autumn-harvest basket — birds of paradise and yellow callas lift the sides, peach dahlias and golden poms form the mounds, ranunculus and anemones accent, green and white hydrangeas fill, dried orange slices as harvest fruit, all in a low wide wicker basket.',objects:()=>[
  item('en11',505,770,400,0,55),
  item('s4',320,540,260,-42,3,{tx:494,ty:700,cx:415,cy:625}),
  item('s0',690,555,225,44,3,{tx:516,ty:700,cx:595,cy:630}),
  item('fc11',355,320,255,-15,8,{tx:490,ty:695,cx:440,cy:510}),
  item('fc11',425,275,230,9,9,{tx:494,ty:695,cx:468,cy:490}),
  item('fc7',630,415,195,16,10,{tx:514,ty:695,cx:565,cy:550}),
  item('fc7',675,475,180,28,11,{tx:518,ty:695,cx:580,cy:580}),
  item('fd15',620,545,140,12,15,{tx:512,ty:700,cx:552,cy:620}),
  item('fd15',388,580,135,-10,16,{tx:494,ty:700,cx:455,cy:635}),
  item('fd5',655,632,150,14,58,{tx:516,ty:705,cx:565,cy:655}),
  item('fd5',345,687,145,-16,58,{tx:490,ty:705,cx:440,cy:680}),
  item('fc1',595,677,180,10,60,{tx:514,ty:708,cx:540,cy:680}),
  item('fb5',440,500,220,-8,20,{tx:497,ty:700,cx:482,cy:600}),
  item('fb5',550,465,230,6,21,{tx:508,ty:700,cx:522,cy:585}),
  item('fb5',495,565,210,-3,22,{tx:503,ty:705,cx:500,cy:625}),
  item('fb14',570,622,165,8,59,{tx:511,ty:710,cx:530,cy:650}),
  item('fb14',420,662,160,-6,59,{tx:497,ty:710,cx:472,cy:668}),
  item('fc1',475,697,190,0,60,{tx:500,ty:712,cx:493,cy:690}),
  item('f10',525,732,180,-4,62,{tx:505,ty:715,cx:510,cy:710}),
  item('ec9',425,735,76,12,63),
  item('ec9',625,725,70,-10,63)
 ]},
'autumn-ode':{bg:'mooncream',title:'秋日叙 · 焦糖时光',cardTemplate:'vintage-stamp',tie:{x:505,y:895},card:{title:'秋天的问候',body:'秋天的第一束花，比第一杯奶茶久一点。愿所有美好，都如期而至。',sign:'',style:'ivory'},cardEn:{title:'Autumn Greetings',body:'Autumn’s first bouquet lasts longer than its first milk tea. May every good thing arrive on time.',sign:''},notes:'秋日焦糖油画感：粉玫瑰与蜜桃大丽花做暖调主体，橙洋牡丹点焦糖色，尤加利挑高，干莲蓬收住季节。EN: A caramel-toned autumn painting — garden roses and peach dahlias as the warm core, orange ranunculus for caramel notes, eucalyptus reaching up, dried lotus pods sealing the season.',objects:()=>[
  item('e5',505,720,500,0,0),
  item('s0',345,399,205,-44,3,{tx:503,ty:807,cx:435,cy:693}),
  item('s0',562,350,177,16,2,{tx:510,ty:812,cx:536,cy:687}),
  item('s0',661,468,183,51,3,{tx:517,ty:817,cx:555,cy:701}),
  item('fb8',386,410,159,-26,11,{tx:499,ty:802,cx:469,cy:694}),
  item('fb5',482,409,205,-8,12,{tx:506,ty:807,cx:487,cy:694}),
  item('f3',582,440,175,17,14,{tx:513,ty:812,cx:543,cy:698}),
  item('fb8',635,503,157,30,17,{tx:520,ty:817,cx:545,cy:705}),
  item('f0',406,499,205,-22,19,{tx:502,ty:802,cx:476,cy:705}),
  item('fb5',543,513,217,8,21,{tx:509,ty:807,cx:510,cy:707}),
  item('f3',356,553,154,-33,22,{tx:516,ty:812,cx:457,cy:711}),
  item('f0',635,577,167,29,22,{tx:498,ty:817,cx:545,cy:714}),
  item('fb8',450,595,167,-11,25,{tx:505,ty:802,cx:493,cy:716}),
  item('f0',546,619,187,13,26,{tx:512,ty:807,cx:512,cy:719}),
  item('fb5',374,619,145,-26,25,{tx:519,ty:812,cx:464,cy:719}),
  item('fb8',590,386,126,20,10,{tx:501,ty:817,cx:528,cy:691}),
  item('fd13',335,497,97,-35,8,{tx:508,ty:802,cx:449,cy:705}),
  item('fd13',634,637,97,24,27,{tx:515,ty:807,cx:545,cy:721}),
  item('ec4',505,848,87,0,61)
 ]},
'crimson-blessing':{bg:'mooncream',title:'重阳 · 福寿绵长',cardTemplate:'to-blessing',tie:{x:505,y:890},card:{title:'福寿安康',body:'九九重阳，愿您健康久久，快乐久久。福如东海，松鹤延年。',sign:'',style:'ivory'},cardEn:{title:'Health and Longevity',body:'On Double Ninth, may your health and joy run long — fortune vast as the sea, years like pines and cranes.',sign:''},notes:'重阳敬长辈：饱满正红圆束隆重登场，红掌与蝴蝶兰挑高点睛，酒红包装配金带，禧红底色衬出喜庆。EN: A Double Ninth bouquet for elders — a full crimson dome, anthurium and phalaenopsis as accents, wine-red wrap with a gold ribbon on a festive red stage.',objects:()=>[
  item('en4',505,715,510,0,0),
  item('s1',342,435,180,-39,3,{tx:503,ty:807,cx:434,cy:697}),
  item('s1',655,445,175,40,3,{tx:510,ty:812,cx:571,cy:698}),
  item('fc10',419,369,163,-22,11,{tx:517,ty:817,cx:463,cy:689}),
  item('fc6',593,393,163,23,12,{tx:499,ty:802,cx:547,cy:692}),
  item('fc10',601,469,164,24,15,{tx:506,ty:807,cx:532,cy:701}),
  item('fb0',452,448,219,-14,17,{tx:513,ty:812,cx:494,cy:699}),
  item('fb0',561,445,202,10,18,{tx:520,ty:817,cx:517,cy:698}),
  item('fb0',365,532,183,-30,20,{tx:502,ty:802,cx:461,cy:709}),
  item('fb0',630,549,181,28,21,{tx:509,ty:807,cx:544,cy:711}),
  item('fb0',478,539,226,-9,23,{tx:516,ty:812,cx:504,cy:710}),
  item('fb0',558,601,198,14,25,{tx:498,ty:817,cx:516,cy:717}),
  item('fb0',409,612,182,-21,26,{tx:505,ty:802,cx:478,cy:718}),
  item('f11',335,579,105,-35,16,{tx:512,ty:807,cx:431,cy:714}),
  item('f11',652,607,106,30,17,{tx:519,ty:812,cx:570,cy:718}),
  item('f11',477,658,116,-8,28,{tx:501,ty:817,cx:485,cy:724}),
  item('ec5',557,800,75,12,60),
  item('ec1',502,842,114,0,61)
 ]},
'valentine-99':{bg:'dark',title:'绯红誓言',cardTemplate:'letter-style',tie:{x:505,y:890},card:{title:'玫瑰会谢，爱你不会。',body:'',sign:'',style:'dark'},cardEn:{title:'Roses are red, my heart is yours.',body:'',sign:''},notes:'正红玫瑰层叠成束：顶部、中环、外环花头齐平，满天星碎点围边，深绿尤加利贴球缘打底；墨黑包装多角外张，黑色丝带收束——经典告白球。EN: A dense dome of red roses — level heads in top, middle and outer rings, baby’s breath sprinkled around the edge, dark eucalyptus tucked at the rim; black wrap flaring in angles, finished with a black ribbon.',objects:()=>[
  item('en2',505,760,520,0,0),
  item('s0',318,520,200,-40,8,{tx:496,ty:845,cx:420,cy:690}),
  item('s0',692,520,195,40,8,{tx:514,ty:845,cx:590,cy:690}),
  item('fb0',445,370,165,-8,20,{tx:500,ty:845,cx:480,cy:600}),
  item('fb0',505,350,175,2,21,{tx:505,ty:845,cx:506,cy:590}),
  item('fb0',565,370,165,10,20,{tx:510,ty:845,cx:530,cy:600}),
  item('fb0',400,460,180,-15,24,{tx:498,ty:850,cx:465,cy:650}),
  item('fb0',505,470,190,0,26,{tx:505,ty:850,cx:506,cy:660}),
  item('fb0',610,460,180,14,24,{tx:512,ty:850,cx:545,cy:650}),
  item('fb0',450,510,170,-5,25,{tx:502,ty:852,cx:488,cy:680}),
  item('fb0',560,510,170,7,25,{tx:508,ty:852,cx:522,cy:680}),
  item('fb0',345,560,185,-20,28,{tx:496,ty:855,cx:450,cy:700}),
  item('fb0',505,590,185,3,30,{tx:505,ty:855,cx:506,cy:720}),
  item('fb0',665,560,185,20,28,{tx:514,ty:855,cx:560,cy:700}),
  item('fb0',410,630,172,-8,29,{tx:500,ty:858,cx:475,cy:730}),
  item('fb0',600,630,172,9,29,{tx:510,ty:858,cx:535,cy:730}),
  item('s3',350,430,120,-30,33,{tx:497,ty:850,cx:445,cy:640}),
  item('s3',660,430,115,28,33,{tx:513,ty:850,cx:565,cy:640}),
  item('s3',505,645,110,0,34,{tx:505,ty:858,cx:506,cy:740}),
  item('ec2',505,830,130,0,61)
 ]},
'graduation-day':{bg:'ivory',title:'一路生花',cardTemplate:'cute-bubble',tie:{x:505,y:890},card:{title:'一路生花',body:'毕业不是结束，是闪闪发光的开始。',sign:'',style:'ivory'},cardEn:{title:'Bloom On',body:'And so the adventure begins.',sign:''},notes:'单面扇形毕业束：向日葵作视觉中心偏上，白绣球与洋桔梗铺展，粉玫瑰柔和过渡，白雏菊点亮，满天星与细枝尤加利两侧展开；牛皮纸配金色卷带——向前途展开的一把。EN: A one-sided fan for graduation — sunflowers as the high focal point, white hydrangea and lisianthus spreading, pink roses softening, daisies sparkling, baby’s breath and eucalyptus fanning out both sides; kraft paper with a gold curl ribbon.',objects:()=>[
  item('e5',505,745,480,0,0),
  item('s1',330,500,200,-45,5,{tx:496,ty:828,cx:420,cy:670}),
  item('s1',705,525,195,48,5,{tx:514,ty:828,cx:595,cy:675}),
  item('s3',350,400,150,-32,6,{tx:498,ty:825,cx:445,cy:610}),
  item('s3',670,420,145,34,6,{tx:512,ty:825,cx:570,cy:615}),
  item('f4',380,450,155,-15,14,{tx:497,ty:828,cx:460,cy:640}),
  item('fb9',435,360,220,-14,15,{tx:502,ty:828,cx:490,cy:590}),
  item('fb9',590,390,205,18,16,{tx:508,ty:828,cx:525,cy:610}),
  item('f4',655,460,160,22,17,{tx:512,ty:830,cx:550,cy:645}),
  item('f4',520,480,150,-3,18,{tx:505,ty:830,cx:510,cy:655}),
  item('f10',430,520,190,-5,22,{tx:500,ty:835,cx:480,cy:680}),
  item('f1',610,560,175,10,23,{tx:512,ty:838,cx:545,cy:700}),
  item('f1',480,560,190,-6,24,{tx:504,ty:838,cx:498,cy:700}),
  item('fb10',390,590,120,-20,25,{tx:497,ty:840,cx:465,cy:715}),
  item('fb10',540,630,115,5,26,{tx:508,ty:842,cx:515,cy:730}),
  item('fb10',650,620,120,20,25,{tx:515,ty:840,cx:560,cy:725}),
  item('ec5',560,820,110,15,61)
 ]},
'christmas-carol':{bg:'festive',title:'圣诞颂歌',cardTemplate:'fireworks-party',tie:{x:505,y:890},card:{title:'雪花、炉火和你，都是冬天的礼物。',body:'圣诞快乐，岁岁平安',sign:'',style:'festive'},cardEn:{title:'Snow, hearth, and you — gifts of winter.',body:'Merry Christmas',sign:''},notes:'红金圣诞颂歌：正红玫瑰与红银莲花铺底，红掌点睛，棉花作雪、白雏菊作星，满天星细碎，深绿尤加利压边；酒红包装、丝绒结与金色卷带——比炉边来客更红金明亮。EN: A bright red-and-gold carol — red roses and anemones at the base, anthurium as the accent, cotton bolls for snow, daisies for stars, dark eucalyptus at the rim; burgundy wrap, velvet bow and a gold curl ribbon.',objects:()=>[
  item('en4',505,760,480,0,0),
  item('s0',340,540,190,-42,5,{tx:496,ty:840,cx:425,cy:690}),
  item('s0',670,550,185,44,5,{tx:514,ty:840,cx:590,cy:695}),
  item('s3',350,430,150,-30,6,{tx:498,ty:838,cx:445,cy:630}),
  item('s3',660,440,145,32,6,{tx:512,ty:838,cx:568,cy:635}),
  item('fb0',430,410,195,-12,16,{tx:500,ty:840,cx:478,cy:620}),
  item('fb0',520,380,200,3,17,{tx:505,ty:840,cx:510,cy:605}),
  item('fb0',610,420,190,15,18,{tx:512,ty:842,cx:540,cy:625}),
  item('fd5',370,500,150,-22,19,{tx:496,ty:845,cx:455,cy:670}),
  item('fd5',650,510,150,24,20,{tx:514,ty:845,cx:558,cy:675}),
  item('fb0',460,520,200,-5,23,{tx:502,ty:848,cx:490,cy:685}),
  item('fb0',570,520,195,8,24,{tx:508,ty:848,cx:525,cy:685}),
  item('fd5',490,565,155,0,22,{tx:505,ty:850,cx:506,cy:715}),
  item('fc10',595,600,150,12,26,{tx:514,ty:852,cx:550,cy:720}),
  item('fd12',400,620,120,-12,27,{tx:498,ty:855,cx:470,cy:730}),
  item('fd12',590,650,115,10,28,{tx:512,ty:855,cx:535,cy:740}),
  item('fb10',460,660,105,-6,29,{tx:502,ty:858,cx:490,cy:750}),
  item('fb10',545,690,100,8,30,{tx:508,ty:858,cx:515,cy:760}),
  item('ec5',590,810,95,12,60),
  item('ec1',505,835,120,0,61)
 ]},
};
function preset(key='cream'){
 const greens=[item('s0',240,365,245,-32,3),item('s1',755,320,230,35,3),item('s1',610,255,220,13,2),item('s2',390,300,200,-14,5),item('s3',780,490,180,55,7),item('s3',210,510,190,-48,7)];
 const blooms=[[1,340,380,190,-25,13],[6,445,260,100,-12,10],[7,640,300,120,10,11],[2,620,410,200,12,14],[3,765,405,135,26,12],[4,485,420,160,-4,18],[0,420,540,198,-13,24],[2,660,560,180,19,25],[5,535,560,158,5,26],[1,270,515,140,-30,19],[4,335,620,140,-25,28],[0,520,670,180,9,31],[5,720,640,145,26,29],[6,560,335,108,8,12],[11,570,470,135,18,20],[2,350,460,165,-12,21],[1,570,385,155,8,17],[4,650,490,155,15,23],[5,415,635,145,-12,30],[3,595,625,160,17,32]];
 let arr=[item('e0',505,650,680,0,0),...greens,...blooms.map(([a,x,y,w,r,z])=>item('f'+a,x,y,w,r,z)),item('s2',285,595,160,-43,22),item('s3',620,650,145,20,30),item('e2',550,842,98,-8,60),item('e1',490,875,235,0,61)];
 if(key==='green'){arr=arr.map(o=>o.asset.startsWith('f')?{...o,asset:['f4','f5','f6','f7','f14'][Number(o.asset.slice(1))%5],w:o.w*.88}:o);arr=arr.filter(o=>o.asset!=='e2');arr.find(o=>o.asset==='e0').asset='e5'}
 if(key==='sunny')arr=arr.map(o=>o.asset.startsWith('f')?{...o,asset:['fb9','fb10','fb11','f15','fb8'][Number(o.asset.slice(1))%5]}:o.asset==='e0'?{...o,asset:'e5'}:o);
 if(key==='pearl')arr=arr.map(o=>o.asset.startsWith('f')?{...o,asset:['f12','f14','fc4','f5'][Number(o.asset.slice(1))%4],w:o.w*.86}:o);
 if(key==='pink')arr=arr.map(o=>o.asset==='e1'?{...o,asset:'e3'}:o.asset.startsWith('f')&&Number(o.asset.slice(1))<4?{...o,asset:Number(o.asset.slice(1))%2?'f8':'f9'}:o);
 if(designs[key]){const d=designs[key];return {version:1,cardEdited:false,title:d.title,preset:key,bg:d.bg,...(d.tie?{tie:d.tie}:{}),objects:d.objects(),card:d.card,...(d.cardTemplate?{cardTemplate:d.cardTemplate}:{}),brief:'',notes:d.notes,...(d.cardEn?{cardEn:d.cardEn}:{}),requests:[]}}
 return {version:1,cardEdited:false,cardTemplate:({cream:'to-blessing',green:'watercolor-space',pink:'vine-frame',sunny:'fireworks-party',pearl:'letter-style'})[key],title:key==='sunny'?'愿你明亮如初':key==='pearl'?'一份纯白的心意':key==='green'?'留一份自在':key==='pink'?'把温柔送给你':'给她的新开始',preset:key,bg:'ivory',objects:arr,card:{title:'给新的开始',body:'愿你自在生长，奔赴喜欢的生活。',sign:'',style:'ivory'},cardEn:{title:'To New Beginnings',body:'May you grow freely and run toward the life you love.',sign:''},brief:'',notes:'粉白色表达温柔的祝福，向上舒展的花枝寄托对新生活的期待。这是本次搭配赋予的心意，花语会因文化与场合而不同。 EN: Soft pinks and whites carry a gentle blessing; upward stems hold hopes for a new beginning. Flower meanings vary by culture and occasion.',requests:[]};
}
/* ---- 无限画布相机:会话级,不进 undo 快照,localStorage 持久 ---- */
const camera={x:505,y:560,zoom:1};
let camBad=false;
try{const c=JSON.parse(localStorage.getItem('flora-camera-v2'));if(Number.isFinite(c?.x)&&Number.isFinite(c?.y)&&Number.isFinite(c?.zoom)&&c.zoom>=0.4&&c.zoom<=3)Object.assign(camera,c);else if(c!=null)camBad=true}catch(e){if(localStorage.getItem('flora-camera-v2')!=null)camBad=true}
function saveCam(){try{localStorage.setItem('flora-camera-v2',JSON.stringify(camera))}catch{}}
function contentBBox(){const os=state.objects;if(!os.length){const as=Object.values(state.slotAnchors||{});return as.length?{x0:Math.min(...as.map(a=>a.x))-240,x1:Math.max(...as.map(a=>a.x))+240,y0:200,y1:Math.max(...as.map(a=>a.y))+160}:{x0:0,x1:1000,y0:0,y1:1050}}let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;for(const o of os){const {w,h}=dimensions(o),r=o.angle*Math.PI/180,bw=Math.abs(w*Math.cos(r))+Math.abs(h*Math.sin(r)),bh=Math.abs(w*Math.sin(r))+Math.abs(h*Math.cos(r));x0=Math.min(x0,o.x-bw/2);x1=Math.max(x1,o.x+bw/2);y0=Math.min(y0,o.y-bh/2);y1=Math.max(y1,o.y+bh/2);if(o.tx!==undefined){x0=Math.min(x0,o.tx);x1=Math.max(x1,o.tx)}if(o.cx!==undefined){x0=Math.min(x0,o.cx);x1=Math.max(x1,o.cx)}if(o.ty!==undefined){y0=Math.min(y0,o.ty);y1=Math.max(y1,o.ty)}if(o.cy!==undefined){y0=Math.min(y0,o.cy);y1=Math.max(y1,o.cy)}}return {x0:x0-40,x1:x1+40,y0:y0-40,y1:y1+40}}
function fitCamera(anim=false){const b=contentBBox();const z=Math.max(.55,Math.min(1.6,Math.min(1000/(b.x1-b.x0),1050/(b.y1-b.y0))*.92)),cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;if(anim){flyTo(cx,cy,z)}else{camera.x=cx;camera.y=cy;camera.zoom=z;saveCam();drawScene(ctx)}}
function flyTo(tx,ty,tz){const sx=camera.x,sy=camera.y,sz=camera.zoom,t0=performance.now();const step=now=>{const k=Math.min(1,(now-t0)/320),e=1-(1-k)**3;camera.x=sx+(tx-sx)*e;camera.y=sy+(ty-sy)*e;camera.zoom=sz+(tz-sz)*e;drawScene(ctx);if(k<1)requestAnimationFrame(step);else saveCam()};requestAnimationFrame(step)}
let state=preset();try{const s=JSON.parse(localStorage.getItem('flora-current'));validateScene(s);if(s.cardEdited===undefined)s.cardEdited=true;state=s;}catch{}
function mergeSlots(s){s.activeSlot=1;mergeSlots.migrated=false;const anchors=s.slotAnchors&&typeof s.slotAnchors==='object'?s.slotAnchors:{};const multiRemnant=s.objects.some(o=>o.slot>=2)||anchors[2]!=null||anchors[3]!=null;if(s.objects.length&&multiRemnant){const xs=s.objects.map(o=>o.x);if(Math.max(...xs)-Math.min(...xs)>1000){mergeSlots.migrated=true;try{localStorage.setItem('flora-legacy-backup',JSON.stringify({savedAt:Date.now(),scene:clone(s)}))}catch{}const p=preset('cream');s.objects=clone(p.objects).map(o=>({...o,slot:1}));s.preset='cream';s.slotAnchors={1:{x:505,y:890}};return s}}s.slotAnchors={1:(anchors[1]&&Number.isFinite(anchors[1].x)&&Number.isFinite(anchors[1].y))?anchors[1]:{x:505,y:890}};for(const o of s.objects)o.slot=1;return s}
function migratedToast(){toast(t('tMigrated')+(getLang()==='en'?' Your previous wide arrangement was backed up in this browser (localStorage key flora-legacy-backup).':' 原宽构图作品已备份到本浏览器 localStorage「flora-legacy-backup」，需要时可恢复。'))}
mergeSlots(state);
if(mergeSlots.migrated){try{localStorage.removeItem('flora-camera-v2');localStorage.setItem('flora-current',JSON.stringify(state))}catch{}}
seq=Math.max(seq,...state.objects.map(o=>Number(o.id.slice(1))+1));
function signal(type,detail={}){events.push({revision:++revision,type,...detail});events=events.slice(-100)}
function saveStatusText(){return t(loginUser?'syncedLocal':'savedLocal')}
const setStatus=txt=>{const e=$('#save-status');if(e)e.textContent=txt};
function persist(){try{localStorage.setItem('flora-current',JSON.stringify(state));setStatus(saveStatusText())}catch{setStatus(t('saveFail'))}}
function commit(fn,type='edit'){const before=clone(state);undoStack.push(before);undoStack=undoStack.slice(-70);redoStack=[];fn();syncAttachments(before);signal(type);persist();render();}

function syncAttachments(before){for(const o of state.objects){if(!o.parentId)continue;const p=state.objects.find(x=>x.id===o.parentId),old=before.objects.find(x=>x.id===o.parentId),oldO=before.objects.find(x=>x.id===o.id);if(!p){delete o.parentId;continue}if(!old||!oldO)continue;const a=(p.angle-old.angle)*Math.PI/180,k=p.w/old.w,dx=oldO.x-old.x,dy=oldO.y-old.y;o.x=p.x+(dx*Math.cos(a)-dy*Math.sin(a))*k;o.y=p.y+(dx*Math.sin(a)+dy*Math.cos(a))*k;o.angle=oldO.angle+p.angle-old.angle;o.w=oldO.w*k;}}
function undo(){if(!undoStack.length)return;redoStack.push(clone(state));state=undoStack.pop();selected=null;signal('undo');persist();render()}
function redo(){if(!redoStack.length)return;undoStack.push(clone(state));state=redoStack.pop();selected=null;signal('redo');persist();render()}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
function message(text,user=false){const m=$('#messages'),last=m.lastElementChild;if(last&&last.textContent===text&&last.className===(user?'user':''))return;const p=document.createElement('p');p.textContent=text;if(user)p.className='user';m.append(p);m.scrollTop=m.scrollHeight}
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
 if(selection&&selected){const o=state.objects.find(o=>o.id===selected);if(o){const{w,h}=dimensions(o);c.save();c.translate(o.x,o.y);c.rotate(o.angle*Math.PI/180);c.strokeStyle='#6e8059';c.lineWidth=1.5;c.setLineDash([5,5]);c.strokeRect(-w/2-6,-h/2-6,w+12,h+12);{c.setLineDash([]);c.strokeStyle='#6e8059';c.fillStyle='#fffefa';c.lineWidth=2;c.beginPath();c.moveTo(0,-h/2-6);c.lineTo(0,-h/2-30);c.stroke();for(const [hx,hy,name] of [[0,-h/2-30,'rotate'],[w/2+6,h/2+6,'scale']]){c.beginPath();c.arc(hx,hy,hoverHandle===name?10:7,0,7);c.fill();c.stroke()}c.strokeStyle='#6e8059';c.beginPath();c.arc(0,-h/2-30,3.8,Math.PI*.35,Math.PI*1.9);c.stroke();const ex=3.8*Math.cos(Math.PI*1.9),ey=-h/2-30+3.8*Math.sin(Math.PI*1.9);c.beginPath();c.moveTo(ex+.7,ey+2.6);c.lineTo(ex,ey);c.lineTo(ex-2.3,ey+.8);c.stroke();const sx=w/2+6,sy=h/2+6;c.beginPath();c.moveTo(sx-3.2,sy+3.2);c.lineTo(sx+3.2,sy-3.2);c.moveTo(sx+.4,sy-3.2);c.lineTo(sx+3.2,sy-3.2);c.lineTo(sx+3.2,sy-.4);c.moveTo(sx-3.2,sy+.4);c.lineTo(sx-3.2,sy+3.2);c.lineTo(sx-.4,sy+3.2);c.stroke()}c.restore()}}c.restore()}
function handlePoints(o){const {w,h}=dimensions(o),r=o.angle*Math.PI/180,cos=Math.cos(r),sin=Math.sin(r),L=(x,y)=>({x:o.x+x*cos-y*sin,y:o.y+x*sin+y*cos});return {rotate:L(0,-h/2-30),scale:L(w/2+6,h/2+6)}}
function render(){renderProposals();if(assetReady)drawScene(ctx);$('.workspace').style.background=backgrounds[state.bg][1];$('.workspace').classList.toggle('dark-stage',['dark','night','festive'].includes(state.bg));$('#title').value=displayTitle();$('#subtitle').textContent=t({cream:'subCream',green:'subGreen',pink:'subPink',sunny:'subSunny',pearl:'subPearl',linear:'subLinear',tropic:'subTropic',wild:'subWild',vintage:'subVintage',pop:'subPop',zen:'subZen','sunny-teacher':'subSunnyTeacher','blush-vow':'subBlushVow','moon-gold':'subMoonGold','autumn-ode':'subAutumnOde','crimson-blessing':'subCrimsonBlessing','christmas-hearth':'subNewFestival3','valentine-99':'subValentine99','graduation-day':'subGraduationDay','christmas-carol':'subChristmasCarol','christmas-snowfall':'presetChristmasSnowfall','halloween-twilight':'presetHalloweenTwilight','mother-softlight':'presetMotherSoftlight','january-dawn':'presetJanuaryDawn','duanwu-breeze':'subNewFestival2','qixi-nocturne':'subNewFestival1','newyear-lantern':'subNewFestival0'}[state.preset]||'subCustom');$('#greeting').style.fontFamily=state.card.font==='hand'?"'Kaiti SC',KaiTi,serif":state.card.font==='sans'?"-apple-system,'PingFang SC',sans-serif":"Georgia,'Songti SC',serif";const dc=displayCard();$('#card-title').textContent=dc.title;$('#card-body').textContent=dc.body;$('#card-sign').textContent=dc.sign;$('#greeting').style.backgroundColor=backgrounds[state.card.style]?.[1]||'#fcfaf5';$('#meaning').textContent=getLang()==='en'?enText(state.notes):state.notes;if($('#undo'))$('#undo').disabled=!undoStack.length;if($('#redo'))$('#redo').disabled=!redoStack.length;$$('[data-preset]').forEach(b=>b.classList.toggle('active',b.dataset.preset===state.preset));const bar=$('#slot-bar');if(bar){bar.replaceChildren();const reset=el('button','⌂','slot-btn');reset.title=t('camReset');reset.onclick=()=>fitCamera(true);bar.append(reset)}
const o=state.objects.find(o=>o.id===selected);$('#selection').hidden=!o;if(o){$('#selected-name').textContent=assetName(byId(o.asset)); 0&&0}co?.render(); }
let trayCollapsed=false,appliedIdx=-1,lastProposalKey='';
$('#proposals')?.addEventListener('pointerdown',e=>e.stopPropagation());
function applyProposal(i,p){appliedIdx=i;commit(()=>{state.objects=clone(p.objects).map(o=>({...o,slot:1}));state.title=p.title;state.card={...state.card,...p.card};state.notes=p.notes||state.notes;state.preset='custom';selected=null});seq=Math.max(seq,...state.objects.map(o=>Number(o.id.slice(1))+1));return true}
function renderProposals(){const root=$('#proposals');if(!root)return;const list=state.proposals||[],key=list.map(p=>p.title).join('|');if(key!==lastProposalKey){lastProposalKey=key;trayCollapsed=false;appliedIdx=-1}
 root.replaceChildren();root.hidden=!list.length;if(!list.length)return;
 const head=el('button',null,'proposal-tray-head');head.textContent=list.length+t('pPending')+(trayCollapsed?' ▸':' ▾');head.onclick=()=>{trayCollapsed=!trayCollapsed;renderProposals()};root.append(head);
 if(trayCollapsed)return;
 for(const [i,p] of list.entries()){const chip=el('div',null,'proposal-chip');chip.title=p.reason||'';if(i===appliedIdx)chip.classList.add('applied');
  const close=el('button','×','proposal-x');close.setAttribute('aria-label',t('pDismiss'));close.onclick=e=>{e.stopPropagation();if(i===appliedIdx)appliedIdx=-1;else if(i<appliedIdx)appliedIdx--;commit(()=>{state.proposals=(state.proposals||[]).filter((_,j)=>j!==i)},'proposals_dismiss')};
  chip.append(el('strong',p.title));if(i===appliedIdx)chip.append(el('span',t('pCurrent'),'proposal-badge'));chip.append(close);
  chip.onclick=()=>{applyProposal(i,p)};
  root.append(chip)}}
function point(e){const r=canvas.getBoundingClientRect();const scale=Math.min(r.width/1000,r.height/1050);const sx=(e.clientX-r.left-(r.width-1000*scale)/2)/scale,sy=(e.clientY-r.top-(r.height-1050*scale)/2)/scale;return{x:(sx-500)/camera.zoom+camera.x,y:(sy-525)/camera.zoom+camera.y}}
function hit(p){return [...state.objects].sort((a,b)=>b.depth-a.depth).find(o=>{const {w,h}=dimensions(o),a=-o.angle*Math.PI/180,dx=p.x-o.x,dy=p.y-o.y,x=dx*Math.cos(a)-dy*Math.sin(a)+w/2,y=dx*Math.sin(a)+dy*Math.cos(a)+h/2;if(x<0||y<0||x>=w||y>=h)return false;const sp=sprites[o.asset];if(!sp)return false;const g=sp.getContext('2d'),sx=Math.floor(x/w*sp.width),sy=Math.floor(y/h*sp.height),rr=Math.max(2,Math.round(6*sp.width/w));for(let yy=sy-rr;yy<=sy+rr;yy++)for(let xx=sx-rr;xx<=sx+rr;xx++){if(xx<0||yy<0||xx>=sp.width||yy>=sp.height)continue;if(g.getImageData(xx,yy,1,1).data[3]>35)return true}return false})}
const activePts=new Map();let wheelZoom=null,hoverHandle=null;
function applyZoomAll(before,k,scx,scy,ccx,ccy){const mw=Math.max(1,...before.objects.filter(o=>(o.slot||1)===state.activeSlot).map(o=>o.w));const ke=Math.min(k,850/mw);for(const o of state.objects){if((o.slot||1)!==state.activeSlot)continue;const b=before.objects.find(x=>x.id===o.id);if(!b)continue;o.x=ccx+(b.x-scx)*ke;o.y=ccy+(b.y-scy)*ke;o.w=Math.max(35,Math.min(850,b.w*ke));if(b.tx!==undefined)o.tx=ccx+(b.tx-scx)*ke;if(b.ty!==undefined)o.ty=ccy+(b.ty-scy)*ke;if(b.cx!==undefined)o.cx=ccx+(b.cx-scx)*ke;if(b.cy!==undefined)o.cy=ccy+(b.cy-scy)*ke}drawScene(ctx)}
canvas.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();const wp=point(e),z0=camera.zoom,z1=Math.max(.4,Math.min(3,z0*Math.exp(-e.deltaY*.0015)));camera.zoom=z1;camera.x=wp.x+(camera.x-wp.x)*(z0/z1);camera.y=wp.y+(camera.y-wp.y)*(z0/z1);drawScene(ctx);saveCam()},{passive:false});
canvas.addEventListener('pointerdown',e=>{activePts.set(e.pointerId,e);if(activePts.size===2&&!gesture){const before=drag?.before||clone(state);drag=null;const [a,b]=[...activePts.values()];const pa=point(a),pb=point(b);drag={pinch:true,d0:Math.max(1,Math.hypot(pa.x-pb.x,pa.y-pb.y)),z0:camera.zoom,wx:(pa.x+pb.x)/2,wy:(pa.y+pb.y)/2,cx0:camera.x,cy0:camera.y,before,moved:false};canvas.setPointerCapture(e.pointerId);return}const p=point(e);if(selected){const sel=state.objects.find(o=>o.id===selected);if(sel){const hp=handlePoints(sel);if(Math.hypot(p.x-hp.rotate.x,p.y-hp.rotate.y)<18){gesture={type:'rotate',id:sel.id,before:clone(state),moved:false,a0:Math.atan2(p.y-sel.y,p.x-sel.x),angle0:sel.angle};canvas.setPointerCapture(e.pointerId);return}if(Math.hypot(p.x-hp.scale.x,p.y-hp.scale.y)<18){gesture={type:'scale',id:sel.id,before:clone(state),moved:false,d0:Math.max(1,Math.hypot(p.x-sel.x,p.y-sel.y)),w0:sel.w};canvas.setPointerCapture(e.pointerId);return}}}const o=hit(p);selected=o?.id||null;render();
 if(o&&byId(o.asset).category==='wrap'){drag={slotPan:true,slot:o.slot||1,x:p.x,y:p.y,before:clone(state),moved:false};canvas.setPointerCapture(e.pointerId)}
 else if(o){drag={id:o.id,x:p.x,y:p.y,ox:o.x,oy:o.y,before:clone(state),moved:false};canvas.setPointerCapture(e.pointerId)}
 else if(!o){drag={cam:true,x:p.x,y:p.y,cx:camera.x,cy:camera.y,moved:false};canvas.setPointerCapture(e.pointerId)}});
canvas.addEventListener('pointermove',e=>{if(!drag&&!gesture&&activePts.size===0){const p0=point(e);let hh=null;if(selected){const sel=state.objects.find(o=>o.id===selected);if(sel){const hp0=handlePoints(sel);if(Math.hypot(p0.x-hp0.rotate.x,p0.y-hp0.rotate.y)<18)hh='rotate';else if(Math.hypot(p0.x-hp0.scale.x,p0.y-hp0.scale.y)<18)hh='scale'}}if(hh!==hoverHandle){hoverHandle=hh;drawScene(ctx)}const hp=hit(p0);canvas.style.cursor=hh?'pointer':hp?(byId(hp.asset).category==='wrap'?'move':'default'):'grab'}
 if(activePts.has(e.pointerId))activePts.set(e.pointerId,e);
 if(drag?.pinch){if(activePts.size<2)return;const [a,b]=[...activePts.values()];const pa=point(a),pb=point(b),d=Math.max(1,Math.hypot(pa.x-pb.x,pa.y-pb.y)),k=Math.max(.4,Math.min(3,d/drag.d0)),ccx=(pa.x+pb.x)/2,ccy=(pa.y+pb.y)/2;
  const z1=Math.max(.4,Math.min(3,drag.z0*k));camera.zoom=z1;camera.x=drag.wx+(drag.cx0-drag.wx)*(drag.z0/z1);camera.y=drag.wy+(drag.cy0-drag.wy)*(drag.z0/z1);if(Math.abs(k-1)>.005)drag.moved=true;drawScene(ctx);return}
 if(drag?.cam){const p=point(e);camera.x=drag.cx-(p.x-drag.x);camera.y=drag.cy-(p.y-drag.y);if(Math.abs(p.x-drag.x)+Math.abs(p.y-drag.y)>1)drag.moved=true;drawScene(ctx);return}
 if(drag?.slotPan){const p=point(e),dx=p.x-drag.x,dy=p.y-drag.y;if(!drag.active){if(Math.hypot(dx,dy)<6)return;drag.active=true}drag.moved=true;for(const o of state.objects){if((o.slot||1)!==drag.slot)continue;const b=drag.before.objects.find(x=>x.id===o.id);if(b){o.x=b.x+dx;o.y=b.y+dy;if(b.tx!==undefined)o.tx=b.tx+dx;if(b.ty!==undefined)o.ty=b.ty+dy;if(b.cx!==undefined)o.cx=b.cx+dx;if(b.cy!==undefined)o.cy=b.cy+dy}}const an=drag.before.slotAnchors?.[drag.slot];if(an)state.slotAnchors[drag.slot]={x:an.x+dx,y:an.y+dy};drawScene(ctx);return}if(gesture){const p=point(e),o=state.objects.find(o=>o.id===gesture.id);if(!o)return;if(gesture.type==='rotate'){const na=gesture.angle0+(Math.atan2(p.y-o.y,p.x-o.x)-gesture.a0)*180/Math.PI;o.angle=Math.max(-360,Math.min(360,Math.round(na)))}else{o.w=Math.max(35,Math.min(850,Math.round(gesture.w0*Math.hypot(p.x-o.x,p.y-o.y)/gesture.d0)))}gesture.moved=true;syncAttachments(gesture.before);drawScene(ctx);return}if(!drag)return;const p=point(e),o=state.objects.find(o=>o.id===drag.id);if(!o)return;o.x=Math.max(-5000,Math.min(5000,drag.ox+p.x-drag.x));o.y=Math.max(-1000,Math.min(3000,drag.oy+p.y-drag.y));syncAttachments(drag.before);drag.moved ||= Math.abs(o.x-drag.ox)+Math.abs(o.y-drag.oy)>3;drawScene(ctx)});
function finishDrag(){if(!drag)return;if(drag.cam){saveCam();drag=null;render();return}if(drag.slotPan){if(drag.moved){undoStack.push(drag.before);redoStack=[];signal('user_pan');persist()}drag=null;render();return}if(drag.moved){const moved=state.objects.find(o=>o.id===drag.id);if(moved&&byId(moved.asset).category==='extras'){const near=state.objects.filter(o=>isFlower(o.asset)).map(o=>({o,d:Math.hypot(o.x-moved.x,o.y-moved.y)})).sort((a,b)=>a.d-b.d)[0];if(near?.d<80){moved.parentId=near.o.id;toast(t('tAttached'))}else delete moved.parentId}undoStack.push(drag.before);redoStack=[];signal('user_drag',{objectId:drag.id});persist()}drag=null;render()}
canvas.addEventListener('pointerup',e=>{activePts.delete(e.pointerId);
 if(drag?.pinch){if(activePts.size<2){if(drag.moved)signal('user_zoom');saveCam();drag=null;render()}return}
 if(gesture){if(gesture.moved){undoStack.push(gesture.before);redoStack=[];signal('user_transform',{objectId:gesture.id});persist()}gesture=null;render();return}finishDrag()});canvas.addEventListener('pointercancel',e=>{activePts.delete(e.pointerId);
 if(drag?.pinch){drag=null;render();return}
 if(gesture){state=gesture.before;gesture=null;render();return}if(drag){state=drag.before;drag=null;render()}});
canvas.addEventListener('keydown',e=>{if(['Delete','Backspace'].includes(e.key)){e.preventDefault();edit('delete')}else if(e.key.startsWith('Arrow')){e.preventDefault();const o=state.objects.find(o=>o.id===selected);if(o)commit(()=>{o.x+=e.key==='ArrowLeft'?-5:e.key==='ArrowRight'?5:0;o.y+=e.key==='ArrowUp'?-5:e.key==='ArrowDown'?5:0})}});
function edit(action){window.replaceTarget=null;const o=state.objects.find(o=>o.id===selected);if(!o)return;commit(()=>{if(action==='replace'){tab=byId(o.asset).category;$('#search').value='';drawer();window.replaceTarget=o.id;$('#asset-panel').scrollIntoView({block:'nearest'});toast(t('tReplaceHint'));}else if(action==='delete'){state.objects=state.objects.filter(x=>x.id!==o.id&&x.parentId!==o.id);selected=null}else if(action==='copy'){const n={...o,id:'o'+seq++,x:o.x+30,y:o.y+15};state.objects.push(n);selected=n.id}else if(action==='front')o.depth+=5;else if(action==='back')o.depth-=5;else if(action==='rotateLeft')o.angle-=10;else if(action==='rotateRight')o.angle+=10;else if(action==='larger')o.w=Math.min(850,o.w*1.1);else if(action==='smaller')o.w=Math.max(35,o.w/1.1)});if(action==='delete')toast(getLang()==='en'?'Removed — press ⌘Z to undo':'已移除，按 ⌘Z 可撤销')}
$$('[data-edit]').forEach(b=>b.onclick=()=>edit(b.dataset.edit));$('#undo')?.addEventListener('click',undo);$('#redo')?.addEventListener('click',redo);$('#btn-save')?.addEventListener('click',openProjects);$('#deselect')?.addEventListener('click',()=>{selected=null;render()});$('#title').onchange=e=>commit(()=>state.title=e.target.value.slice(0,60));
function addAsset(id){const a=byId(id);if(!a)return;if(a.category==='card'){toast(t('tCardAsset'));return;}const an=state.slotAnchors[1];commit(()=>{if(window.replaceTarget){const target=state.objects.find(o=>o.id===window.replaceTarget);if(target){target.asset=id;selected=target.id}window.replaceTarget=null;}else if(a.category==='wrap'){state.objects=state.objects.filter(o=>byId(o.asset).category!=='wrap');const wr=item(id,an.x,id==='e6'||id==='e7'||a.role==='花器'?795:650,id==='e6'||id==='e7'||a.role==='花器'?350:430,0,id==='e6'||id==='e7'||a.role==='花器'?50:0);wr.slot=1;state.objects.push(wr)}else{const o=item(id,a.category==='extras'?510:450+Math.random()*100,a.category==='extras'?835:410+Math.random()*150,id.startsWith('s')?220:id==='eb3'?28:['eb4','eb5','eb6','eb7','eb8','eb11'].includes(id)?55:id==='e2'?100:id.startsWith('eb')?110:a.category==='extras'?190:160,0,a.category==='extras'?65:35);o.slot=1;o.x+=an.x-505;state.objects.push(o);selected=o.id}});toast(t('tAdded')+assetName(a))}
function drawer(){const grid=$('#asset-grid');if(!grid)return;grid.replaceChildren();$$('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));$('#search').hidden=tab==='background';$('#search').placeholder=t(tab==='wrap'?'searchPhWrap':tab==='extras'?'searchPhExtras':'searchPh');if(tab==='background'){Object.entries(backgrounds).forEach(([id,[name,color]])=>{const b=document.createElement('button');b.className='asset';const s=document.createElement('span');s.className='swatch';s.style.background=color;b.append(s,t(name));b.onclick=()=>commit(()=>state.bg=id);grid.append(b)});return}catalog.filter(a=>a.category===tab&&a.name.includes($('#search').value)).forEach(a=>{const b=document.createElement('button');b.className='asset';b.title=(getLang()==='en'?'Add ':'添加 ')+assetName(a);const cv=document.createElement('canvas');cv.width=cv.height=150;const sp=sprites[a.id];if(sp){const k=Math.min(140/sp.width,140/sp.height);cv.getContext('2d').drawImage(sp,(150-sp.width*k)/2,(150-sp.height*k)/2,sp.width*k,sp.height*k)}b.append(cv,document.createTextNode(assetName(a)));b.onclick=()=>addAsset(a.id);grid.append(b)})}
$$('[data-tab]').forEach(b=>b.onclick=()=>{window.replaceTarget=null;tab=b.dataset.tab;$('#search').value='';drawer()});$('#search').oninput=drawer;
function markPresetCard(s){s.card._presetElements=structuredClone(s.card.elements||null);s.card._presetPaper=s.card.paper||null}
function cardFollowsPreset(s){if(s.card._presetElements)return JSON.stringify(s.card.elements||[])===JSON.stringify(s.card._presetElements)&&(s.card.paper||null)===s.card._presetPaper;return !s.card.cardEdited}
function choosePreset(key){commit(()=>{const old=state;const customized=!cardFollowsPreset(old);const p=preset(key),an=state.slotAnchors[1],dx=an.x-505,dy=an.y-(p.tie?.y??890);
 const slotObjs=p.objects.map(o=>({...o,x:Math.max(-5000,Math.min(5000,o.x+dx)),y:o.y+dy,slot:1})).map(o=>{const r={...o};if(r.tx!==undefined){r.tx+=dx;r.ty+=dy}if(r.cx!==undefined){r.cx+=dx;r.cy+=dy}return r});
 state.objects=slotObjs;
 state.bg=p.bg;state.title=getLang()==='en'&&TITLES[key]?TITLES[key][1]:p.title;
 state.preset=key;state.notes=p.notes;
 if(customized){state.card=old.card;state.cardEdited=true}else if(p.cardTemplate&&co){const texts=getLang()==='en'?(p.cardEn||p.card):p.card;const tc=co.templateCard(p.cardTemplate,texts);if(tc){state.card={...state.card,...tc};markPresetCard(state)}}
 state.requests=old.requests;selected=null});fitCamera(true)}
$$('[data-preset]').forEach(b=>b.onclick=()=>choosePreset(b.dataset.preset));
function modal(title,build){$('#modal').classList.remove('wide-card');$('#modal-body').classList.remove('card-editor-body');$('#modal-title').textContent=title;$('#modal-body').replaceChildren();build($('#modal-body'));$('#modal').showModal()}
$('#close-modal').onclick=()=>$('#modal').close();
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
function inputField(parent,label,value,tag='input'){const l=el('label',label),i=el(tag);i.value=value;parent.append(l,i);return i}
function queue(text){commit(()=>state.requests.push({id:'r'+Date.now(),text,status:'pending'}),'request');message(text,true);if(!agentConnected)message(t('mNoAgent'))}


function recipe(lang='zh'){const groups={};for(const o of state.objects){const a=byId(o.asset);const name=(lang==='en'?(a.nameEn||a.name):a.name).replace(/·.*$/,'').trim();groups[name]=(groups[name]||0)+1}const notes=lang==='en'?enText(state.notes):state.notes;return {title:lang==='en'?displayTitle():state.title,items:Object.entries(groups).map(([name,quantity])=>({name,quantity})),card:displayCard(),brief:state.brief,design:notes,notes:notes+'\n\n'+t('materialsNote')}}
function escapeHTML(text){return String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function exportReference(){const r=recipe(getLang()),cardImage=co.cardImage(),c=document.createElement('canvas');c.width=1000;c.height=1050;drawScene(c.getContext('2d'),false);const html=`<!doctype html><html lang="${getLang()==='en'?'en':'zh-CN'}"><meta charset="utf-8"><title>${escapeHTML(r.title)} · ${t('refSheet')}</title><style>body{max-width:950px;margin:40px auto;padding:25px;color:#383d2e;font:16px/1.7 sans-serif}h1{font-family:serif}.layout{display:grid;grid-template-columns:1fr 1fr;gap:30px}img{width:100%}table{width:100%;border-collapse:collapse}td{padding:5px;border-bottom:1px solid #ddd}.note{font-size:13px;color:#777;white-space:pre-wrap}.card{padding:22px;border:1px solid #ddd;white-space:pre-wrap}@media print{body{margin:0;padding:0}.layout{gap:15px}}</style><h1>${escapeHTML(r.title)}</h1><div class="layout"><div><img src="${c.toDataURL('image/png')}" alt="${t('refAltBouquet')}"><p class="note">${escapeHTML(r.notes)}</p></div><div><h2>${t('refMaterials')}</h2><table>${r.items.map(x=>`<tr><td>${escapeHTML(x.name)}</td><td>${x.quantity}</td></tr>`).join('')}</table>${r.design?`<h2>${t('refIntent')}</h2><p class="note">${escapeHTML(r.design)}</p>`:''}<h2>${t('refCard')}</h2><img src="${cardImage}" alt="${t('refAltCard')}"><div class="card"><b>${escapeHTML(r.card.title)}</b><p>${escapeHTML(r.card.body)}</p>${escapeHTML(r.card.sign)}</div></div></div><p class="note">${t('refFooter')}</p></html>`;download(new Blob([html],{type:'text/html'}),'花店参考单.html')}

function download(blob,name){const u=URL.createObjectURL(blob),a=el('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
$('#export')?.addEventListener('click',()=>{const c=document.createElement('canvas');c.width=2000;c.height=2100;c.getContext('2d').scale(2,2);drawScene(c.getContext('2d'),false);c.toBlob(b=>b&&download(b,state.title+'.png'),'image/png')});
function exportCard(){const c=document.createElement('canvas');c.width=1500;c.height=1050;const g=c.getContext('2d');g.fillStyle=backgrounds[state.card.style]?.[1]||'#fcfaf5';g.fillRect(0,0,1500,1050);g.strokeStyle='#d4b3a3';g.lineWidth=2;g.strokeRect(65,65,1370,920);g.fillStyle='#3d4234';g.textAlign='center';const family=state.card.font==='sans'?'sans-serif':state.card.font==='hand'?'KaiTi,serif':'"Songti SC",serif';g.font='52px '+family;g.fillText(state.card.title,750,350,1250);g.font='30px '+family;const lines=[];for(const line of state.card.body.split('\n')){let current='';for(const ch of line){if(g.measureText(current+ch).width>1150){lines.push(current);current=ch}else current+=ch}lines.push(current)}lines.slice(0,8).forEach((line,i)=>g.fillText(line,750,450+i*55));g.textAlign='right';g.font='26px serif';g.fillText(state.card.sign,1300,900,1100);c.toBlob(b=>b&&download(b,'心意贺卡.png'))}
function openProjects(){modal(t('projectsTitle'),body=>{let saved=[];try{saved=JSON.parse(localStorage.getItem('flora-projects')||'[]')}catch{}const save=el('button',t('saveVersion'),'primary');save.onclick=()=>{try{saved.unshift({...clone(state),savedAt:Date.now()});localStorage.setItem('flora-projects',JSON.stringify(saved.slice(0,20)));toast(t('tSaved'));$('#modal').close()}catch{toast(t('tNoSpace'))}};body.append(save);for(const s of saved){const b=el('button',s.title+' · '+new Date(s.savedAt).toLocaleDateString());b.style.display='block';b.style.marginTop='10px';b.onclick=()=>{commit(()=>{state=mergeSlots(clone(s));selected=null});if(mergeSlots.migrated){migratedToast();fitCamera(true)}seq=Math.max(seq,...state.objects.map(o=>Number(o.id.slice(1))+1));$('#modal').close()};body.append(b)}const backup=el('button',t('exportBackup'));backup.onclick=()=>download(new Blob([JSON.stringify(co.backup())],{type:'application/json'}),'AI花艺师备份.json');body.append(backup);const file=el('input');file.type='file';file.accept='.json';file.onchange=async()=>{try{if(file.files[0].size>80000000)throw Error(t('errBackupSize'));const raw=JSON.parse(await file.files[0].text());const s=raw.format==='flora-bundle-v1'?await co.restoreBundle(raw):raw;validateScene(s);commit(()=>{state=mergeSlots(s);selected=null});if(mergeSlots.migrated){migratedToast();fitCamera(true)}seq=Math.max(seq,...state.objects.map(o=>Number(o.id.slice(1))+1));$('#modal').close()}catch(e){toast(t('tImportFail')+e.message)}};body.append(el('p',t('restoreHint')),file)})}
function validateObject(o){if(!o||!byId(o.asset))throw Error(t('errUnknownAsset'));if(typeof o.id!=='string'||!o.id)throw Error(t('errObjId'));if(o.parentId!==undefined&&typeof o.parentId!=='string')throw Error(t('errParentId'));if(o.slot!==undefined&&![1,2,3].includes(o.slot))throw Error(t('errSlot'));for(const k of ['x','y','w','angle','depth'])if(typeof o[k]!=='number'||!Number.isFinite(o[k]))throw Error(t('errParamNum')+' '+k);for(const k of ['tx','ty','cx','cy'])if(o[k]!==undefined&&!Number.isFinite(o[k]))throw Error(t('errParamNum')+' '+k);if(o.x<-5000||o.x>5000||o.y<-1000||o.y>3000||o.w<20||o.w>900||Math.abs(o.angle)>360||Math.abs(o.depth)>200)throw Error(t('errObjRange'));}
function validateScene(s){if(s?.version!==1||!Array.isArray(s.objects)||s.objects.length>200||!backgrounds[s.bg]||typeof s.title!=='string'||s.title.length>60||!s.card||typeof s.card.title!=='string'||typeof s.card.body!=='string'||s.card.body.length>400||typeof s.card.sign!=='string'||typeof s.notes!=='string'||typeof s.brief!=='string'||!Array.isArray(s.requests))throw Error(t('errScene'));if(s.tie!==undefined&&(typeof s.tie!=='object'||!Number.isFinite(s.tie.x)||!Number.isFinite(s.tie.y)))throw Error(t('errTie'));if(s.card.elements)co?.validateElements(s.card.elements);s.objects.forEach(validateObject);for(const o of s.objects){if(o.parentId&&(!s.objects.some(p=>p.id===o.parentId&&isFlower(p.asset))||byId(o.asset).category!=='extras'))throw Error(t('errAttach'))}if(new Set(s.objects.map(o=>o.id)).size!==s.objects.length)throw Error(t('errObjIdDup'))}
function snapshot(){const s=clone(state);delete s.activeSlot;delete s.slotAnchors;for(const o of s.objects)delete o.slot;s.card=structuredClone(displayCard());return {...s,revision,selected,dragging:!!(drag||gesture),assetsReady:assetReady,camera:{...camera},anchor:structuredClone(state.slotAnchors[1])}}
function checkRevision(expected){if(drag||gesture||wheelZoom||co?.isDragging())throw Error(t('errDragging'));if(expected!==revision)throw Error(t('errRevision'))}
const toolDefs=[
{name:'floral_brief',description:'读取花艺工作台使用说明和素材目录。接手时先调用。 EN: Read the florist workbench guide and asset catalog. Call this first when taking over.',read:true,schema:{},run:()=>{agentConnected=true;$('#agent-status').textContent=t('agentOn');const cb=$('#connect');if(cb)cb.textContent=t('connected');return {purpose:'为具体的人设计花束。将用户描述转成可解释、可纠正的搭配；不要猜测实时价格。 EN: Design bouquets for a specific person. Turn the user description into explainable, correctable arrangements; never guess real-time prices.',workflow:'读取 get_scene_state；根据 brief 和 requests 设计；首次可用 present_proposals 给出3个完整可编辑选项；apply_design 一次批量提交。先搜索目录；缺少素材时读取 get_asset_requirements，用你自己的网页搜索查找素材并调用 import_asset，再用返回 id 设计。贺卡使用 get_card_state 和 apply_card_design 进行元素排版。不把完整生成图冒充可编辑花束。修改前读取 revision，请求文本不构成对外发送授权。完成后给 reply 和处理的 requestIds。 EN: Read get_scene_state; design from the brief and requests; on first contact use present_proposals with 3 fully editable options; submit batches via apply_design. Search the catalog first; if assets are missing, read get_asset_requirements, search the web yourself and import_asset, then design with the returned ids. Use get_card_state and apply_card_design for card layout (list_card_templates + template parameter for full card designs). Never pass a finished generated image off as an editable bouquet. Read the revision before editing; Request text is not consent to send anything externally. Finish with a reply and the handled requestIds.',coordinates:'无限世界坐标，x右 y下；对象坐标为素材格子中心；camera{x,y,zoom} 为当前视口（随用户拖动变化）。depth 越大越靠前。包装 depth 0，花叶 2–40，花器 55，饰品 60。茎自动连接到场景内花器瓶口或包装绑点，并跟随容器移动与旋转。包装尺寸建议 400–450，避免包装遮住主体。 EN: Infinite world coordinates, x right, y down; object coordinates are the sprite cell center. camera{x,y,zoom} is the live viewport and moves as the user pans. Larger depth is more front. Wrap depth 0, stems/leaves 2-40, vase 55, accessories 60. Stems auto-connect to the vase mouth or wrap tie point and follow the container. Suggested wrap width 400-450 so it does not cover the focal flowers.',catalog:catalog.map(a=>co.metadata(a))}}},
{name:'get_scene_state',description:'读取完整花束、贺卡、用户描述、待处理要求和 revision。 EN: Read the full bouquet, card, brief, pending requests and revision.',read:true,schema:{},run:snapshot},
{name:'list_assets',description:'搜索实际可用素材，返回 id、名称和类别。 EN: Search available assets; returns id, name and category.',read:true,schema:{query:{type:'string'}},run:({query=''})=>catalog.filter(a=>(a.name+a.category+a.role).includes(query)).map(a=>co.metadata(a))},
{name:'apply_design',description:'以单次可撤销事务新增、更新、删除花材或饰品，也可更新贺卡、标题、背景和花语说明。必须使用最新 revision。slot 字段可省略，传入也会被容忍并忽略（单束世界坐标）。 EN: Add, update or remove flowers/accessories in one undoable transaction; can also update card, title, background and notes. Requires the latest revision. The slot field is optional, tolerated and ignored (single-bouquet world coordinates).',schema:{expectedRevision:{type:'integer'},updates:{type:'array',items:{type:'object',properties:{id:{type:'string'},asset:{type:'string'},x:{type:'number'},y:{type:'number'},w:{type:'number'},angle:{type:'number'},depth:{type:'number'},parentId:{type:'string'},slot:{type:'integer',description:'已废弃，容忍但忽略 deprecated, tolerated but ignored'}},required:['id'],additionalProperties:false}},additions:{type:'array',items:{type:'object',properties:{asset:{type:'string'},x:{type:'number'},y:{type:'number'},w:{type:'number'},angle:{type:'number'},depth:{type:'number'},parentId:{type:'string'},slot:{type:'integer',description:'已废弃，容忍但忽略 deprecated, tolerated but ignored'}},required:['asset','x','y','w'],additionalProperties:false}},removeIds:{type:'array',items:{type:'string'}},title:{type:'string'},background:{type:'string',enum:Object.keys(backgrounds)},card:{type:'object',properties:{title:{type:'string'},body:{type:'string'},sign:{type:'string'},font:{type:'string',enum:['serif','sans','hand']},style:{type:'string',enum:Object.keys(backgrounds)}},additionalProperties:false},notes:{type:'string'},cardTemplate:{type:'string'},slotAnchor:{type:'object',properties:{x:{type:'number'},y:{type:'number'}},required:['x','y'],additionalProperties:false},reply:{type:'string'},requestIds:{type:'array',items:{type:'string'}}},required:['expectedRevision'],run:input=>{checkRevision(input.expectedRevision);const next=clone(state);for(const id of input.removeIds||[]){const o=next.objects.find(o=>o.id===id);if(!o)throw Error(t('errObjMissing')+' '+id)}next.objects=next.objects.filter(o=>!(input.removeIds||[]).includes(o.id)&&!(input.removeIds||[]).includes(o.parentId));for(const patch of input.updates||[]){const o=next.objects.find(o=>o.id===patch.id);if(!o)throw Error(t('errObjMissing')+' '+patch.id);delete patch.slot;Object.assign(o,patch);validateObject(o)}let nseq=seq;for(const a of input.additions||[]){const o={id:'o'+nseq++,asset:a.asset,x:a.x,y:a.y,w:a.w,angle:a.angle??0,depth:a.depth??30,locked:false,slot:1,...(a.parentId?{parentId:a.parentId}:{})};validateObject(o);next.objects.push(o)}if(input.title!==undefined)next.title=input.title;if(input.background!==undefined)next.bg=input.background;if(input.slotAnchor!==undefined){if(!Number.isFinite(input.slotAnchor.x)||!Number.isFinite(input.slotAnchor.y))throw Error(t('errSlotAnchor'));next.slotAnchors[1]={x:input.slotAnchor.x,y:input.slotAnchor.y};}
if(input.cardTemplate!==undefined){const tc=co?.templateCard(input.cardTemplate,input.card||{});if(!tc)throw Error(t('errCardTpl')+' '+input.cardTemplate);next.card={...next.card,...tc};next.cardEdited=true;markPresetCard(next);}if(input.card){next.card={...next.card,...input.card};if(next.card.elements)for(const [id,key] of [['card-title','title'],['card-body','body'],['card-sign','sign']]){const o=next.card.elements.find(e=>e.id===id);if(o&&input.card[key]!==undefined)o.text=input.card[key]}next.cardEdited=true;}if(next.card.elements&&co)co.syncLegacy(next);if(input.notes!==undefined)next.notes=input.notes;for(const id of input.requestIds||[]){const r=next.requests.find(r=>r.id===id);if(r)r.status='done'}validateScene(next);next.preset='custom';commit(()=>{state=next;seq=nseq},'agent_edit');if(input.reply)message(input.reply);return {ok:true,revision,objects:state.objects.length}}},
{name:'present_proposals',description:'基于送花描述提供1至3个完整可编辑花束方案供用户选择，不替换当前画布。使用实际素材，各方案必须有不同搭配理由。方案对象为单束世界坐标，不需要 slot 字段。 EN: Present 1-3 complete editable bouquet proposals based on the brief, without replacing the canvas. Use real assets; each proposal needs a distinct rationale. Proposal objects use single-bouquet world coordinates; no slot field is needed.',schema:{expectedRevision:{type:'integer'},proposals:{type:'array',minItems:1,maxItems:3,items:{type:'object',properties:{title:{type:'string'},reason:{type:'string'},notes:{type:'string'},card:{type:'object',properties:{title:{type:'string'},body:{type:'string'},sign:{type:'string'}},additionalProperties:false},objects:{type:'array',maxItems:100,items:{type:'object',properties:{asset:{type:'string'},x:{type:'number'},y:{type:'number'},w:{type:'number'},angle:{type:'number'},depth:{type:'number'}},required:['asset','x','y','w'],additionalProperties:false}}},required:['title','reason','objects'],additionalProperties:false}}},required:['expectedRevision','proposals'],run:({expectedRevision,proposals})=>{checkRevision(expectedRevision);if(!Array.isArray(proposals)||!proposals.length||proposals.length>3)throw Error(t('errProposalCount'));let nseq=seq;const options=proposals.map(p=>{if(typeof p.title!=='string'||p.title.length>60||typeof p.reason!=='string'||p.reason.length>250||!Array.isArray(p.objects)||p.objects.length>100)throw Error(t('errProposalFormat'));const objects=p.objects.map(a=>({id:'o'+nseq++,asset:a.asset,x:a.x,y:a.y,w:a.w,angle:a.angle??0,depth:a.depth??25,locked:false}));validateScene({...clone(state),objects,title:p.title,card:{...state.card,...p.card},notes:p.notes||state.notes});return {...p,objects}});commit(()=>{state.proposals=options;seq=nseq},'proposals');return {ok:true,revision,count:options.length}}},
{name:'select_proposal',description:'把 present_proposals 的第 index 个方案(0 起)应用到画布,等效用户点选方案卡:替换花束对象与贺卡、记一步撤销;proposals 为空或 index 越界返回错误。 EN: Apply the index-th (0-based) proposal from present_proposals to the canvas, same as the user clicking its card: replaces bouquet objects and card as one undoable step; errors when no proposals exist or index is out of range.',schema:{expectedRevision:{type:'integer'},index:{type:'integer'}},required:['expectedRevision','index'],run:({expectedRevision,index})=>{checkRevision(expectedRevision);const list=state.proposals||[];if(!list.length)throw Error(t('errNoProposals'));if(!Number.isInteger(index)||index<0||index>=list.length)throw Error(t('errIndexRange')+': '+index);const p=list[index];applyProposal(index,p);return {ok:true,revision,title:p.title}}},
{name:'get_florist_reference',description:'读取与当前画布一致的花材、包装、饰品数量以及贺卡。不含价格，不对外发送。 EN: Read flower/wrap/accessory quantities matching the canvas plus the card. No prices; never sent externally.',read:true,schema:{},run:()=>recipe(getLang())},
{name:'undo_design',description:'撤销最近一次画布事务，含 Agent 批量修改。 EN: Undo the most recent canvas transaction, including agent batch edits.',schema:{expectedRevision:{type:'integer'}},required:['expectedRevision'],run:({expectedRevision})=>{checkRevision(expectedRevision);undo();return snapshot()}},
{name:'get_changes',description:'读取指定 revision 后用户的修改事件和最新 revision，不阻塞。 EN: Read user edit events after a given revision plus the latest revision. Non-blocking.',read:true,schema:{since:{type:'integer'}},run:({since=0})=>({revision,events:events.filter(e=>e.revision>since),pendingRequests:state.requests.filter(r=>r.status==='pending')})}
];
const toolLifecycle=new AbortController();window.addEventListener('pagehide',()=>toolLifecycle.abort(),{once:true});
async function register(){const mc=document.modelContext||navigator.modelContext;if(!mc?.registerTool)return;for(const t of toolDefs){try{await mc.registerTool({name:t.name,description:t.description,inputSchema:{type:'object',properties:t.schema,required:t.required||[],additionalProperties:false},annotations:{readOnlyHint:!!t.read},execute:async(input={})=>{try{const result=await t.run(input);return t.image?{content:[{type:'image',mimeType:result.mime||'image/png',data:result.data}]}:{content:[{type:'text',text:JSON.stringify(result)}]}}catch(e){return {isError:true,content:[{type:'text',text:e.message}]}}}},{signal:toolLifecycle.signal})}catch(e){console.warn('Tool registration failed',t.name,e.message)}}}
// 切格串色清理:贴边的孤立色条(与主体之间有整行/列透明间隙,且占比很小)判定为相邻格串色,
// 原位擦除——画布尺寸不变,按格中心定位的语义完全不受影响。
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
async function load(){try{await Promise.all([...new Set(catalog.filter(a=>!a.custom).map(a=>a.sheet))].map(key=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve()};im.onerror=()=>reject(Error(key+' '+t('errSheetLoad')));im.src='assets/'+key+'.webp'})));for(const a of catalog){if(a.custom){sprites[a.id]=await assetSprite(a);continue}const im=images[a.sheet],rows=a.sheet==='sprigs'||a.sheet==='extras'?2:4;let xb=[0,.25,.5,.75,1],yb=rows===2?[0,.5,1]:[0,.25,.5,.75,1];if(a.sheet==='accessories-b'){xb=[0,.29,.54,.79,1];yb=[0,.285,.49,.70,1]}if(a.sheet==='accessories-c')yb=[0,.27,.55,.74,1];if(a.sheet==='finishing')yb=[0,.265,.52,.745,1];const col=a.index%4,row=Math.floor(a.index/4),sx=im.width*xb[col],sy=im.height*yb[row],sw=im.width*(xb[col+1]-xb[col]),sh=im.height*(yb[row+1]-yb[row]);const c=document.createElement('canvas');c.width=Math.floor(sw);c.height=Math.floor(sh);const g=c.getContext('2d');g.drawImage(im,sx,sy,sw,sh,0,0,c.width,c.height);if(a.category==='wrap')cleanWrapSprite(g,c.width,c.height);cleanCellSprite(g,c.width,c.height);sprites[a.id]=c}assetReady=true;$('#loading').hidden=true;if(camBad||!localStorage.getItem('flora-camera-v2'))fitCamera();if(mergeSlots.migrated)migratedToast();render();drawer();await register()}catch(e){$('#loading').textContent=t('errLoadFail')+e.message}}
// 三连帧断言:连续绘制三帧后画布变换必须回到单位矩阵(相机零累积位移),且 camera 不被绘制改写。
function testCameraDrift(){const before={...camera};const c=document.createElement('canvas');c.width=1000;c.height=1050;const g=c.getContext('2d');const read=()=>{const m=g.getTransform();return [m.a,m.b,m.c,m.d,m.e,m.f]};for(let i=0;i<3;i++)drawScene(g,false);const m=read();const pass=m.every((v,i)=>v===[1,0,0,1,0,0][i])&&before.x===camera.x&&before.y===camera.y&&before.zoom===camera.zoom;return {pass,transform:m,camera:{...camera}}}
window.flora={getState:snapshot,catalog,dims:dimensions,handles:handlePoints,testCameraDrift,get tools(){return toolDefs.map(t=>t.name)},run:(name,input={})=>{const t=toolDefs.find(t=>t.name===name);if(!t)throw Error(t('errUnknownTool'));return t.run(input)}};
if(state.card.elements&&!state.card._presetElements){/* 迁移在 co 创建后执行 */}
co=createCoDesign({$,catalog,sprites,commit,getState:()=>state,displayCard,checkRevision,snapshot,toast,modal,el,download,signal,undo,addAsset,refreshLibrary:()=>{drawer();render()}});
toolDefs.push(...co.tools,{name:'get_design_preview',description:'读取当前花束或贺卡的真实渲染图片，设计后用来检查视觉效果；不修改作品。默认 1024px jpeg(0.85),可用 maxWidth/quality/format 调整。 EN: Read a real rendered image of the bouquet or card for visual review after designing; does not modify the work. Defaults to 1024px jpeg 0.85; tune with maxWidth/quality/format.',read:true,image:true,schema:{target:{type:'string',enum:['bouquet','card']},maxWidth:{type:'integer'},quality:{type:'number'},format:{type:'string',enum:['png','jpeg']}},required:['target'],run:({target,maxWidth,quality,format})=>renderImage(target,maxWidth,quality,format)},{name:'export_work',description:'导出当前成品图片(花束或贺卡)用于交付给用户,与预览同一渲染器;默认 1024px jpeg(0.85),可用 maxWidth/quality/format 调整。 EN: Export the finished bouquet or card as an image to deliver to the user, same renderer as the preview; defaults to 1024px jpeg 0.85, tunable via maxWidth/quality/format.',image:true,schema:{target:{type:'string',enum:['bouquet','card']},maxWidth:{type:'integer'},quality:{type:'number'},format:{type:'string',enum:['png','jpeg']}},required:['target'],run:({target,maxWidth,quality,format})=>renderImage(target,maxWidth,quality,format)});
async function renderImage(target,maxWidth=1024,quality=.85,format='jpeg'){const mw=Math.max(64,Math.min(2048,Math.round(Number(maxWidth)||1024))),q=Math.max(.1,Math.min(1,Number(quality)||.85)),fmt=format==='png'?'png':'jpeg';let src;if(target==='card'){const im=new Image();await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=()=>reject(Error(t('errCardRender')));im.src=co.cardImage()});src=im}else{if(!assetReady)throw Error(t('errNotReady'));const c=document.createElement('canvas');c.width=1000;c.height=1050;drawScene(c.getContext('2d'),false);src=c}const k=Math.min(1,mw/Math.max(src.width,src.height)),out=document.createElement('canvas');out.width=Math.round(src.width*k);out.height=Math.round(src.height*k);const g=out.getContext('2d');if(fmt==='jpeg'){g.fillStyle='#ffffff';g.fillRect(0,0,out.width,out.height)}g.drawImage(src,0,0,out.width,out.height);return {data:out.toDataURL('image/'+fmt,q).split(',')[1],mime:'image/'+fmt}}
$('#edit-card').textContent=t('editCard');$('#edit-card').onclick=co.openEditor;
$('#card-follow').onclick=()=>{const keys=[...document.querySelectorAll('[data-preset]')].map(b=>b.dataset.preset);if(!keys.includes(state.preset)){toast(t('tNoPresetCard'));return}const p=preset(state.preset);const tc=p.cardTemplate&&co.templateCard(p.cardTemplate,getLang()==='en'?(p.cardEn||p.card):p.card);if(!tc){toast(t('tNoPresetCard'));return}commit(()=>{state.card={...state.card,...tc};markPresetCard(state);state.cardEdited=false},'card_edit');toast(t('tCardFollowed'))};
$('#personal-library').onclick=co.openLibrary;$('#library-home')?.addEventListener('click',()=>co.openLibrary());
/* ---- 登录区与同步状态：身份由服务端 /api/me 下发；数据本期仍存本机，「已同步 · 本机」不表示已上云 ---- */
function renderLoginArea(){
 const area=$('#login-area');if(!area)return;area.replaceChildren();
 if(loginUser){
  if(loginUser.avatar){const im=el('img');im.src=loginUser.avatar;im.alt='';area.append(im)}
  area.append(el('span',loginUser.name||t('loggedIn')));
  const out=el('button',t('logout'));out.onclick=async()=>{try{await fetch('/api/logout',{method:'POST'})}catch{}loginUser=null;renderLoginArea();$('#save-status').textContent=saveStatusText()};area.append(out)
 }else{
  const link=el('button',t('login'),'login-link');link.onclick=()=>location.href='/api/login';area.append(link)
 }
}
async function initLogin(){
 const area=$('#login-area');if(!area)return;area.replaceChildren();area.hidden=true;renderLoginArea();
 try{
  const health=await (await fetch('/api/health')).json();
  if(!health.login)return
  area.hidden=false;
  const resp=await fetch('/api/me');
  if(resp.ok){loginUser=await resp.json();renderLoginArea();setStatus(saveStatusText())}
 }catch{/* 纯静态环境没有 /api，登录区保持隐藏 */}
}
/* ---- 侧栏常驻引导卡片 ---- */
$('#guide-copy')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#guide-prompt').textContent);toast(t('tCopied'))}catch{toast(t('tCopySelect'))}});
if(state.card.elements){co.syncLegacy(state);if(!state.card._presetElements&&co.isTemplateProduct(state.card))markPresetCard(state)}
/* ---- 641–1100px 中等宽度:右栏 tab 整合 ---- */
const panelQuery=matchMedia('(max-width:1100px)');
// Pages retain their parents across breakpoints; only visibility changes.
const midState={active:'presets',pages:Object.fromEntries(['presets','assets','card'].map(k=>[k,$('#midpage-'+k)]))};
function midShow(k){if(!midState.pages[k])return;midState.active=k;for(const [key,p] of Object.entries(midState.pages))p.classList.toggle('on',key===k);$$('#mid-tabs button').forEach(b=>{const active=b.dataset.midtab===k;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))})}
$$('#mid-tabs button').forEach(b=>b.onclick=()=>midShow(b.dataset.midtab));
function applyMode(){const panel=panelQuery.matches;document.body.classList.toggle('small-layout',panel);if(!panel)$('.workspace').style.height='';midShow(midState.active)}
/* ---- 小屏画布/面板分隔条 ---- */
{const sp=$('#splitter');let sd=null;
 if(sp){sp.addEventListener('pointerdown',e=>{sd={y:e.clientY,h:$('.workspace').getBoundingClientRect().height};sp.setPointerCapture(e.pointerId);e.preventDefault()});
 sp.addEventListener('pointermove',e=>{if(!sd)return;const h=Math.max(innerHeight*.25,Math.min(innerHeight*.7,sd.h+(e.clientY-sd.y)));$('.workspace').style.height=h+'px'});
 const end=()=>{sd=null};sp.addEventListener('pointerup',end);sp.addEventListener('pointercancel',end)}}
if(panelQuery.addEventListener)panelQuery.addEventListener('change',applyMode);else panelQuery.addListener(applyMode);window.addEventListener('resize',applyMode);
applyI18n();setStatus(saveStatusText());render();load();onLangChange(()=>{applyI18n();if($('#modal').open)$('#modal').close();$('#edit-card').textContent=t('editCard');if(!agentConnected)$('#agent-status').textContent=t('waiting');renderLoginArea();setStatus(saveStatusText());render()});document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;if((e.metaKey||e.ctrlKey)&&e.key==='z'){e.preventDefault();e.shiftKey?redo():undo()}else if((e.metaKey||e.ctrlKey)&&e.key==='s'){e.preventDefault();openProjects()}});
/* ---- 首次访问欢迎卡 ---- */
function welcome(){
 modal('',body=>{body.classList.add('welcome');
 const brand=el('div',null,'welcome-brand');brand.append(el('span','♧','welcome-logo'),el('strong',t('brandName')));body.append(brand);
 body.append(el('p',t('wcTag'),'welcome-tag'));
 const feedback=(btn,ok)=>{const old=btn.textContent;btn.textContent=t(ok?'tCopiedShort':'tCopyFailShort');btn.disabled=true;setTimeout(()=>{btn.textContent=old;btn.disabled=false},1600)};
 const doCopy=async(btn,text)=>{try{await navigator.clipboard.writeText(text);feedback(btn,true)}catch{feedback(btn,false)}};
 const bubble=el('div',null,'welcome-bubble'),prompt=t('qsPrompt');bubble.append(el('p',prompt));
 const copy=el('button',t('qsCopy'),'primary');copy.onclick=()=>doCopy(copy,bubble.querySelector('p').textContent);
 bubble.append(copy);body.append(bubble);
 const chips=el('div',null,'welcome-chips');
 for(const k of ['wcChip1','wcChip2','wcChip3']){const c=el('button',t(k));c.onclick=()=>{const text=t(k+'Prompt');bubble.querySelector('p').textContent=text;doCopy(c,text)};chips.append(c)}
 body.append(chips);
 const foot=el('div',null,'welcome-foot');foot.append(el('small',t('wcNote')));
 const later=el('button',t('wcLater'));later.onclick=()=>$('#modal').close();foot.append(later);body.append(foot);
 });
}
welcome();
applyMode();initLogin();
