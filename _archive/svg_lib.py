# 生成 12 花型骨架 + 6 器型 + 4 造景 的 SVG 片段（写入 assets/svg_lib.js）
import json

def cup(p, p2, core):
    # 玫瑰：层叠杯状
    return f'''<g>
      <path d="M0,-26 C-20,-26 -26,-8 -20,4 C-14,14 -6,18 0,18 C6,18 14,14 20,4 C26,-8 20,-26 0,-26 Z" fill="{p2}"/>
      <path d="M0,-22 C-15,-22 -20,-8 -15,2 C-10,10 -4,13 0,13 C4,13 10,10 15,2 C20,-8 15,-22 0,-22 Z" fill="{p}"/>
      <path d="M0,-14 C-8,-14 -11,-6 -8,0 C-5,5 -2,7 0,7 C2,7 5,5 8,0 C11,-6 8,-14 0,-14 Z" fill="{p2}"/>
      <circle cx="0" cy="-2" r="4.5" fill="{core}"/>
    </g>'''

def radial(p, core):
    # 雏菊：放射花瓣
    petals = ''.join(f'<ellipse cx="0" cy="-16" rx="4.6" ry="13" fill="{p}" transform="rotate({a})"/>' for a in range(0, 360, 30))
    return f'<g>{petals}<circle cx="0" cy="0" r="7" fill="{core}"/></g>'

def leafline(p, core):
    # 尤加利：茎上一串圆叶
    import math
    leaves = []
    for i in range(7):
        y = -58 + i * 9
        x = (1 if i % 2 == 0 else -1) * 7
        r = 6.5 - i * 0.35
        leaves.append(f'<circle cx="{x}" cy="{y}" r="{r:.1f}" fill="{p}"/>')
    return f'<g><path d="M0,6 L0,-62" stroke="{core}" stroke-width="2" fill="none"/>{"".join(leaves)}</g>'

def cup3(p, p2):
    # 郁金香：三瓣杯
    return f'''<g>
      <path d="M-11,8 C-15,-6 -13,-20 -6,-24 C-4,-16 -2,-12 0,-12 C2,-12 4,-16 6,-24 C13,-20 15,-6 11,8 C7,13 -7,13 -11,8 Z" fill="{p}"/>
      <path d="M-11,8 C-15,-6 -13,-20 -6,-24 C-4,-16 -2,-12 0,-12 L0,12 C-5,12 -9,11 -11,8 Z" fill="{p2}"/>
    </g>'''

def spike(p, core):
    # 薰衣草：穗状
    florets = ''.join(f'<ellipse cx="{(-1)**i * 3}" cy="{-60 + i*7}" rx="4.5" ry="5.5" fill="{p}"/>' for i in range(8))
    return f'<g><path d="M0,6 L0,-64" stroke="{core}" stroke-width="2" fill="none"/>{florets}</g>'

def cluster(p, core):
    # 绣球：团状小花簇
    import math, random
    rnd = random.Random(7)
    dots = []
    for _ in range(16):
        a = rnd.uniform(0, 6.283); r = rnd.uniform(2, 17)
        x, y = r * math.cos(a), r * math.sin(a) - 6
        dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rnd.uniform(4,6.5):.1f}" fill="{p}"/>')
    dots.append(f'<circle cx="0" cy="-6" r="5" fill="{core}"/>')
    return f'<g>{"".join(dots)}</g>'

def spray(p, core):
    # 满天星：散点小花
    import math, random
    rnd = random.Random(11)
    dots = []
    for _ in range(22):
        a = rnd.uniform(-1.2, 1.2); r = rnd.uniform(8, 40)
        x = r * math.sin(a); y = -r * math.cos(a) * 0.8 - 8
        dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rnd.uniform(2,3.4):.1f}" fill="{p}"/>')
    return f'<g><path d="M0,4 L-14,-30 M0,4 L0,-40 M0,4 L14,-30" stroke="{core}" stroke-width="1.2" fill="none"/>{"".join(dots)}</g>'

def sun(p, core):
    # 向日葵
    petals = ''.join(f'<ellipse cx="0" cy="-18" rx="5.5" ry="14" fill="{p}" transform="rotate({a})"/>' for a in range(0, 360, 24))
    return f'<g>{petals}<circle cx="0" cy="0" r="10" fill="{core}"/><circle cx="-3" cy="-3" r="1.4" fill="#3d2b18" opacity=".6"/><circle cx="3" cy="2" r="1.4" fill="#3d2b18" opacity=".6"/><circle cx="0" cy="4" r="1.4" fill="#3d2b18" opacity=".6"/></g>'

def star6(p, core):
    # 百合：六瓣星形 + 花蕊
    petals = ''.join(f'<path d="M0,0 C-5,-8 -4,-18 0,-24 C4,-18 5,-8 0,0 Z" fill="{p}" transform="rotate({a})"/>' for a in range(0, 360, 60))
    stamens = ''.join(f'<line x1="0" y1="0" x2="{6*__import__("math").cos(__import__("math").radians(a-90)):.1f}" y2="{6*__import__("math").sin(__import__("math").radians(a-90))-10:.1f}" stroke="{core}" stroke-width="1.3"/>' for a in (30, 90, 150))
    return f'<g>{petals}{stamens}</g>'

def plume(p, core):
    # 蒲苇：羽状
    import random
    rnd = random.Random(5)
    strands = []
    for i in range(14):
        x0 = rnd.uniform(-3, 3); y0 = -rnd.uniform(20, 60)
        x1 = x0 + rnd.uniform(-8, 8); y1 = y0 - rnd.uniform(6, 14)
        strands.append(f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="{p}" stroke-width="2.2" stroke-linecap="round"/>')
    return f'<g><path d="M0,6 L0,-58" stroke="{core}" stroke-width="2" fill="none"/>{"".join(strands)}</g>'

def puff(p, core):
    # 棉花：三团绒球 + 壳
    return f'''<g>
      <path d="M0,4 L0,-14 M0,-6 L-14,-20 M0,-6 L14,-20" stroke="{core}" stroke-width="2" fill="none"/>
      <g transform="translate(0,-18)"><circle cx="-4" cy="0" r="6" fill="{p}"/><circle cx="4" cy="0" r="6" fill="{p}"/><circle cx="0" cy="-5" r="6" fill="{p}"/></g>
      <g transform="translate(-15,-24) scale(.8)"><circle cx="-4" cy="0" r="6" fill="{p}"/><circle cx="4" cy="0" r="6" fill="{p}"/><circle cx="0" cy="-5" r="6" fill="{p}"/></g>
      <g transform="translate(15,-24) scale(.8)"><circle cx="-4" cy="0" r="6" fill="{p}"/><circle cx="4" cy="0" r="6" fill="{p}"/><circle cx="0" cy="-5" r="6" fill="{p}"/></g>
    </g>'''

def branchbloom(p, core):
    # 梅枝：曲折枝干 + 五瓣小花
    import random
    rnd = random.Random(3)
    def blossom(x, y, s=1.0):
        petals = ''.join(f'<circle cx="{5*__import__("math").cos(__import__("math").radians(a)):.1f}" cy="{5*__import__("math").sin(__import__("math").radians(a)):.1f}" r="3.2" fill="{p}"/>' for a in range(0, 360, 72))
        return f'<g transform="translate({x},{y}) scale({s})">{petals}<circle r="2" fill="{core}"/></g>'
    blooms = blossom(-8, -34, .9) + blossom(10, -46, 1.0) + blossom(-4, -58, .8) + blossom(14, -24, .75)
    return f'<g><path d="M0,6 C-4,-10 -10,-20 -8,-34 C-6,-46 4,-50 10,-60 M-8,-34 C-14,-38 -16,-44 -14,-50 M-2,-18 C6,-22 10,-26 12,-32" stroke="#5b4636" stroke-width="2.5" fill="none"/>{blooms}</g>'

SKELETONS = {
    "cup": lambda pl: cup(pl["petal"], pl["petal2"], pl["core"]),
    "radial": lambda pl: radial(pl["petal"], pl["core"]),
    "leafline": lambda pl: leafline(pl["petal"], pl["core"]),
    "cup3": lambda pl: cup3(pl["petal"], pl["petal2"]),
    "spike": lambda pl: spike(pl["petal"], pl["core"]),
    "cluster": lambda pl: cluster(pl["petal"], pl["core"]),
    "spray": lambda pl: spray(pl["petal"], pl["core"]),
    "sun": lambda pl: sun(pl["petal"], pl["core"]),
    "star6": lambda pl: star6(pl["petal"], pl["core"]),
    "plume": lambda pl: plume(pl["petal"], pl["core"]),
    "puff": lambda pl: puff(pl["petal"], pl["core"]),
    "branchbloom": lambda pl: branchbloom(pl["petal"], pl["core"]),
}

MATERIALS = {
    "porcelain":   {"body": "#f2efe9", "shade": "#d9d4c9", "hi": "#ffffff", "stroke": "#c9c3b6"},
    "pottery":     {"body": "#b98d6b", "shade": "#9a7355", "hi": "#d4ad8d", "stroke": "#8a6a50"},
    "glass":       {"body": "#cfe3e4", "shade": "#aacbcc", "hi": "#eefafa", "stroke": "#9dbfc0", "opacity": ".55"},
    "matte_black": {"body": "#3d3d3f", "shade": "#2c2c2e", "hi": "#555557", "stroke": "#232324"},
}

def vase_svg(shape, m):
    op = f' opacity="{m["opacity"]}"' if "opacity" in m else ""
    st = m["stroke"]
    shapes = {
        "neck":   f'<path d="M186,150 L186,196 C186,214 168,224 162,246 C154,274 166,296 200,296 C234,296 246,274 238,246 C232,224 214,214 214,196 L214,150 Z" fill="{m["body"]}" stroke="{st}" stroke-width="2"{op}/><path d="M186,150 L214,150 L214,158 L186,158 Z" fill="{m["shade"]}" stroke="{st}" stroke-width="2"{op}/>',
        "round":  f'<path d="M188,158 C188,178 156,192 152,230 C148,272 168,296 200,296 C232,296 252,272 248,230 C244,192 212,178 212,158 Z" fill="{m["body"]}" stroke="{st}" stroke-width="2"{op}/><path d="M188,150 L212,150 L212,160 L188,160 Z" fill="{m["shade"]}" stroke="{st}" stroke-width="2"{op}/>',
        "tube":   f'<path d="M172,150 L172,288 C172,293 176,296 182,296 L218,296 C224,296 228,293 228,288 L228,150 Z" fill="{m["body"]}" stroke="{st}" stroke-width="2"{op}/><ellipse cx="200" cy="150" rx="28" ry="6" fill="{m["shade"]}" stroke="{st}" stroke-width="2"{op}/>',
        "bowl":   f'<path d="M140,260 C140,290 166,300 200,300 C234,300 260,290 260,260 Z" fill="{m["body"]}" stroke="{st}" stroke-width="2"{op}/><ellipse cx="200" cy="260" rx="60" ry="9" fill="{m["shade"]}" stroke="{st}" stroke-width="2"{op}/>',
        "gourd":  f'<path d="M192,150 L192,178 C192,190 176,196 172,214 C166,240 170,258 182,270 C190,278 210,278 218,270 C230,258 234,240 228,214 C224,196 208,190 208,178 L208,150 Z" fill="{m["body"]}" stroke="{st}" stroke-width="2"{op}/><path d="M192,150 L208,150 L208,157 L192,157 Z" fill="{m["shade"]}" stroke="{st}" stroke-width="2"{op}/>',
        "trumpet":f'<path d="M164,150 C164,164 180,172 188,182 L188,220 C176,232 172,250 178,268 C184,288 216,288 222,268 C228,250 224,232 212,220 L212,182 C220,172 236,164 236,150 Z" fill="{m["body"]}" stroke="{st}" stroke-width="2"{op}/><ellipse cx="200" cy="150" rx="36" ry="7" fill="{m["shade"]}" stroke="{st}" stroke-width="2"{op}/>',
    }
    hi = f'<path d="M184,170 C180,196 178,236 182,264" stroke="{m["hi"]}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>'
    return f'<g>{shapes[shape]}{hi}</g>'

PROPS = {
    "prop_stones": '<g><ellipse cx="140" cy="292" rx="16" ry="9" fill="#b9b4aa"/><ellipse cx="164" cy="296" rx="11" ry="7" fill="#cfc9bd"/><ellipse cx="126" cy="297" rx="8" ry="5" fill="#a5a096"/></g>',
    "prop_branch": '<g><path d="M120,296 C160,280 210,288 260,262 C268,258 276,250 282,242 M212,282 C222,274 226,266 226,258" stroke="#6e5a48" stroke-width="4" fill="none" stroke-linecap="round"/></g>',
    "prop_moss":   '<g><circle cx="150" cy="288" r="10" fill="#7a9464"/><circle cx="162" cy="292" r="8" fill="#8aa374"/><circle cx="140" cy="293" r="7" fill="#6c8858"/><circle cx="155" cy="284" r="6" fill="#94b07e"/></g>',
    "prop_fan":    '<g transform="translate(268,196) rotate(24)"><path d="M0,0 A64,64 0 0 1 90,-18 L0,26 Z" fill="#efe9dc" stroke="#d8cfbc" stroke-width="2"/><path d="M0,26 L84,-14 M0,26 L64,-4 M0,26 L44,4 M0,26 L24,12" stroke="#d8cfbc" stroke-width="1.4"/></g>',
}

catalog = json.load(open("catalog.json"))
flowers_js = {}
for f in catalog["flowers"]:
    for pl in f["palettes"]:
        key = f'{f["id"]}:{pl["key"]}'
        inner = SKELETONS[f["skeleton"]](pl)
        stem = f'<path d="M0,60 L0,18" stroke="{f["stem"]}" stroke-width="3" fill="none"/>'
        flowers_js[key] = f'<g>{stem}<g transform="translate(0,14)">{inner}</g></g>'

vases_js = {}
for v in catalog["vases"]:
    for mat in v["materials"]:
        vases_js[f'{v["id"]}:{mat}'] = vase_svg(v["shape"], MATERIALS[mat])

out = "// 自动生成：SVG 素材库（骨架 × 配色 / 器型 × 质感）\n"
out += "const SVG_LIB = {\n  flowers: " + json.dumps(flowers_js, ensure_ascii=False, indent=2) + ",\n  vases: " + json.dumps(vases_js, ensure_ascii=False, indent=2) + ",\n  props: " + json.dumps(PROPS, ensure_ascii=False, indent=2) + "\n};\n"
open("assets/svg_lib.js", "w", encoding="utf-8").write(out)
print("flowers variants:", len(flowers_js), "| vases variants:", len(vases_js), "| props:", len(PROPS), "| bytes:", len(out))
