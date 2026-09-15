#!/usr/bin/env python3
"""Genera sitemap.xml a partir de js/data.js.

Incluye cada foto como <image:image>, para que Google Imágenes las indexe con
su título y lugar. Se corre solo desde el alias `publicar`; a mano:
    python3 tools/sitemap.py
"""
import re
from datetime import date
from pathlib import Path
from urllib.parse import quote
from xml.sax.saxutils import escape

RAIZ = Path(__file__).resolve().parent.parent
SITIO = "https://germanweber.cl/"


def campo(linea, nombre):
    """Lee un campo de una línea de PHOTOS, con comillas simples o dobles."""
    m = re.search(nombre + r""":\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')""", linea)
    if not m:
        return None
    valor = m.group(1) if m.group(1) is not None else m.group(2)
    return re.sub(r"\\(.)", r"\1", valor)


def main():
    data = (RAIZ / "js/data.js").read_text(encoding="utf-8")
    bloque = data.split("var PHOTOS = [", 1)[1].split("];", 1)[0]

    imagenes = []
    for linea in bloque.splitlines():
        src, titulo = campo(linea, "src"), campo(linea, "title")
        if not src or not titulo:
            continue
        lugar = campo(linea, "location") or ""
        imagenes.append(
            "    <image:image>\n"
            f"      <image:loc>{escape(SITIO + quote(src))}</image:loc>\n"
            f"      <image:title>{escape(titulo)}</image:title>\n"
            + (f"      <image:caption>{escape(titulo + ' — ' + lugar + '. Fotografía de German Weber')}</image:caption>\n" if lugar else "")
            + "    </image:image>"
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
        "  <url>\n"
        f"    <loc>{SITIO}</loc>\n"
        f"    <lastmod>{date.today().isoformat()}</lastmod>\n"
        + "\n".join(imagenes) + "\n"
        "  </url>\n"
        "</urlset>\n"
    )
    (RAIZ / "sitemap.xml").write_text(xml, encoding="utf-8")
    print(f"Sitemap: {len(imagenes)} fotos")


if __name__ == "__main__":
    main()
