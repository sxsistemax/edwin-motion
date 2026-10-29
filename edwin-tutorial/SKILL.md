---
name: edwin-tutorial
description: Tutoriales de software en video a partir de una grabación real del navegador — Playwright entra al sitio (login incluido, con cuenta de prueba), recorre el menú o el flujo pedido y graba; el agente escribe la narración mirando las capturas de cada paso; voz local gratis (Kokoro) o la del creador en ElevenLabs; y HyperFrames monta encima portada, ficha de paso, aro y etiqueta en cada clic, zoom a lo importante, tapas de datos privados y cierre, con cada paso congelado hasta que termina su frase. Usar cuando pidan "graba un tutorial de <sitio/app>", "video paso a paso de cómo usar…", "graba el login y la navegación", o un tutorial de una aplicación web propia.
argument-hint: "<url> [slug] — qué recorrer, con qué cuenta de prueba"
---

# edwin-tutorial

Pedido: `$ARGUMENTS`

Hermano de `edwin-motion` (mismo repositorio): toma de ahí las fuentes, los sonidos y, para la voz del
creador, `scripts/voz.ts`. `<skill>` = esta carpeta; `<motion>` = la carpeta de `edwin-motion`
(la de arriba). Los comandos se corren **desde la carpeta del tutorial**.

## Reglas que no se cruzan

- **Credenciales solo de prueba y solo en variables de entorno** (`TUT_USER`, `TUT_PASS`…). En
  `tutorial.json` va el nombre de la variable (`"env"`), nunca el valor; no se escriben en archivos,
  en el guion ni en la respuesta. Solo se entra a sitios de desarrollo o de pruebas que el creador
  nombró en su pedido, con cuentas de prueba que él dio. Producción o cuentas reales → no; que grabe él.
- **La narración dice solo lo que se ve** en las capturas de cada paso (nombres del menú tal cual,
  sin inventar funciones). Tú, frases cortas, una idea por paso, ~12-25 palabras.
- **Privacidad:** antes de renderizar se miran todas las capturas buscando correos, nombres, teléfonos,
  documentos o cifras de clientes reales. Lo que sea real se tapa (`"tapar"`); datos de prueba
  (`@*.test`, empresas ficticias) se pueden dejar, y se avisa en la entrega.
- **Plata = aprobación:** la voz local es gratis; la de ElevenLabs (💲) se cuenta con `--contar`,
  se muestra el costo y se espera el sí.
- No se aceptan banners de cookies ni términos, ni se envían formularios con efectos reales
  (crear, borrar, pagar) salvo que el creador lo pida para ese entorno de pruebas.

## Flujo

0. **Base:** `npm i` en `<skill>` (Playwright; usa el Chrome instalado, `channel: 'chrome'`) y, para
   la voz local, `pip install kokoro-onnx soundfile`. Carpeta del tutorial: la que diga el `CLAUDE.md`
   del proyecto; si no dice, `tutoriales/<slug>/`.
1. **Explorar.** Copiar `<skill>/ejemplo/tutorial.json`, poner `url` y los pasos de login, y correr
   `TUT_USER=… TUT_PASS=… node <skill>/scripts/grabar.mjs --explorar`: no graba; deja
   `pasos/explorar.png` y lista los enlaces y botones visibles (con su `href`) para elegir selectores.
   Repetir agregando pasos hasta tener el recorrido completo.
2. **Escribir los pasos** en `tutorial.json` (formato abajo): un paso = una pantalla o una acción con
   sentido; los grupos del menú se abren en el mismo paso que la página que se visita.
3. **Grabar:** `node <skill>/scripts/grabar.mjs` → `grabacion/*.webm`, `pasos/NN.png` (captura al
   final de cada paso) y `grabacion.json` (inicio de cada paso y cada clic). **Mirar todas las capturas.**
   Si algo no cargó o el clic cayó en otro lado, corregir el paso y volver a grabar.
4. **Narración:** leer cada `pasos/NN.png` y escribir el campo `"voz"` de su paso. Escoger `"foco"`
   (`[x, y, escala]` en píxeles de la grabación, 1,25-1,6) en la zona que la voz nombra.
5. **Voz:** `node <skill>/scripts/voz.mjs --local` (Kokoro, `ef_dora`, gratis; deja `guion.md` y
   `assets/audio/NN.wav`). Con la voz del creador: `npx tsx <motion>/scripts/voz.ts . --contar`,
   aprobación, y sin `--contar` (deja `NN.mp3`, que gana sobre los `.wav`).
6. **Armar:** `node <skill>/scripts/armar.mjs` → `assets/recorrido.mp4` (cada paso cortado y
   congelado en su último cuadro hasta que acaba su frase) + `index.html`. No se edita `index.html`
   a mano: se cambia `tutorial.json` y se vuelve a armar.
7. **Revisar:** `npx hyperframes check`; `npx hyperframes snapshot --at <un segundo por paso> --no-end
   --describe false` y **mirar**: la ficha del paso coincide con la pantalla, las etiquetas caen junto a
   lo que se clicó, el zoom no corta lo que la voz nombra, nada privado a la vista.
8. **Render:** `npx hyperframes render -o render/<slug>.mp4`; medir con `ffmpeg -af ebur128` (voz
   alrededor de −20 LUFS integrados, pico < −1 dBFS) y mirar 4-6 cuadros del mp4 final.
9. **Entrega:** el mp4, duración, qué voz lleva, qué datos de prueba quedaron a la vista y cómo
   regenerarlo (pasos 3, 5, 6, 8).

## `tutorial.json`

```jsonc
{
  "slug": "mi-app-menu",
  "url": "https://dev.mi-app.test",          // base: "ir" acepta rutas relativas
  "titulo": "MI APLICACIÓN",                  // portada (Anton, mayúsculas)
  "subtitulo": "Cómo entrar y moverte por el menú",
  "marca": "MI APLICACIÓN · ENTORNO DE PRUEBAS", // arriba a la derecha
  "cierre": { "titulo": "YA SABES MOVERTE", "subtitulo": "Entrar · Ventas · Ajustes" },
  "colores": { "fondo": "#0d2233", "acento": "#f39200", "texto2": "#8cbf3f", "tapa": "#e6ecf1" }, // los de la marca
  "ancho": 1600, "alto": 900,                 // ventana grabada (por defecto 1600×900: texto legible)
  "pausa": 2500,                              // espera tras cada clic (ms), para que cargue la página
  "pasos": [
    { "titulo": "Entrar", "foco": [800, 470, 1.55], "desde": "inicio",
      "acciones": [{ "ir": "/login" }], "voz": "…" },
    { "titulo": "Correo y contraseña", "foco": [800, 470, 1.55], "desde": "inicio",
      "acciones": [
        { "clic": "input[type=email]", "etiqueta": "Tu correo" }, { "escribir": "input[type=email]", "env": "TUT_USER" },
        { "clic": "input[type=password]", "etiqueta": "Tu contraseña" }, { "escribir": "input[type=password]", "env": "TUT_PASS" }],
      "voz": "…" },
    { "titulo": "Ventas · Pedidos", "foco": [900, 220, 1.35], "tapar": [[300, 400, 260, 40]],
      "acciones": [{ "clic": "nav button:has-text('Ventas')", "etiqueta": "Ventas", "pausa": 900 },
                   { "clic": "a[href='/pedidos']", "etiqueta": "Pedidos" }],
      "voz": "…" }
  ]
}
```

Acciones: `ir` (navegar), `clic` (+ `etiqueta` para el cartel; sin ella solo hay aro), `escribir`
(`env` o `texto`), `desplazar` (píxeles de rueda), `esperarOculto` (texto de "Cargando…" que debe
desaparecer), `esperar` (ms). Todas aceptan `pausa`. `foco` hace zoom 2 s después del último clic
del paso (o desde el inicio con `"desde": "inicio"`); pasos seguidos con el mismo foco quedan en un
solo zoom. `tapar`: rectángulos `[x, y, ancho, alto, color?]` en píxeles de la grabación, durante
todo el paso.

## Qué hace cada capa (lenguaje de `edwin-motion`)

Portada que golpea y sube destapando la grabación → marco con borde del color de acento → ficha
"PASO NN" que entra con rebote en cada corte → en cada clic, aro que se abre + etiqueta que salta,
flota y se va + "tick" suave → zoom con `power3.inOut` → cierre "LISTO". Sin grano ni filtros
sobre la grabación. Los tiempos salen solos de `grabacion.json`: si el sitio cambia, se vuelve a
grabar y a armar sin tocar nada más.

## Límites conocidos

- Playwright graba a 25 cps y comprime: con texto muy pequeño, subir el `foco` o grabar en 1280×720.
- La etiqueta se ubica con la caja del elemento en el momento del clic; si la página se redibuja
  (por ejemplo, el menú vuelve arriba), puede quedar corrida tras el clic. Dura 1,9 s.
- Sitios con detección de bots o doble factor no se automatizan: que el creador grabe ese tramo.
