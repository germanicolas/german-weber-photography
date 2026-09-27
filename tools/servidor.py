#!/usr/bin/env python3
"""Servidor local del sitio con soporte de Range (necesario para videos en Safari).

python -m http.server no responde "Range: bytes=...", y Safari no reproduce
un <video> sin eso. GitHub Pages sí lo soporta; esto es solo para revisar en local.
Uso:  python3 tools/servidor.py [puerto]     (por defecto 8765)
"""
import os
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        rango = self.headers.get("Range")
        ruta = self.translate_path(self.path)
        m = re.match(r"bytes=(\d*)-(\d*)$", rango or "")
        if not m or not os.path.isfile(ruta):
            return super().send_head()
        total = os.path.getsize(ruta)
        ini, fin = m.groups()
        if ini:
            ini, fin = int(ini), int(fin) if fin else total - 1
        else:  # "bytes=-500": los últimos 500
            ini, fin = max(0, total - int(fin or 0)), total - 1
        fin = min(fin, total - 1)
        if ini > fin:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{total}")
            self.end_headers()
            return None
        f = open(ruta, "rb")
        f.seek(ini)
        self._restante = fin - ini + 1
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(ruta))
        self.send_header("Content-Range", f"bytes {ini}-{fin}/{total}")
        self.send_header("Content-Length", str(self._restante))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        return f

    def copyfile(self, source, outputfile):
        restante = getattr(self, "_restante", None)
        if restante is None:
            return super().copyfile(source, outputfile)
        self._restante = None
        while restante > 0:
            bloque = source.read(min(64 * 1024, restante))
            if not bloque:
                break
            outputfile.write(bloque)
            restante -= len(bloque)

    def end_headers(self):
        if getattr(self, "_restante", None) is None:
            self.send_header("Accept-Ranges", "bytes")
        super().end_headers()


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    servidor = ThreadingHTTPServer(("", puerto), partial(Handler, directory=RAIZ))
    print(f"Sitio en http://germanweberphotography.local:{puerto}  (Ctrl+C para detener)")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
