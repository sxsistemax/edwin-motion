# Realce de la cama en las pausas de la voz: agrega un nodo gain "pausa" al final de la cadena de
# id="musica" y un lane fx.pausa.gain que sube +DB en cada hueco sin voz (palabras de words.json)
# de >= MIN s. Sube a 1 los tramos de la curva de volumen manual que estaban entre 0,5 y 1.
# Uso (después del carve): python -I <skill>/scripts/pausas.py <proyecto>/index.html [--db 4] [--min 0.5]
# El carve suelta despacio: en pausas cortas (0,8 s entre escenas) la cama no alcanza a subir sola.
import html, json, re, sys, os
p = sys.argv[1]; args = sys.argv[2:]
DB = float(args[args.index("--db") + 1]) if "--db" in args else 4.0
MIN = float(args[args.index("--min") + 1]) if "--min" in args else 0.5
RAMPA = 0.2
base = os.path.dirname(os.path.abspath(p))
t = open(p, encoding="utf-8").read()
tag = re.search(r'<audio id="musica"[^>]*>', t).group(0)
m0 = float(re.search(r'data-start="([0-9.]+)"', tag).group(1)); mdur = float(re.search(r'data-duration="([0-9.]+)"', tag).group(1))

# intervalos con voz (composición), palabra por palabra
voz = []
for v in re.finditer(r'<audio id="voz-[^"]*" src="([^"]+)"[^>]*data-start="([0-9.]+)"[^>]*data-duration="([0-9.]+)"', t):
    src, s, d = v.group(1), float(v.group(2)), float(v.group(3))
    wj = os.path.join(base, src[:-4] + ".words.json")
    w = json.load(open(wj, encoding="utf-8")); w = w.get("words", w) if isinstance(w, dict) else w
    for x in w:
        if x["start"] < d: voz.append((s + x["start"], s + min(x["end"], d)))
voz.sort()
huecos, fin = [], m0
for a, b in voz:
    if a - fin >= MIN: huecos.append((fin, a))
    fin = max(fin, b)
if m0 + mdur - fin >= MIN: huecos.append((fin, m0 + mdur))

pts = [{"t": 0, "v": 0}]
for a, b in huecos:
    a, b = a - m0, b - m0
    sube = min(RAMPA, (b - a) / 3)
    pts += [{"t": round(a, 3), "v": 0}, {"t": round(a + sube, 3), "v": DB}, {"t": round(b - sube, 3), "v": DB}, {"t": round(b, 3), "v": 0}]
pts = pts[:512]

def attr(nombre):
    r = re.search(nombre + r'="([^"]*)"', tag)
    return json.loads(html.unescape(r.group(1))) if r else None
cadena = attr("data-fx-chain"); auto = attr("data-automation") or {"version": 1, "lanes": []}
cadena["nodes"] = [n for n in cadena["nodes"] if n["id"] != "pausa"] + [{"type": "gain", "id": "pausa", "params": {"gain": 0}}]
auto["lanes"] = [l for l in auto["lanes"] if l["target"] != "fx.pausa.gain"] + [{"target": "fx.pausa.gain", "points": pts}]
for l in auto["lanes"]:
    if l["target"] == "volume":
        for q in l["points"]:
            if 0.5 <= q["v"] < 1: q["v"] = 1

nuevo = tag
for nombre, val in (("data-fx-chain", cadena), ("data-automation", auto)):
    s = html.escape(json.dumps(val, separators=(",", ":")), quote=True)
    nuevo = re.sub(nombre + r'="[^"]*"', f'{nombre}="{s}"', nuevo) if nombre + "=" in nuevo else nuevo[:-1] + f' {nombre}="{s}">'
open(p, "w", encoding="utf-8", newline="").write(t.replace(tag, nuevo))
print(f"{p}: {len(huecos)} pausas >= {MIN}s, +{DB} dB, {sum(b - a for a, b in huecos):.1f} s en total")
