// Lightweight i18n: locale from Kimi desktop env, else navigator.language; 'en*' → English, otherwise Chinese.
const DICT={
brandName:{zh:'AI 花艺师',en:'AI Florist'},
errAssetSave:{zh:'素材保存失败',en:'Failed to save the asset'},
errSourceUrl:{zh:'来源必须是网页地址',en:'Source must be a web URL'},
errAssetName:{zh:'请提供80字内的素材名称',en:'Please provide an asset name within 80 characters'},
errAssetCat:{zh:'未知素材分类',en:'Unknown asset category'},
errAssetRole:{zh:'未知素材用途',en:'Unknown asset role'},
errWrapRole:{zh:'包装类需要标明包装或花器',en:'Wrap assets must be marked as wrap or vase'},
errAnchorRange:{zh:'连接点必须在0到1之间',en:'Anchor must be between 0 and 1'},
errImageData:{zh:'图片数据过大或缺失',en:'Image data is too large or missing'},
errImageUrl:{zh:'请提供 HTTPS 图片直链或 PNG/JPEG/WebP 的 data URL',en:'Please provide an HTTPS image URL or a PNG/JPEG/WebP data URL'},
errImageFetch:{zh:'无法读取图片；可能不允许跨域。请由 Agent 下载后用 data URL 导入，或使用本地上传。',en:'Cannot read the image — cross-origin access is likely blocked. Let the agent download it and import via data URL, or upload a local file.'},
errImageSize:{zh:'单张图片不能超过8MB',en:'Each image must be under 8MB'},
errImageType:{zh:'仅接受 PNG、JPEG 或 WebP 图片，不接受网页或 SVG',en:'Only PNG, JPEG or WebP images are accepted — no web pages or SVG'},
errImageDim:{zh:'图片尺寸不能超过8192像素',en:'Image dimensions must be under 8192 pixels'},
errImageInvalid:{zh:'素材图片无效',en:'Invalid asset image'},
errBundleFormat:{zh:'素材备份格式错误',en:'Invalid asset backup format'},
errBundleImage:{zh:'素材缺少图片',en:'Asset is missing image data'},
errBundleHash:{zh:'素材校验失败',en:'Asset checksum failed'},
errTooManyEls:{zh:'贺卡最多100个元素',en:'Cards support at most 100 elements'},
errElId:{zh:'元素 id 重复或缺失',en:'Duplicate or missing element id'},
errElType:{zh:'元素类型错误',en:'Invalid element type'},
errElNum:{zh:'元素坐标必须为数字',en:'Element coordinates must be numbers'},
errElBounds:{zh:'元素尺寸或坐标超出范围',en:'Element size or position out of range'},
errElAsset:{zh:'未知图片素材',en:'Unknown image asset'},
errElDecor:{zh:'装饰元素参数无效',en:'Invalid decoration parameters'},
errElText:{zh:'文字样式无效',en:'Invalid text style'},
errCardMoving:{zh:'用户正在移动贺卡元素',en:'The user is moving a card element'},
errElMissing:{zh:'元素不存在',en:'Element not found'},
errPaper:{zh:'底色使用六位十六进制颜色',en:'Paper must be a six-digit hex color'},
errBackupSize:{zh:'备份超过80MB',en:'Backup exceeds 80MB'},
errNotLibBackup:{zh:'请选择素材库备份',en:'Please choose a library backup file'},
errUnknownAsset:{zh:'未知素材',en:'Unknown asset'},
errObjId:{zh:'缺少对象 id',en:'Missing object id'},
errParentId:{zh:'parentId 格式错误',en:'Invalid parentId format'},
errSlot:{zh:'slot 无效',en:'Invalid slot'},
errObjRange:{zh:'对象参数超出范围',en:'Object parameters out of range'},
errScene:{zh:'作品格式不正确',en:'Invalid project format'},
errTie:{zh:'绑点格式不正确',en:'Invalid tie point format'},
errAttach:{zh:'饰品只能附着在存在的花材上',en:'Accessories can only attach to an existing flower'},
errObjIdDup:{zh:'对象 id 重复',en:'Duplicate object id'},
errDragging:{zh:'用户正在拖动，请稍后重新读取状态',en:'The user is dragging — read the state again shortly'},
errRevision:{zh:'画布已更新，请读取最新 revision 后重试',en:'The canvas has changed — read the latest revision and retry'},
errSlotAnchor:{zh:'slotAnchor 坐标无效',en:'Invalid slotAnchor coordinates'},
errProposalCount:{zh:'需要1至3个方案',en:'Provide 1 to 3 proposals'},
errProposalFormat:{zh:'方案格式不正确',en:'Invalid proposal format'},
errNoProposals:{zh:'当前没有可选方案',en:'No proposals available'},
errUnknownTool:{zh:'未知工具',en:'Unknown tool'},
errCardRender:{zh:'贺卡渲染失败',en:'Card render failed'},
errNotReady:{zh:'素材尚未就绪',en:'Assets are not ready yet'},
errCardTpl:{zh:'未知贺卡模板',en:'Unknown card template'},
errObjMissing:{zh:'对象不存在',en:'Object not found'},
errImageDl:{zh:'图片下载失败',en:'Image download failed'},
errLoadFail:{zh:'花材未能加载，请刷新重试：',en:'Failed to load flowers — please refresh: '},
errParamNum:{zh:'参数必须为有限数字',en:'Parameter must be a finite number'},
errIndexRange:{zh:'方案序号超出范围',en:'Index out of range'},
errSheetLoad:{zh:'加载失败',en:'failed to load'},
canvasAria:{zh:'花束编辑画布，可拖动花材，选中后使用方向键移动',en:'Bouquet canvas — drag stems to arrange, use arrow keys when an item is selected'},
presetsAria:{zh:'灵感面板',en:'Inspiration panel'},
searchAria:{zh:'搜索素材',en:'Search assets'},
cardPreviewAria:{zh:'贺卡预览',en:'Card preview'},
restoreLibAria:{zh:'恢复素材库备份',en:'Restore library backup'},
newTextDefault:{zh:'写一句心意',en:'Write a wish'},
metaTitle:{zh:'AI 花艺师 · 一起设计一束花',en:'AI Florist · Design a Bouquet Together'},
metaDesc:{zh:'描述想送的人，与花艺师共同设计花束、饰品与贺卡。',en:'Describe who the flowers are for, and design the bouquet, accessories and card together with an AI florist.'},
presetHalloweenTwilight:{zh:'万圣节 · 暮色南瓜',en:'Halloween · Pumpkin Twilight'},
presetMotherSoftlight:{zh:'母亲节 · 温柔有枝',en:'Mother’s Day · Gentle Light'},
presetJanuaryDawn:{zh:'元旦 · 第一束晨光',en:'New Year’s Day · First Light'},
presetChristmasSnowfall:{zh:'圣诞 · 雪夜松语',en:'Christmas · Snowfall Letters'},
presetValentine99:{zh:'绯红誓言',en:'Crimson Devotion'},subValentine99:{zh:'情人节 · 正红圆球',en:'Valentine · red dome'},

presetGraduationDay:{zh:'一路生花',en:'Bloom On'},subGraduationDay:{zh:'毕业季 · 向日葵扇形',en:'Graduation · sunflower fan'},
presetChristmasCarol:{zh:'圣诞颂歌',en:'A Carol of Roses'},subChristmasCarol:{zh:'圣诞 · 红金明亮',en:'Christmas · red & gold'},

chooseImage:{zh:'选择图片',en:'Choose image'},
undo:{zh:'撤销',en:'Undo'},redo:{zh:'重做',en:'Redo'},

library:{zh:'素材库',en:'Library'},projects:{zh:'作品',en:'Projects'},recipe:{zh:'花店参考单',en:'Florist Sheet'},exportWork:{zh:'导出作品',en:'Export'},
login:{zh:'登录 kimi',en:'Sign in with Kimi'},logout:{zh:'退出',en:'Sign out'},loggedIn:{zh:'已登录',en:'Signed in'},
savedLocal:{zh:'已存本机',en:'Saved locally'},syncedLocal:{zh:'已同步 · 本机',en:'Synced · Local'},saveFail:{zh:'保存失败，请导出备份',en:'Save failed — export a backup'},
titleAria:{zh:'作品名称',en:'Project name'},newBrief:{zh:'说说想送的人 ↗',en:'Who is it for? ↗'},loading:{zh:'正在准备花材…',en:'Preparing flowers…'},
replace:{zh:'替换',en:'Replace'},backward:{zh:'后移',en:'Backward'},forward:{zh:'前移',en:'Forward'},
lock:{zh:'锁定',en:'Lock'},unlock:{zh:'解锁',en:'Unlock'},copy:{zh:'复制',en:'Duplicate'},remove:{zh:'移除',en:'Remove'},more:{zh:'更多',en:'More'},
tabFlowers:{zh:'花材',en:'Flowers'},tabWrap:{zh:'包装',en:'Wrap'},tabExtras:{zh:'饰品',en:'Extras'},tabBg:{zh:'背景',en:'Scene'},done:{zh:'完成调整',en:'Done'},camReset:{zh:'回到花束',en:'Back to bouquet'},tMigrated:{zh:'检测到旧版多束内容，已为你重置为默认花束，可点左侧灵感重新选择',en:'Legacy multi-bouquet content detected — reset to the default bouquet; pick a design from Ideas on the left.'},

myLibrary:{zh:'我的素材 / 导入',en:'My assets / Import'},searchPh:{zh:'搜索花材',en:'Search flowers'},searchPhWrap:{zh:'搜索包装',en:'Search wrap'},searchPhExtras:{zh:'搜索饰品',en:'Search extras'},closeDrawer:{zh:'关闭素材库',en:'Close library'},closeModal:{zh:'关闭',en:'Close'},
hint:{zh:'拖动花枝调整位置 · 空白处拖动整束 · 双指缩放整束 · 支持撤销',en:'Drag stems to arrange · drag blank to move all · pinch to zoom all · undo supported'},
together:{zh:'一起设计',en:'Design Together'},closeAside:{zh:'收起花艺师',en:'Collapse panel'},connect:{zh:'接入花艺师',en:'Connect Florist'},connected:{zh:'花艺师已接入',en:'Florist Connected'},
florist:{zh:'花艺师',en:'Florist'},waiting:{zh:'等待 Agent 接入',en:'Waiting for agent'},agentOn:{zh:'Agent 已接入',en:'Agent connected'},


card:{zh:'贺卡',en:'Card'},assets:{zh:'素材',en:'Assets'},midPresets:{zh:'灵感',en:'Ideas'},midGuide:{zh:'引导',en:'Guide'},editCard:{zh:'设计贺卡',en:'Design Card'},cardFollow:{zh:'跟随花束',en:'Match Bouquet'},cardFollowTitle:{zh:'把贺卡重置为当前花束预设的配套模板',en:'Reset the card to the template paired with the current bouquet'},tNoPresetCard:{zh:'当前是自定义搭配，没有配套贺卡',en:'No paired card for a custom design'},tCardFollowed:{zh:'已恢复为预设配套贺卡',en:'Card reset to the preset template'},meaning:{zh:'这束花的心意',en:'The meaning'},
mNoAgent:{zh:'还没有 Agent 接入：点上方标题下的 ⧉ 复制提示词，发给你的 Agent，它就会来这里接棒设计。',en:'No agent connected yet — hit ⧉ Copy prompt above the title and send it to your agent; it will pick up the design here.'},sendAria:{zh:'提交修改要求',en:'Send request'},
presetCream:{zh:'奶油蕾丝',en:'Cream Lace'},presetGreen:{zh:'清新白绿',en:'Fresh Green'},presetPink:{zh:'粉色祝福',en:'Pink Wishes'},presetSunny:{zh:'明亮庆祝',en:'Bright Day'},
presetPearl:{zh:'珍珠百合',en:'Pearl Lily'},presetLinear:{zh:'建筑直线',en:'Architecture'},presetTropic:{zh:'热带雕塑',en:'Tropic'},presetWild:{zh:'自然野趣',en:'Wildside'},
presetVintage:{zh:'浓郁复古',en:'Vintage'},presetPop:{zh:'明亮俏皮',en:'Pop'},presetZen:{zh:'克制东方',en:'Zen'},
presetNewFestival0:{zh:'春节 · 灯火初上',en:'New Year · Lantern Glow'},subNewFestival0:{zh:'春节 · 灯火初上',en:'New Year · Lantern Glow'},
presetNewFestival1:{zh:'七夕 · 夜色来信',en:'Qixi · Midnight Letter'},subNewFestival1:{zh:'七夕 · 夜色来信',en:'Qixi · Midnight Letter'},
presetNewFestival2:{zh:'端午 · 青风入夏',en:'Dragon Boat · Summer Green'},subNewFestival2:{zh:'端午 · 青风入夏',en:'Dragon Boat · Summer Green'},
presetNewFestival3:{zh:'圣诞 · 炉边来客',en:'Christmas · By the Hearth'},subNewFestival3:{zh:'圣诞 · 炉边来客',en:'Christmas · By the Hearth'},
grpStyle:{zh:'风格',en:'Styles'},grpFestival:{zh:'节日',en:'Festivals'},
presetSunnyTeacher:{zh:'谢师恩 · 桃李向阳',en:'Teacher’s Day · Thanks'},presetBlushVow:{zh:'囍宴 · 粉雾手捧',en:'Wedding · Blush Bouquet'},presetMoonGold:{zh:'中秋 · 月满金秋',en:'Mid-Autumn · Moon Gold'},presetAutumnOde:{zh:'秋日叙 · 焦糖时光',en:'Autumn · Caramel Ode'},presetCrimsonBlessing:{zh:'重阳 · 福寿绵长',en:'Double Ninth · Crimson'},
subSunnyTeacher:{zh:'教师节送老师 · 向日葵的感恩',en:'Sunflowers for teachers'},subBlushVow:{zh:'囍宴抱抱桶 · 红粉浓郁',en:'Crimson celebration bucket'},subMoonGold:{zh:'中秋月圆 · 暖秋花篮',en:'Autumn harvest basket'},subAutumnOde:{zh:'秋日长销 · 焦糖油画感',en:'Caramel autumn tones'},subCrimsonBlessing:{zh:'重阳敬长辈 · 红火福寿',en:'Crimson blessings for elders'},
subCream:{zh:'奶油粉白 · 温柔而有力量',en:'Cream & blush · gentle strength'},subGreen:{zh:'自然白绿 · 留白与呼吸',en:'Green & white · room to breathe'},
subPink:{zh:'粉色花园 · 柔软的祝福',en:'Pink garden · soft blessings'},subSunny:{zh:'明亮庆祝 · 充满生命力',en:'Bright celebration · full of life'},
subPearl:{zh:'珍珠百合 · 纯白心意',en:'Pearl lily · pure white wishes'},subLinear:{zh:'冷感建筑 · 直线与留白',en:'Cool lines · architectural whitespace'},
subTropic:{zh:'热带雕塑 · 体量与浓烈',en:'Tropical sculpt · bold volume'},subWild:{zh:'自然野趣 · 松散与自由',en:'Wild & loose · free spirit'},
subVintage:{zh:'浓郁复古 · 暗调旧时光',en:'Moody vintage · old times'},subPop:{zh:'明亮俏皮 · 撞色晴天',en:'Playful pop · color clash'},
subZen:{zh:'克制东方 · 一枝知秋',en:'Zen east · one stem, one season'},subCustom:{zh:'为你们设计的一束花',en:'A bouquet designed for you'},



tAdded:{zh:'已加入 ',en:'Added '},tCardAsset:{zh:'请在贺卡设计中添加这张图片',en:'Add this image in the card designer'},
tReplaceHint:{zh:'选择一种素材替换，保留位置与大小',en:'Pick a replacement — position and size stay'},
tAttached:{zh:'饰品已附着在这枝花上',en:'Accessory pinned to the stem'},





tCopied:{zh:'已复制，可以粘贴给 Agent',en:'Copied — paste it to your agent'},tCopiedShort:{zh:'✓ 已复制',en:'✓ Copied'},tCopyFailShort:{zh:'复制失败，请手动复制',en:'Copy failed — copy manually'},tCopySelect:{zh:'请复制选中的文字',en:'Copy the selected text'},
tCopyFail:{zh:'复制不可用，请下载参考单',en:'Copy unavailable — download the sheet'},tSaved:{zh:'已保存作品版本',en:'Version saved'},pAnother:{zh:'换一批',en:'Try another batch'},pAnotherReq:{zh:'这几版方案都不太合适，请换一批新的设计方向，仍然给我三个方案。',en:'None of these fit — please propose a fresh batch of three design directions.'},pPending:{zh:' 个方案待选',en:' proposals to pick'},pCurrent:{zh:'✓ 当前',en:'✓ Current'},pDismiss:{zh:'忽略这个方案',en:'Dismiss this proposal'},
tNoSpace:{zh:'存储空间不足，请导出备份',en:'Storage full — export a backup'},tImportFail:{zh:'无法导入：',en:'Import failed: '},













projectsTitle:{zh:'我的作品 · 保存在此设备',en:'My Projects · stored on this device'},saveVersion:{zh:'保存当前版本',en:'Save Current Version'},
exportBackup:{zh:'导出可编辑备份',en:'Export Editable Backup'},restoreHint:{zh:'恢复已导出的作品备份',en:'Restore an exported backup'},

wcTag:{zh:'和 Agent 一起，设计一束真正有心的花',en:'Design a bouquet that truly means something, together with your agent'},
wcChip1:{zh:'生日花束',en:'A birthday bouquet'},wcChip2:{zh:'纪念日惊喜',en:'An anniversary surprise'},wcChip3:{zh:'乔迁新居的祝福',en:'New-home wishes'},
wcChip1Prompt:{zh:'好朋友下周生日，我想送一束明亮、有惊喜感的花。你先读一下花艺工作台 brief，给我三个风格方案。',en:'My best friend’s birthday is next week. I’d like a bright, delightful bouquet. Read the florist workbench brief first and propose three styles.'},wcChip2Prompt:{zh:'我们的纪念日快到了，我想设计一束浪漫一点、但不落俗套的花。你先读一下花艺工作台 brief，给我三个风格方案。',en:'Our anniversary is coming. I’d like a romantic bouquet that doesn’t feel cliché. Read the florist workbench brief first and propose three styles.'},wcChip3Prompt:{zh:'朋友刚搬新家，我想送一束有生机、适合摆在家里的花。你先读一下花艺工作台 brief，给我三个风格方案。',en:'A friend just moved into a new home. I’d like a lively bouquet that looks great in a living space. Read the florist workbench brief first and propose three styles.'},
wcNote:{zh:'复制 prompt 发给你的 Agent，即可开始共同设计',en:'Paste a prompt to your agent to start designing together'},wcLater:{zh:'先自己逛逛',en:'Browse on my own'},
qsPrompt:{zh:'我想给即将搬新家的朋友设计一束花，你先读一下花艺工作台 brief，给我三个风格方案。',en:'I want a bouquet for a friend who is moving house. Read the florist workbench brief first and propose three styles.'},
qsCopy:{zh:'⧉ 复制提示词',en:'⧉ Copy Prompt'},
refSheet:{zh:'花店参考单',en:'Florist Reference'},refIntent:{zh:'设计意图',en:'Design Intent'},
roleFlower:{zh:'花材',en:'Flower'},roleLeaf:{zh:'叶材',en:'Greenery'},roleWrap:{zh:'包装',en:'Wrap'},roleVase:{zh:'花器',en:'Vase'},roleAcc:{zh:'饰品',en:'Accessory'},roleCardImg:{zh:'卡片图片',en:'Card Image'},rolePaper:{zh:'纸张纹理',en:'Paper Texture'},
bgIvory:{zh:'暖白',en:'Warm White'},bgSage:{zh:'灰绿',en:'Sage'},bgPink:{zh:'浅粉',en:'Blush'},bgStone:{zh:'石灰',en:'Stone'},bgDark:{zh:'深墨',en:'Ink'},bgMooncream:{zh:'米月白',en:'Moon Cream'},bgNight:{zh:'夜空蓝',en:'Night Sky'},bgFestive:{zh:'禧红',en:'Festive Red'},refMaterials:{zh:'花材与装饰',en:'Flowers & Decor'},refCard:{zh:'贺卡',en:'Card'},
refFooter:{zh:'AI 花艺师 · 可在浏览器中打印或另存为 PDF',en:'AI Florist · print or save as PDF in the browser'},
refAltBouquet:{zh:'花束效果参考',en:'Bouquet preview'},refAltCard:{zh:'贺卡设计',en:'Card design'},
materialsNote:{zh:'花束效果为搭配参考；枝叶与花序数量为画布素材数量，不等于花店整扎规格。请花店确认品种、用量和可制作性。缺货时优先保留色系、轮廓和主花位置，替换需与送花人确认。',en:'The rendering is a styling reference; stem counts are canvas asset counts, not florist bunch specs. Please confirm varieties, quantities and feasibility with the florist. If items are out of stock, keep the palette, silhouette and focal flowers; confirm substitutions with the sender.'},
cardEditorTitle:{zh:'一起设计贺卡',en:'Design the Card Together'},
addText:{zh:'添加文字',en:'Add Text'},pickImage:{zh:'选择素材图片',en:'Choose an image'},addDecor:{zh:'添加装饰',en:'Add decoration'},
templates:{zh:'模板',en:'Templates'},importImage:{zh:'导入图片',en:'Import Image'},paperAria:{zh:'贺卡纸色',en:'Card paper color'},
exportCard:{zh:'导出贺卡',en:'Export Card'},surfaceAria:{zh:'贺卡设计画布',en:'Card design canvas'},
inspectorHint:{zh:'点击文字或图片，可以拖动、旋转和缩放。',en:'Click text or an image to drag, rotate and resize.'},
typeText:{zh:'文字',en:'Text'},typeImage:{zh:'图片',en:'Image'},typeDecor:{zh:'装饰',en:'Decor'},
fX:{zh:'横坐标',en:'X'},fY:{zh:'纵坐标',en:'Y'},fW:{zh:'宽度',en:'Width'},fH:{zh:'高度',en:'Height'},fAngle:{zh:'角度',en:'Angle'},fDepth:{zh:'层级',en:'Layer'},
fSize:{zh:'字号',en:'Font size'},fLh:{zh:'行距',en:'Leading'},fColor:{zh:'文字颜色',en:'Text color'},color:{zh:'颜色',en:'Color'},
textAria:{zh:'贺卡元素文字',en:'Card element text'},fontAria:{zh:'贺卡字体',en:'Card font'},alignAria:{zh:'文字对齐',en:'Text alignment'},elementPosition:{zh:'元素位置',en:'Position'},centerHorizontal:{zh:'水平居中',en:'Center horizontally'},centerVertical:{zh:'垂直居中',en:'Center vertically'},backToCard:{zh:'返回贺卡',en:'Back to card'},
alignLeft:{zh:'左对齐',en:'Left'},alignCenter:{zh:'居中',en:'Center'},alignRight:{zh:'右对齐',en:'Right'},
decorText:{zh:'装饰文字',en:'Decor text'},deleteEl:{zh:'删除元素',en:'Delete element'},
tplTitle:{zh:'贺卡模板库',en:'Card Templates'},
tplIntro:{zh:'点击模板一键应用：应用后每个文字和装饰仍是独立元素，可以继续改字、拖动、改色或删除。',en:'Click a template to apply it — every text and decoration stays an independent element you can edit, drag, recolor or delete.'},
tplConfirm:{zh:'应用模板会替换贺卡当前全部内容（可通过撤销恢复），继续？',en:'Applying a template replaces all current card content (undo restores it). Continue?'},
tplApplied:{zh:'已应用模板「',en:'Applied template "'},
libTitle:{zh:'我的素材库',en:'My Asset Library'},
libIntro:{zh:'上传图片或粘贴图片直链。Agent 也可以搜索后导入；素材保存在当前浏览器，并可随作品备份。',en:'Upload images or paste direct URLs. An agent can also search and import for you; assets stay in this browser and travel with project backups.'},
assetName:{zh:'素材名称',en:'Asset name'},assetCat:{zh:'素材分类',en:'Asset category'},assetRole:{zh:'素材用途',en:'Asset usage'},
urlPh:{zh:'https://… 图片直链',en:'https://… direct image URL'},sourcePh:{zh:'来源网页（可选）',en:'Source page (optional)'},
uploadAria:{zh:'上传素材',en:'Upload asset'},addToLibrary:{zh:'加入素材库',en:'Add to Library'},importing:{zh:'正在导入…',en:'Importing…'},
savedDot:{zh:'已保存。',en:'Saved. '},usable:{zh:'可在素材列表中使用。',en:'Ready to use from the asset list.'},
emptyTitle:{zh:'素材库还是空的',en:'Your library is empty'},
emptyBody:{zh:'上传图片或粘贴图片直链，导入第一张自己的花材；Agent 也可以搜索后帮你导入。',en:'Upload an image or paste a URL to import your first flower — an agent can also search and import for you.'},
backupLibrary:{zh:'备份整个素材库',en:'Back Up Library'},restoreLibrary:{zh:'恢复素材库备份',en:'Restore Library Backup'},libRestored:{zh:'素材库已恢复',en:'Library restored'},
addToBouquet:{zh:'加入花束',en:'Add to Bouquet'},useForCard:{zh:'用于贺卡',en:'Use in Card'},source:{zh:'来源',en:'Source'},
catFlowers:{zh:'花材',en:'Flowers'},catWrap:{zh:'花器',en:'Vase'},catExtras:{zh:'饰品',en:'Extras'},catCard:{zh:'贺卡图片',en:'Card Image'},
warnBounds:{zh:'超出卡片边界 / extends beyond the card edge',en:'超出卡片边界 / extends beyond the card edge'},
warnOverflow:{zh:'文字超出文本框，请增加高度或减小字号 / text overflows the box',en:'文字超出文本框，请增加高度或减小字号 / text overflows the box'}
};
let lang=detect();
function detect(){const l=window.__KIMI_DESKTOP_ENV__?.locale||(typeof navigator!=='undefined'?navigator.language:'')||'zh';return String(l).toLowerCase().startsWith('en')?'en':'zh'}
export function t(k){const e=DICT[k];return e?(e[lang]??e.zh):k}
export function getLang(){return lang}
export function pick(pair){return pair?(lang==='en'?(pair.en??pair.zh):pair.zh):''}
export function onLangChange(fn){window.addEventListener('kimi-desktop-env-changed',()=>{const next=detect();if(next!==lang){lang=next;fn(lang)}})}
export function applyI18n(root=document){document.title=t('metaTitle');document.querySelector('meta[name="description"]')?.setAttribute('content',t('metaDesc'));for(const el of root.querySelectorAll('[data-i18n]'))el.textContent=t(el.dataset.i18n);for(const el of root.querySelectorAll('[data-i18n-ph]'))el.placeholder=t(el.dataset.i18nPh);for(const el of root.querySelectorAll('[data-i18n-aria]'))el.setAttribute('aria-label',t(el.dataset.i18nAria));for(const el of root.querySelectorAll('[data-i18n-title]'))el.title=t(el.dataset.i18nTitle)}
