#!/usr/bin/env python3
"""Prepara para la web los videos y escenas elegidos de "Videos Mockups".

La tabla ESCENAS es la selección de German (revisada en Videos Mockups/revisar/revisar.html),
en el orden en que aparecen en la web. Cada escena dice qué fotos de la tienda muestra,
cómo se llama el lugar y de dónde sale cada formato (patrón dentro de "Videos Mockups"):

  video  → videos/NN-CODIGO.mp4   (1080×1920, H.264, sin audio, ~4 MB)
           videos/NN-CODIGO.jpg   (primer cuadro, portada del video)
  4x5    → images/ambientes/NN-CODIGO-4x5.jpg     (visor, 1280×1600)
           images/ambientes/NN-CODIGO-4x5-sm.jpg  (tarjeta, 720×900)
  16x9   → images/ambientes/NN-CODIGO-16x9.jpg    (visor, 1920×1080)
           images/ambientes/NN-CODIGO-16x9-sm.jpg (tarjeta, 1280×720)

En la web: en computador se usa la 16:9 si la hay; en el teléfono, la 4:5 si la hay.
Una escena con varios cuadros aparece en el visor de cada una de sus fotos.
Escribe js/ambientes.js. Solo procesa lo nuevo o modificado y borra lo que ya no está.
Uso:  python3 tools/ambientes.py      (necesita ffmpeg)
"""
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ.parent / "Videos Mockups"
DIR_VIDEOS = RAIZ / "videos"
DIR_FOTOS = RAIZ / "images" / "ambientes"

TV = "Todos los videos/"
TC = "tamanos_collage/fotos/"
HZ = "horizontal/fotos/"

# (escena, códigos de las fotos, lugar, {formato: patrón})  — en el orden de la web
ESCENAS = [
    ("S1", ["LND-001"], "Living · Viña del Mar", {"16x9": HZ + "S1_*_16x9.jpg", "4x5": TC + "S1_*_4x5.jpg"}),
    ("05", ["SEA-003"], "Living · Concón", {"video": TV + "05_*.mp4", "4x5": TV + "05_*_foto-4x5.jpg"}),
    ("C2", ["WLD-018", "WLD-019"], "Díptico · Puerto Natales", {"16x9": HZ + "C2_*_16x9.jpg", "4x5": TC + "C2_*_4x5.jpg"}),
    ("07", ["LND-029"], "Dormitorio · Casa en el sur", {"video": TV + "07_*.mp4", "4x5": TV + "07_*_foto-4x5.jpg"}),
    ("13", ["LND-013"], "Escalera · La Dehesa", {"4x5": TV + "13_*_foto-4x5.jpg"}),
    ("C6", ["LND-031", "LND-032", "LND-033", "LND-036"], "Escritorio · Ñuñoa", {"16x9": HZ + "C6_*_16x9.jpg", "4x5": TC + "C6_*_4x5.jpg"}),
    ("08", ["LND-007"], "Cabaña · Pucón", {"video": TV + "08_*.mp4", "4x5": TV + "08_*_foto-4x5.jpg"}),
    ("S2", ["LND-005"], "Hall · Zapallar", {"16x9": HZ + "S2_*_16x9.jpg"}),
    ("09", ["AER-020"], "Escritorio · Vitacura", {"video": TV + "09_*.mp4", "4x5": TV + "09_*_foto-4x5.jpg"}),
    ("14", ["AER-012"], "Cerro Alegre · Valparaíso", {"4x5": TV + "14_*_foto-4x5.jpg"}),
    ("C1", ["WLD-004", "WLD-006"], "Díptico · Concón", {"16x9": HZ + "C1_*_16x9.jpg", "4x5": TC + "C1_*_4x5.jpg"}),
    ("10", ["ARC-013"], "Living · Providencia", {"video": TV + "10_*.mp4", "4x5": TV + "10_*_foto-4x5.jpg"}),
    ("S3", ["LND-021"], "Dormitorio · Providencia", {"4x5": TC + "S3_*_4x5.jpg"}),
    ("C5", ["LND-023", "LND-024", "LND-025"], "Living · Las Condes", {"16x9": HZ + "C5_*_16x9.jpg", "4x5": TC + "C5_*_4x5.jpg"}),
    ("12", ["STR-006"], "Loft · Barrio Lastarria", {"video": TV + "12_*.mp4", "4x5": TV + "12_*_foto-4x5.jpg"}),
    ("15", ["AER-007"], "Dormitorio · Reñaca", {"4x5": TV + "15_*_foto-4x5.jpg"}),
    ("C3", ["SEA-006", "SEA-007", "SEA-008"], "Tríptico · Tunquén", {"16x9": HZ + "C3_*_16x9.jpg"}),
    ("06", ["WLD-004"], "Comedor · Concón", {"video": TV + "06_*.mp4", "4x5": TV + "06_*_foto-4x5.jpg"}),
    ("17", ["AER-017"], "Casa patronal · Valle de Aconcagua", {"4x5": TV + "17_*_foto-4x5.jpg"}),
    ("S4", ["LND-015"], "Rincón de lectura · Frutillar", {"4x5": TC + "S4_*_4x5.jpg"}),
    ("11", ["LND-024"], "Comedor · Puerto Varas", {"video": TV + "11_*.mp4", "4x5": TV + "11_*_foto-4x5.jpg"}),
    ("20", ["SEA-006"], "Casa de playa · Cachagua", {"4x5": TV + "20_*_foto-4x5.jpg"}),
]

# formato → [(sufijo del archivo, caja, clave en ambientes.js)]
FOTOS = {
    "4x5": [("4x5", (1280, 1600), "foto"), ("4x5-sm", (720, 900), "foto_sm")],
    "16x9": [("16x9", (1920, 1080), "horiz"), ("16x9-sm", (1280, 720), "horiz_sm")],
}


def uno(patron):
    hay = sorted(ORIGEN.glob(patron))
    if len(hay) != 1:
        raise SystemExit(f"Esperaba un archivo para {patron!r} y hay {len(hay)}")
    return hay[0]


def al_dia(destino, origen):
    return destino.exists() and destino.stat().st_mtime >= origen.stat().st_mtime


def guardar_jpg(origen, destino, caja):
    img = ImageOps.exif_transpose(Image.open(origen)).convert("RGB")
    img.thumbnail(caja, Image.LANCZOS)
    img.save(destino, quality=84, optimize=True, progressive=True)


def comprimir_video(origen, destino):
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(origen), "-an",
        "-vf", "scale=1080:1920:flags=lanczos",
        "-c:v", "libx264", "-preset", "slow", "-crf", "24",
        "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
        str(destino),
    ], check=True)


def portada(video, destino):
    tmp = destino.with_suffix(".png")
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(video),
        "-vf", "scale=720:1280:flags=lanczos", "-frames:v", "1", str(tmp),
    ], check=True)
    Image.open(tmp).convert("RGB").save(destino, quality=82, optimize=True, progressive=True)
    tmp.unlink()


def main():
    if not ORIGEN.is_dir():
        raise SystemExit(f"No encuentro la carpeta de origen: {ORIGEN}")
    codigos_web = set(re.findall(r"code:'([A-Z]{3}-\d{3})'", (RAIZ / "js/data.js").read_text(encoding="utf-8")))
    DIR_VIDEOS.mkdir(exist_ok=True)
    DIR_FOTOS.mkdir(parents=True, exist_ok=True)

    lista, esperados, nuevos = [], set(), 0
    for num, codigos, lugar, fuentes in ESCENAS:
        faltan = [c for c in codigos if c not in codigos_web]
        if faltan:
            print(f"  ! {num}: {', '.join(faltan)} ya no está en la tienda, se omite la escena")
            continue
        base = f"{num}-{codigos[0]}"
        item = {"n": num, "code": codigos[0]}
        if len(codigos) > 1:
            item["codes"] = codigos
        item["lugar"] = lugar

        if "video" in fuentes:
            mp4 = uno(fuentes["video"])
            dv, dp = DIR_VIDEOS / f"{base}.mp4", DIR_VIDEOS / f"{base}.jpg"
            if not al_dia(dv, mp4):
                print(f"  video {base}…")
                comprimir_video(mp4, dv)
                nuevos += 1
            if not al_dia(dp, dv):
                portada(dv, dp)
            esperados |= {dv, dp}
            item["video"] = dv.relative_to(RAIZ).as_posix()
            item["poster"] = dp.relative_to(RAIZ).as_posix()

        for formato, salidas in FOTOS.items():
            if formato not in fuentes:
                continue
            src = uno(fuentes[formato])
            for sufijo, caja, clave in salidas:
                destino = DIR_FOTOS / f"{base}-{sufijo}.jpg"
                if not al_dia(destino, src):
                    guardar_jpg(src, destino, caja)
                    nuevos += 1
                esperados.add(destino)
                item[clave] = destino.relative_to(RAIZ).as_posix()
        lista.append(item)

    borrados = 0
    for carpeta in (DIR_VIDEOS, DIR_FOTOS):
        for f in carpeta.iterdir():
            if f.is_file() and f not in esperados and f.name != ".DS_Store":
                f.unlink()
                borrados += 1

    js = "// Generado por tools/ambientes.py — no editar a mano.\n"
    js += "// Escenas \"En tu espacio\": video 9:16 con portada, foto 4:5 (foto/foto_sm) y/o 16:9 (horiz/horiz_sm).\n"
    js += "// codes: todas las fotos de la escena (dípticos, trípticos...); code es la principal.\n"
    js += "var AMBIENTES = [\n" + ",\n".join("  " + json.dumps(i, ensure_ascii=False) for i in lista) + "\n];\n"
    (RAIZ / "js/ambientes.js").write_text(js, encoding="utf-8")

    videos = sum(1 for i in lista if "video" in i)
    print(f"Ambientes: {len(lista)} escenas ({videos} videos), {nuevos} archivos nuevos, {borrados} borrados")


if __name__ == "__main__":
    main()
