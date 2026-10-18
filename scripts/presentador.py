# Presentador del canal con el arte ORIGINAL a color (personaje/0N Sin fondo.png), recortado en
# busto, más una versión con la boca abierta por pose para moverla con la voz (receta 15).
# La boca abierta se pinta DENTRO de los dientes reales: la parte de abajo de los dientes pasa a
# ser interior oscuro con lengua (en la pose 04, que ya ríe con la boca abierta, al revés: el
# interior de abajo pasa a dientes y la boca "se cierra").
#
# Uso (desde la raíz del repo; requiere `pip install pillow`, gratis):
#   python .claude/skills/edwin-motion/scripts/presentador.py <carpeta_salida>
# Genera pj-brazos, pj-senala, pj-abre, pj-celebra, pj-apunta y pj-apunta-espejo (.png), cada uno
# con su pj-<pose>-boca.png del mismo tamaño. Revisar las -boca.png si cambia el arte.
import argparse, os
from PIL import Image, ImageDraw, ImageOps

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
# (archivo, nombre, corte del busto, caja de la boca en px del original 704×1472, ¿ya abierta?)
POSES = [("01", "pj-brazos", .52, (262, 462, 422, 528), False),
         ("02", "pj-senala", .58, (236, 484, 418, 548), False),
         ("03", "pj-abre", .58, (258, 504, 442, 564), False),
         ("04", "pj-celebra", .52, (292, 402, 410, 468), True),
         ("05", "pj-apunta", .62, (198, 474, 324, 540), False)]

INTERIOR, LENGUA, DIENTE = (62, 18, 16, 255), (214, 96, 100, 255), (250, 250, 248, 255)

def boca(im, caja, abierta):
    im = im.copy()
    px = im.load()
    x0, y0, x1, y1 = caja
    def es_diente(p): return p[3] > 200 and min(p[:3]) > 185 and max(p[:3]) - min(p[:3]) < 40
    def es_hueco(p): return p[3] > 200 and (sum(p[:3]) < 330 or (p[0] > 150 and p[1] < 120))
    sel = es_hueco if abierta else es_diente
    pts = [(x, y) for y in range(y0, y1) for x in range(x0, x1) if sel(px[x, y])]
    if not pts: raise SystemExit(f"sin boca en {caja}")
    ys = [y for _, y in pts]
    ty0, ty1 = min(ys), max(ys)
    corte = ty0 + (ty1 - ty0) * (.5 if abierta else .42)
    xs = [x for x, _ in pts]
    cx, rx = (min(xs) + max(xs)) / 2, (max(xs) - min(xs)) * .3
    if abierta:
        # boca casi cerrada: los dientes de arriba, invertidos, tapan el hueco (con su contorno y sombra)
        orig = im.copy().load()
        dientes = [(x, y) for y in range(y0, y1) for x in range(x0, x1) if es_diente(orig[x, y])]
        base = max(y for _, y in dientes)         # borde inferior de los dientes de arriba
        alto = base - min(y for _, y in dientes)
        dx0, dx1 = min(x for x, _ in dientes), max(x for x, _ in dientes)
        for x, y in pts:
            if y <= base or not dx0 <= x <= dx1: continue   # solo el hueco bajo los dientes (no el bigote)
            ys_ = 2 * base - y                    # espejo respecto al borde de los dientes
            if y - base <= alto and orig[x, ys_][3] > 200: px[x, y] = orig[x, ys_]
        return im
    for x, y in pts:
        if y < corte: continue
        if abierta: px[x, y] = DIENTE
        else:
            dentro_lengua = ((x - cx) / rx) ** 2 + ((y - ty1) / ((ty1 - corte) * .7 + 1)) ** 2 < 1
            px[x, y] = LENGUA if dentro_lengua else INTERIOR
    return im

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("salida")
    a = ap.parse_args()
    os.makedirs(a.salida, exist_ok=True)
    for n, nombre, corte, caja, abierta in POSES:
        im = Image.open(os.path.join(RAIZ, "personaje", f"{n} Sin fondo.png")).convert("RGBA")
        b = boca(im, caja, abierta)
        im, b = (x.crop((0, 0, x.width, int(x.height * corte))) for x in (im, b))
        salidas = [(nombre, im, b)]
        if nombre == "pj-apunta":   # espejo: señala hacia la derecha
            salidas.append(("pj-apunta-espejo", ImageOps.mirror(im), ImageOps.mirror(b)))
        for nom, base, conboca in salidas:
            base.save(os.path.join(a.salida, f"{nom}.png"))
            conboca.save(os.path.join(a.salida, f"{nom}-boca.png"))
            print("ok", nom, base.size)
