# 四套节日花束 · 独立接入包

本包新增四套可逐枝编辑的花束，不替换任何已有预设，不修改渲染器。全部引用当前 catalog 中的素材，无需下载新图片。元旦方案为公历新年，区别于春节；圣诞方案与 christmas-hearth / christmas-carol 并存。

## 接入（推荐 ES module）

1. 把 `festival-presets.js` 复制到工程根目录，与 studio.js 同级。
2. studio.js 顶部加入：

```js
import { createFestivalDesigns, festivalTitles } from './festival-presets.js';
```

3. `const designs = {` 内第一行加入：

```js
...createFestivalDesigns(item),
```

`item` 必须已经初始化；保留现有对象工厂，确保生成唯一 ID。不要直接把 JSON 中的 objects 数组当作 designs 的 objects 函数。

4. `const TITLES = {` 内加入：

```js
...festivalTitles,
```

5. index.html 的 `.variants` 节日按钮区追加：

```html
<button data-preset="halloween-twilight" data-i18n="presetHalloweenTwilight">万圣节 · 暮色南瓜</button>
<button data-preset="mother-softlight" data-i18n="presetMotherSoftlight">母亲节 · 温柔有枝</button>
<button data-preset="january-dawn" data-i18n="presetJanuaryDawn">元旦 · 第一束晨光</button>
<button data-preset="christmas-snowfall" data-i18n="presetChristmasSnowfall">圣诞 · 雪夜松语</button>
```

6. i18n.js 字典加入（字幕可复用这些 key）：

```js
presetHalloweenTwilight:{zh:'万圣节 · 暮色南瓜',en:'Halloween · Pumpkin Twilight'},
presetMotherSoftlight:{zh:'母亲节 · 温柔有枝',en:'Mother’s Day · Gentle Light'},
presetJanuaryDawn:{zh:'元旦 · 第一束晨光',en:'New Year’s Day · First Light'},
presetChristmasSnowfall:{zh:'圣诞 · 雪夜松语',en:'Christmas · Snowfall Letters'},
```

render() 中 subtitle 映射加入：

```js
'halloween-twilight':'presetHalloweenTwilight',
'mother-softlight':'presetMotherSoftlight',
'january-dawn':'presetJanuaryDawn',
'christmas-snowfall':'presetChristmasSnowfall',
```

7. build.mjs 的语法检查列表、复制列表加入 `festival-presets.js`。新模块也纳入项目的缓存戳机制：studio.js 的 import 引用与构建正则一起更新；不要只复制到源目录而漏掉 dist。或将模块内容直接并入 studio.js，即无需新增静态文件。

## 数据约定与接入检查

- 每套 15–16 个元素；花头聚拢于包装口上方，茎末端位于包装内，单枝曲线控制点可编辑。
- `tie` 统一为 (505,890)，与现有 choosePreset 的位移基准兼容，避免整束被额外平移。
- `card` / `cardEn` 含完整中英文文案；所用模板为 mono-statement、letter-style、watercolor-space、vintage-stamp。接入后核对模板没有截字、贺卡读回文字与画面一致。
- 万圣节使用橙/紫/酒红配色，没有虚构南瓜、幽灵素材；圣诞使用现有蕨叶与松果，没有虚构松枝。
- 提供 JSON 便于数据工具消费，但不是整个作品的备份文件，不能直接通过“作品导入”恢复。

## 验收状态

已核对实际 catalog ID、模板 ID、元素坐标、旋转后素材格子的画布边界和工厂生成 ID 唯一性。尚未在当前渲染器上完成四束的视觉验收，不把生成海报作为实际效果。部署前需点击四个新按钮检查花头遮挡、包装口衔接和贺卡全文，再测试切换中英文、拖动、撤销和导出。
