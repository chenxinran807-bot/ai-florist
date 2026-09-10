/* ═══════════ 数据 ═══════════ */
let CATALOG = null;
const state = { bg: 'bg_plain', vase: 'vase_round:porcelain', props: [], placed: [] };
/* placed: {uid, flower, palette, name, x, y, angle, depth} */
let uidSeq = 1;

async function loadCatalog() {
  try {
    const r = await fetch('catalog.json', { cache: 'no-store' });
    CATALOG = await r.json();
  } catch (e) {
    CATALOG = typeof EMBEDDED_CATALOG !== 'undefined' ? EMBEDDED_CATALOG : null;
  }
  if (CATALOG) state.bg = CATALOG.backgrounds[0].id;
}

/* ═══════════ 渲染 ═══════════ */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function vaseInfo() {
  const [vid, mat] = state.vase.split(':');
  const v = CATALOG.vases.find(x => x.id === vid);
  return { v, mat, key: state.vase };
}
function flowerInfo(fid, pk) {
  const f = CATALOG.flowers.find(x => x.id === fid);
  const pl = f.palettes.find(p => p.key === pk) || f.palettes[0];
  return { f, pl };
}

function render() {
  $('#stage-wrap').style.background = CATALOG.backgrounds.find(b => b.id === state.bg).css;
  const { v } = vaseInfo();
  $('#layer-vase').innerHTML = SVG_LIB.vases[state.vase] || '';
  $('#layer-prop-back').innerHTML = state.props.includes('prop_fan') ? SVG_LIB.props.prop_fan : '';
  $('#layer-prop-front').innerHTML = state.props.filter(p => p !== 'prop_fan').map(p => SVG_LIB.props[p] || '').join('');
  const sorted = [...state.placed].sort((a, b) => a.depth - b.depth || a.y - b.y);
  let stems = '', heads = '';
  for (const pf of sorted) {
    const key = `${pf.flower}:${pf.palette}`;
    const svg = SVG_LIB.flowers[key];
    if (!svg) continue;
    const ax = v.anchor.x, ay = v.anchor.y;
    stems += `<line x1="${ax}" y1="${ay}" x2="${pf.x}" y2="${pf.y + 10}" stroke="${stemColor(pf.flower)}" stroke-width="3" stroke-linecap="round"/>`;
    heads += `<g transform="translate(${pf.x},${pf.y}) rotate(${pf.angle})">${svg}</g>`;
  }
  $('#layer-stems').innerHTML = stems;
  $('#layer-heads').innerHTML = heads;
  renderMine();
}
function stemColor(fid) {
  const f = CATALOG.flowers.find(x => x.id === fid);
  return f ? f.stem : '#55704a';
}

function slotPos(depth, index, total) {
  /* 以瓶口锚点为圆心排布：depth 1(后/高) 2(中) 3(前/低) */
  const { v } = vaseInfo();
  const spread = v.spread;
  const layerY = { 1: -95, 2: -70, 3: -45 }[depth];
  const cx = v.anchor.x, cy = v.anchor.y;
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const x = cx + (t - 0.5) * spread * 2;
  const y = cy + layerY + Math.abs(t - 0.5) * 22;
  const angle = (t - 0.5) * 36;
  return { x: Math.round(x), y: Math.round(y), angle: Math.round(angle) };
}
function relayout() {
  const groups = { 1: [], 2: [], 3: [] };
  for (const pf of state.placed) groups[pf.depth].push(pf);
  for (const d of [1, 2, 3]) groups[d].forEach((pf, i) => Object.assign(pf, slotPos(d, i, groups[d].length)));
  render();
}

function renderMine() {
  const el = $('#placed-list');
  if (!state.placed.length) { el.innerHTML = '（瓶中还空着）'; return; }
  el.innerHTML = state.placed.map(pf =>
    `<div><b>${pf.name}</b> — 位置(${pf.x},${pf.y}) 倾角${pf.angle}° 第${pf.depth}层</div>`
  ).join('');
}

/* ═══════════ 侧栏 ═══════════ */
function buildPanels() {
  const fg = $('#flower-grid');
  fg.innerHTML = CATALOG.flowers.map(f => {
    const pl = f.palettes[0];
    return `<div class="cell" data-f="${f.id}" title="${f.name}（${f.palettes.length} 种配色）">
      <svg viewBox="-45 -70 90 140">${SVG_LIB.flowers[f.id + ':' + pl.key] || ''}</svg><div class="nm">${f.name}</div></div>`;
  }).join('');
  fg.querySelectorAll('.cell').forEach(c => c.onclick = () => userAddFlower(c.dataset.f));

  const vg = $('#vase-grid');
  const MAT_NAMES = { porcelain: '白瓷', pottery: '粗陶', glass: '玻璃', matte_black: '哑黑' };
  vg.innerHTML = Object.keys(SVG_LIB.vases).map(key => {
    const [vid, mat] = key.split(':');
    const v = CATALOG.vases.find(x => x.id === vid);
    return `<div class="cell" data-v="${key}"><svg viewBox="120 140 160 170">${SVG_LIB.vases[key]}</svg><div class="nm">${v.name}·${MAT_NAMES[mat]}</div></div>`;
  }).join('');
  vg.querySelectorAll('.cell').forEach(c => c.onclick = () => {
    state.vase = c.dataset.v; relayout(); markSel(vg, c);
    log(`select_vase → ${c.textContent.trim()}`);
  });

  $('#bg-grid').innerHTML = CATALOG.backgrounds.map(b =>
    `<div class="cell" data-b="${b.id}"><div class="swatch" style="background:${b.css}"></div><div class="nm">${b.name}</div></div>`).join('');
  $('#bg-grid').querySelectorAll('.cell').forEach(c => c.onclick = () => {
    state.bg = c.dataset.b; render(); markSel($('#bg-grid'), c);
    log(`select_background → ${c.textContent.trim()}`);
  });

  $('#prop-grid').innerHTML = CATALOG.props.map(p =>
    `<div class="cell" data-p="${p.id}"><svg viewBox="100 220 200 90">${SVG_LIB.props[p.id]}</svg><div class="nm">${p.name}</div></div>`).join('');
  $('#prop-grid').querySelectorAll('.cell').forEach(c => c.onclick = () => {
    const id = c.dataset.p, i = state.props.indexOf(id);
    if (i >= 0) state.props.splice(i, 1); else state.props.push(id);
    render(); c.classList.toggle('sel', state.props.includes(id));
    log(`set_prop → ${c.textContent.trim()} ${state.props.includes(id) ? '放上' : '取下'}`);
  });
}
function markSel(container, cell) {
  container.querySelectorAll('.cell').forEach(x => x.classList.remove('sel'));
  cell.classList.add('sel');
}

$$('.tabs button').forEach(b => b.onclick = () => {
  $$('.tabs button').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  $$('.panel').forEach(p => p.classList.remove('active'));
  $('#panel-' + b.dataset.tab).classList.add('active');
});
$('#clear-btn').onclick = () => { state.placed = []; render(); log('clear_scene → 已清空'); };

/* ═══════════ 工具层（WEBMCP_TOOLS）═══════════ */
function log(msg) { $('#agent-log').textContent = msg; }
function mcp(obj) { return { content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] }; }
function flowerLabel(fid, pk) { const { f, pl } = flowerInfo(fid, pk); return `${f.name}·${pl.name}`; }

function userAddFlower(fid) {
  const f = CATALOG.flowers.find(x => x.id === fid);
  const pl = f.palettes[state.placed.filter(p => p.flower === fid).length % f.palettes.length];
  placeFlower(fid, pl.key, null, null);
}

function placeFlower(fid, paletteKey, depth, angle) {
  const f = CATALOG.flowers.find(x => x.id === fid);
  if (!f) return { ok: false, error: `没有 id 为 "${fid}" 的花材，可用 list_flowers 查询` };
  const pl = f.palettes.find(p => p.key === paletteKey) || f.palettes[0];
  const d = depth || (state.placed.length < 1 ? 2 : (state.placed.length < 3 ? 1 : 3));
  const pf = { uid: uidSeq++, flower: fid, palette: pl.key, name: flowerLabel(fid, pl.key), depth: d, x: 0, y: 0, angle: angle || 0 };
  state.placed.push(pf);
  relayout();
  if (angle) { pf.angle = angle; render(); }
  log(`place_flower → ${pf.name} @(${pf.x},${pf.y}) 第${d}层`);
  return { ok: true, uid: pf.uid, flower: pf.name, position: { x: pf.x, y: pf.y, angle: pf.angle }, depth: d };
}

const WEBMCP_TOOLS = [
  {
    name: 'list_flowers',
    description: '列出当前素材库中全部可选花材（含每个花型的全部配色变体）。返回 id、名称、配色 key、标签。想知道"现在有什么花可用"时先调用本工具；素材库会持续上新，每次调用返回的都是最新内容。',
    inputSchema: { type: 'object', properties: { tag: { type: 'string', description: '按标签筛选，如 主花/配花/叶材/干花/春/冬' } }, additionalProperties: false },
    execute: ({ tag } = {}) => {
      let list = [];
      for (const f of CATALOG.flowers) {
        if (tag && !f.tags.includes(tag)) continue;
        for (const pl of f.palettes) list.push({ id: f.id, name: f.name, palette: pl.key, palette_name: pl.name, tags: f.tags });
      }
      return mcp({ count: list.length, flowers: list });
    }
  },
  {
    name: 'search_flowers',
    description: '按关键词搜索花材（匹配名称与标签），返回匹配的花材及其配色。当用户描述想要的感觉（如"春天的""线条感的"）时用本工具找候选。',
    inputSchema: { type: 'object', properties: { query: { type: 'string', description: '关键词，如 玫瑰 / 干花 / 线条' } }, required: ['query'], additionalProperties: false },
    execute: ({ query }) => {
      const q = (query || '').toLowerCase();
      const hits = CATALOG.flowers.filter(f => f.name.includes(query) || f.tags.some(t => t.toLowerCase().includes(q)));
      return mcp({ count: hits.length, flowers: hits.map(f => ({ id: f.id, name: f.name, tags: f.tags, palettes: f.palettes.map(p => ({ key: p.key, name: p.name })) })) });
    }
  },
  {
    name: 'select_vase',
    description: '更换花瓶。必须用 "器型id:材质" 组合 key，可用组合见返回值或素材清单。换瓶后已插的花会自动按新瓶口重新落位。',
    inputSchema: { type: 'object', properties: { key: { type: 'string', description: '如 vase_round:porcelain。器型：vase_neck细颈/vase_round圆腹/vase_tube直筒/vase_bowl浅钵/vase_gourd葫芦/vase_trumpet撇口；材质：porcelain白瓷/pottery粗陶/glass玻璃/matte_black哑黑' } }, required: ['key'], additionalProperties: false },
    execute: ({ key }) => {
      if (!SVG_LIB.vases[key]) return mcp({ ok: false, error: `没有 "${key}" 这个组合`, available: Object.keys(SVG_LIB.vases) });
      state.vase = key; relayout();
      log(`select_vase → ${key}`);
      return mcp({ ok: true, vase: key });
    }
  },
  {
    name: 'select_background',
    description: '更换背景。id 可选：bg_plain素白 / bg_rice暖米 / bg_gray深灰 / bg_sage灰绿 / bg_ink墨蓝。',
    inputSchema: { type: 'object', properties: { id: { type: 'string', enum: ['bg_plain', 'bg_rice', 'bg_gray', 'bg_sage', 'bg_ink'] } }, required: ['id'], additionalProperties: false },
    execute: ({ id }) => { state.bg = id; render(); log(`select_background → ${id}`); return mcp({ ok: true, background: id }); }
  },
  {
    name: 'set_prop',
    description: '放上或取下一件造景（溪石/枯枝/青苔/素面团扇）。造景是花瓶周围的点缀，不是花。',
    inputSchema: { type: 'object', properties: { id: { type: 'string', enum: ['prop_stones', 'prop_branch', 'prop_moss', 'prop_fan'] }, present: { type: 'boolean', description: 'true 放上，false 取下' } }, required: ['id', 'present'], additionalProperties: false },
    execute: ({ id, present }) => {
      const i = state.props.indexOf(id);
      if (present && i < 0) state.props.push(id);
      if (!present && i >= 0) state.props.splice(i, 1);
      render(); log(`set_prop → ${id} ${present ? '放上' : '取下'}`);
      return mcp({ ok: true, props: state.props });
    }
  },
  {
    name: 'place_flower',
    description: '把一枝花插进瓶中。flower 用花材 id，palette 用配色 key（均可经 list_flowers 获得）。depth 为层次：1=后排/高，2=中，3=前排/低；不传则自动安排。插瓶后自动落位，整瓶重新布局。',
    inputSchema: {
      type: 'object', properties: {
        flower: { type: 'string', description: '花材 id，如 rose / tulip / plum' },
        palette: { type: 'string', description: '配色 key，如 blush / white；不传用该花型首个配色' },
        depth: { type: 'number', description: '层次 1/2/3，可选' },
        angle: { type: 'number', description: '额外倾角（度），可选' }
      }, required: ['flower'], additionalProperties: false
    },
    execute: (input) => mcp(placeFlower(input.flower, input.palette, input.depth, input.angle))
  },
  {
    name: 'move_flower',
    description: '调整一枝已插的花：可改层次 depth、额外倾角 angle。uid 由 get_scene_state 或 place_flower 返回值获得。调整后整瓶重新落位。',
    inputSchema: { type: 'object', properties: { uid: { type: 'number' }, depth: { type: 'number' }, angle: { type: 'number' } }, required: ['uid'], additionalProperties: false },
    execute: ({ uid, depth, angle }) => {
      const pf = state.placed.find(p => p.uid === uid);
      if (!pf) return mcp({ ok: false, error: `找不到 uid=${uid} 的花` });
      if (depth) { pf.depth = depth; relayout(); }
      if (typeof angle === 'number') { pf.angle = angle; render(); }
      log(`move_flower → uid${uid} 第${pf.depth}层 倾角${pf.angle}°`);
      return mcp({ ok: true, uid, position: { x: pf.x, y: pf.y, angle: pf.angle }, depth: pf.depth });
    }
  },
  {
    name: 'remove_flower',
    description: '从瓶中移除一枝花。uid 由 get_scene_state 获得。',
    inputSchema: { type: 'object', properties: { uid: { type: 'number' } }, required: ['uid'], additionalProperties: false },
    execute: ({ uid }) => {
      const i = state.placed.findIndex(p => p.uid === uid);
      if (i < 0) return mcp({ ok: false, error: `找不到 uid=${uid} 的花` });
      const [pf] = state.placed.splice(i, 1); relayout();
      log(`remove_flower → ${pf.name}`);
      return mcp({ ok: true, removed: pf.name });
    }
  },
  {
    name: 'get_scene_state',
    description: '返回当前作品的完整状态：背景、花瓶、造景、瓶中每枝花的 uid/品种/配色/位置/层次/倾角。在对现有作品提建议或修改前，必须先调用本工具看清画面。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    execute: () => mcp({
      background: state.bg, vase: state.vase, props: state.props,
      flowers: state.placed.map(p => ({ uid: p.uid, flower: p.flower, palette: p.palette, name: p.name, x: p.x, y: p.y, angle: p.angle, depth: p.depth }))
    })
  },
  {
    name: 'suggest_flowers',
    description: '按主题给出选花建议（基于内置花艺规则：主花定调、配花过渡、叶材线条、奇数为美）。返回建议组合与理由；仅为建议，实际插花仍用 place_flower。',
    inputSchema: { type: 'object', properties: { mood: { type: 'string', description: '如 春日 / 侘寂 / 热烈 / 清冷' } }, required: ['mood'], additionalProperties: false },
    execute: ({ mood }) => {
      const rules = {
        '春日': { pick: [['tulip', 'lilac', 2], ['gypsophila', 'white', 3], ['eucalyptus', 'graygreen', 1]], why: '郁金香定春日基调，满天星在前景压低，尤加利拉出后排线条。' },
        '侘寂': { pick: [['plum', 'white', 2], ['pampas', 'wheat', 1], ['cotton', 'white', 3]], why: '梅枝一枝足矣，蒲苇与棉花取枯淡之意，留白为主。' },
        '热烈': { pick: [['sunflower', 'gold', 2], ['rose', 'crimson', 2], ['lavender', 'purple', 1]], why: '向日葵与深红玫瑰撞出体量感，薰衣草在后排补竖线。' },
        '清冷': { pick: [['lily', 'white', 2], ['hydrangea', 'blue', 3], ['eucalyptus', 'graygreen', 1]], why: '白百合配浅蓝绣球取冷色，尤加利灰绿过渡。' }
      };
      const r = rules[mood] || { pick: [['rose', 'blush', 2], ['daisy', 'white', 3], ['eucalyptus', 'graygreen', 1]], why: `没有「${mood}」的预设，按经典三段式建议：主花+配花+叶材。` };
      return mcp({ mood, suggestion: r.pick.map(([flower, palette, depth]) => ({ flower, palette, depth, name: flowerLabel(flower, palette) })), reason: r.why });
    }
  },
  {
    name: 'critique_arrangement',
    description: '以花艺师视角点评当前作品（内置规则：奇数为美、层次要有高中低、配色不宜超过三种、中间层要有主花定调）。返回结构化点评，指出问题并给出可执行的修改建议。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    execute: () => {
      const n = state.placed.length, issues = [], praise = [];
      if (n === 0) return mcp({ summary: '瓶中还空着。', issues: ['先插一枝主花定调。'], score: 0 });
      if (n % 2 === 1) praise.push(`${n} 枝成景，合奇数之宜`); else issues.push(`${n} 枝为偶数，可增减一枝取其奇`);
      const depths = new Set(state.placed.map(p => p.depth));
      if (depths.size >= 2) praise.push('层次有高中低'); else issues.push('花都在同一层，试试分出前后排');
      const pals = new Set(state.placed.map(p => p.palette));
      if (pals.size > 3) issues.push(`用了 ${pals.size} 种配色，宜收到三种以内`);
      else praise.push('配色克制');
      if (!state.placed.some(p => p.depth === 2)) issues.push('缺中间层的主花定调');
      const score = Math.max(2, 10 - issues.length * 2);
      log(`critique_arrangement → ${score}分`);
      return mcp({ score, praise, issues, tip: issues[0] || '这瓶花已经站住了。' });
    }
  },
  {
    name: 'clear_scene',
    description: '清空瓶中全部花（保留花瓶、背景与造景）。用户想重新创作时使用；此操作不可撤销，调用前确认用户意图。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    execute: () => { const n = state.placed.length; state.placed = []; render(); log('clear_scene → 已清空'); return mcp({ ok: true, removed: n }); }
  },
  {
    name: 'what_is_new',
    description: '返回素材库最近上新的花材与器皿（依据素材清单的版本与更新时间字段）。用户问"最近有什么新花"时使用。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    execute: () => mcp({
      catalog_version: CATALOG.version, updated_at: CATALOG.updated_at,
      flowers_count: CATALOG.flowers.length, vases_count: Object.keys(SVG_LIB.vases).length,
      note: '本季主推：梅枝、蒲苇、棉花枝（冬意三品）'
    })
  },
];

/* ═══════════ WebMCP 注册 / 演示模式 ═══════════ */
if ('modelContext' in navigator) {
  WEBMCP_TOOLS.forEach(t => navigator.modelContext.registerTool(t));
  $('#tool-count').textContent = `已注册 ${WEBMCP_TOOLS.length} 个工具`;
  log(`WebMCP 就绪 — ${WEBMCP_TOOLS.length} 个工具已注册`);
} else {
  $('#tool-count').textContent = 'WebMCP 不可用 · 演示模式';
  $('#demo-bar').style.display = 'flex';
}
window.addEventListener('toolactivated', ({ toolName }) => log(`🤖 Agent 调用："${toolName}"`));

/* ═══════════ 演示 Agent（showcase）═══════════ */
const DEMO_PROMPT = '帮我插一瓶「侘寂」感觉的花：选一个质感朴素的花瓶，背景安静一点，听你的专业建议来。';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function typePrompt(text) {
  const box = $('#demo-prompt'), t = $('#demo-prompt-text');
  box.style.display = 'block'; t.textContent = '';
  for (const ch of text) { t.textContent += ch; await sleep(30); }
  await sleep(700); box.style.display = 'none';
}
async function demoCall(name, input) {
  const tool = WEBMCP_TOOLS.find(t => t.name === name);
  log(`🤖 Agent 调用："${name}"`); await sleep(650);
  const out = tool.execute(input); await sleep(850);
  return out;
}
async function runDemo() {
  const btn = $('#demo-btn'); if (btn.disabled) return;
  btn.disabled = true; btn.textContent = '演示中…';
  await typePrompt(DEMO_PROMPT);
  await demoCall('get_scene_state', {});
  await demoCall('select_background', { id: 'bg_rice' });
  await demoCall('select_vase', { key: 'vase_gourd:pottery' });
  await demoCall('suggest_flowers', { mood: '侘寂' });
  await demoCall('place_flower', { flower: 'pampas', palette: 'wheat', depth: 1 });
  await demoCall('place_flower', { flower: 'plum', palette: 'white', depth: 2 });
  await demoCall('place_flower', { flower: 'cotton', palette: 'white', depth: 3 });
  await demoCall('set_prop', { id: 'prop_stones', present: true });
  await demoCall('critique_arrangement', {});
  log('✅ 演示完成 — 背景、选瓶、选花、构图、点评，全程工具驱动');
  btn.textContent = '↻ 再看一遍'; btn.disabled = false;
}
$('#demo-btn').onclick = runDemo;

/* ═══════════ 启动 ═══════════ */
(async () => {
  await loadCatalog();
  if (!CATALOG) { $('#agent-log').textContent = 'catalog.json 加载失败'; return; }
  buildPanels(); relayout();
})();
