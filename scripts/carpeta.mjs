// Carpeta del tema: guiones/<slug>/ o, si el proyecto les antepone la fecha, guiones/aaaammdd-<slug>/.
import fs from "fs";
import path from "path";

export function carpetaGuion(slug) {
  const directa = path.resolve("guiones", slug);
  if (fs.existsSync(directa)) return directa;
  const fechada = fs.existsSync("guiones") && fs.readdirSync("guiones").find((d) => d.replace(/^\d{8}-/, "") === slug);
  return fechada ? path.resolve("guiones", fechada) : directa;
}
