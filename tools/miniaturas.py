#!/usr/bin/env python3
"""Genera las miniaturas de la galería y js/thumbs.js.

Para cada foto de images/web y images/mockups crea dos versiones:
  images/thumbs/sm/...  700 px lado mayor  (celulares, filas chicas)
  images/thumbs/md/... 1400 px lado mayor  (desktop / pantallas retina)
El original de 2000 px se sigue usando en el visor y el hero.

js/thumbs.js guarda el ancho y alto de cada original, así la galería arma las
filas justificadas sin esperar a que carguen las fotos (necesario con lazy loading).

Solo procesa lo nuevo o modificado, y borra miniaturas de fotos que ya no existen.
Uso:  python3 tools/miniaturas.py
"""
import json
from pathlib import Path

from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
CARPETAS = ["images/web", "images/mockups"]
TAMANOS = {"sm": 700, "md": 1400}
EXTS = {".jpg", ".jpeg", ".png"}


def main():
    dims = {}
    esperadas = set()
    nuevas = 0

    for carpeta in CARPETAS:
        for orig in sorted((RAIZ / carpeta).iterdir()):
            if orig.suffix.lower() not in EXTS:
                continue
            rel = orig.relative_to(RAIZ).as_posix()  # images/web/AER-001.jpg
            img = None
            for nombre, lado in TAMANOS.items():
                destino = RAIZ / "images/thumbs" / nombre / orig.relative_to(RAIZ / "images")
                esperadas.add(destino)
                if destino.exists() and destino.stat().st_mtime >= orig.stat().st_mtime:
                    continue
                if img is None:
                    img = ImageOps.exif_transpose(Image.open(orig))
                    if img.mode not in ("RGB", "L"):
                        img = img.convert("RGB")
                chica = img.copy()
                chica.thumbnail((lado, lado), Image.LANCZOS)
                destino.parent.mkdir(parents=True, exist_ok=True)
                if destino.suffix.lower() == ".png":
                    chica.save(destino, optimize=True)
                else:
                    chica.save(destino, quality=80, optimize=True, progressive=True)
                nuevas += 1

            if img is None:
                with Image.open(orig) as im:
                    img = ImageOps.exif_transpose(im)
            dims[rel] = list(img.size)

    borradas = 0
    for f in (RAIZ / "images/thumbs").rglob("*"):
        if f.is_file() and f not in esperadas:
            f.unlink()
            borradas += 1

    js = "// Generado por tools/miniaturas.py — no editar a mano.\n"
    js += "// Ancho y alto de cada foto original, para armar la galería antes de que carguen.\n"
    lineas = ",\n".join(f"  {json.dumps(k, ensure_ascii=False)}: [{w}, {h}]" for k, (w, h) in dims.items())
    js += "var IMG_DIMS = {\n" + lineas + "\n};\n"
    (RAIZ / "js/thumbs.js").write_text(js, encoding="utf-8")

    print(f"Miniaturas: {nuevas} generadas, {borradas} borradas, {len(dims)} fotos en js/thumbs.js")


if __name__ == "__main__":
    main()
