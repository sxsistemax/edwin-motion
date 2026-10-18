# Presentador en halftone (puntos) con borde de sticker: el personaje del canal
# (personaje/0N Sin fondo.png) recortado en busto, puntos negros sobre blanco y
# las gafas pintadas con el color de acento del video.
#
# Uso (desde la raíz del repo; requiere `pip install pillow`, gratis):
#   python .claude/skills/edwin-motion/scripts/halftone.py <carpeta_salida> [--acento 38bdf8] [--celda 9]
# Genera pj-brazos, pj-senala, pj-abre, pj-celebra y pj-apunta (.png) en la carpeta, y para cada
# pose su versión con la boca abierta (pj-<pose>-boca.png, mismo tamaño) para mover la boca con
# la voz (receta 15 de references/recetas.md). Revisar pj-*-boca.png: la boca se detecta sola.
import argparse, os
from PIL import Image, ImageDraw, ImageFilter

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
# (archivo, nombre, corte del busto, rango x donde buscar la boca)
POSES = [("01", "pj-brazos", .52, (.3, .7)), ("02", "pj-senala", .58, (.3, .7)), ("03", "pj-abre", .58, (.3, .7)),
         ("04", "pj-celebra", .52, (.36, .64)), ("05", "pj-apunta", .62, None)]  # de perfil: sin boca animada (-boca = misma imagen)

def boca(im, rx):
    # Debajo de las gafas (filas con muchos píxeles muy oscuros) busca los dientes (muy claros).
    w, h = im.size
    g, a = im.convert("L").load(), im.getchannel("A").load()
    filas = [y for y in range(int(h * .2), int(h * .7), 2)
             if sum(1 for x in range(int(w * .25), int(w * .75), 4) if a[x, y] > 200 and g[x, y] < 45) > w * .5 / 4 * .45]
    gb = max(filas)
    pts = [(x, y) for y in range(gb + 10, gb + int(h * .16), 2) for x in range(int(w * rx[0]), int(w * rx[1]), 2) if a[x, y] > 200 and g[x, y] > 205]
    xs, ys, k = sorted(p[0] for p in pts), sorted(p[1] for p in pts), len(pts) // 25
    return gb, (xs[k], ys[k], xs[-k - 1], ys[-k - 1])

def abrir_boca(im, caja):
    # Boca abierta: hueco oscuro con lengua debajo de la fila de dientes de arriba.
    x0, y0, x1, y1 = caja
    bw, bh = x1 - x0, y1 - y0
    d = ImageDraw.Draw(im)
    top = y0 + bh * .45
    d.ellipse([x0 + bw * .06, top, x1 - bw * .06, top + max(bh * 1.6, bw * .38)], fill=(38, 12, 12, 255))
    d.ellipse([x0 + bw * .25, top + max(bh * 1.6, bw * .38) * .5, x1 - bw * .25, top + max(bh * 1.6, bw * .38) * .95], fill=(150, 60, 60, 255))
    d.rectangle([x0 + bw * .1, y0, x1 - bw * .1, top + bh * .15], fill=(250, 250, 250, 255))
    return im

def halftone(src, salida, corte, celda, acento, rx):
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    im = im.crop((0, 0, w, int(h * corte))).resize((w * 2, int(h * corte) * 2), Image.LANCZOS)
    if rx is None:
        puntear(im, salida, celda, acento, im.size[1])
        puntear(im, salida.replace(".png", "-boca.png"), celda, acento, im.size[1])
        return
    caja = boca(im, rx)[1]
    gb = caja[1] - celda  # las gafas (color de acento) solo por encima de la boca
    puntear(im, salida, celda, acento, gb)
    puntear(abrir_boca(im.copy(), caja), salida.replace(".png", "-boca.png"), celda, acento, gb)

def puntear(im, salida, celda, acento, gb):
    w, h = im.size
    alfa = im.getchannel("A")
    gris = im.convert("L")
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(out)
    out.paste(Image.new("RGBA", (w, h), (245, 245, 240, 255)), (0, 0), alfa.point(lambda a: 255 if a > 128 else 0))
    px, pa = gris.load(), alfa.load()
    borroso = gris.filter(ImageFilter.GaussianBlur(14)).load()
    for y in range(0, h, celda):
        for x in range(0, w, celda):
            cx, cy = min(x + celda // 2, w - 1), min(y + celda // 2, h - 1)
            if pa[cx, cy] < 128: continue
            lum = px[cx, cy] / 255
            # gafas: zona grande y oscura (lentes) en la franja de los ojos
            if lum < 0.3 and borroso[cx, cy] < 70 and 0.30 * h < cy < min(0.56 * h, gb):
                d.rectangle([x, y, x + celda, y + celda], fill=acento)
                continue
            rad = (1 - lum) ** 0.8 * celda * 0.72
            if rad > 0.6:
                d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(12, 12, 14, 255))
    borde = alfa.point(lambda a: 255 if a > 128 else 0).filter(ImageFilter.MaxFilter(17))
    sticker = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sticker.paste(Image.new("RGBA", (w, h), (255, 255, 255, 255)), (0, 0), borde)
    sticker.alpha_composite(out)
    sticker.save(salida)
    print("ok", salida, sticker.size)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("salida")
    ap.add_argument("--acento", default="38bdf8", help="color hex de las gafas (sin #)")
    ap.add_argument("--celda", type=int, default=9, help="px por punto")
    a = ap.parse_args()
    os.makedirs(a.salida, exist_ok=True)
    rgb = tuple(int(a.acento[i:i + 2], 16) for i in (0, 2, 4)) + (255,)
    for n, nombre, corte, rx in POSES:
        halftone(os.path.join(RAIZ, "personaje", f"{n} Sin fondo.png"), os.path.join(a.salida, f"{nombre}.png"), corte, a.celda, rgb, rx)
