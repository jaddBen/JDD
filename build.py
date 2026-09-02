# -*- coding: utf-8 -*-
"""Build PLP.html from index.html, inlining exactly the assets the program
references. Run from the project root."""
import io, os, re, json, base64, subprocess, sys, tempfile

SRC, OUT, MEDIA = "index.html", "PLP.html", "media"
MARKER = "const MEDIA = {}; /* MEDIA-MAP */\n"
MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
        ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png"}

src = io.open(SRC, encoding="utf-8").read()
assert src.count(MARKER) == 1, "MEDIA-MAP marker not found exactly once"

# pull MUS + DAYS out of the page and read them with node
a = src.index("const MUS"); b = src.index("/* ═", src.index("const DAYS"))
tmp = os.path.join(tempfile.gettempdir(), "plp_data.js")
io.open(tmp, "w", encoding="utf-8").write(src[a:b] + "\nconsole.log(JSON.stringify({MUS,DAYS}));\n")
d = json.loads(subprocess.check_output(["node", tmp]).decode("utf-8"))
MUS, DAYS = d["MUS"], d["DAYS"]
ex = [e for day in DAYS for e in day["ex"]]

# every file the app can ask for
need, skipped = [], []
for e in ex:
    need += [e["id"] + "-thumb.jpg", e["id"] + ".gif"]
    if e.get("video"):
        skipped.append(e["id"] + ".webm")          # too big to inline
skipped.append("pull-up.webm")
need.append("muscle-map.webp")
need += ["mus/muscular_system_front.svg", "mus/muscular_system_back.svg"]
prim = {MUS[m][0] for e in ex for m in e["primary"] if m in MUS}
sec  = {MUS[m][0] for e in ex for m in e["secondary"] if m in MUS}
need += ["mus/main-%d.svg" % i for i in sorted(prim)]
need += ["mus/secondary-%d.svg" % i for i in sorted(sec | prim)]

need = sorted(set(need))
missing = [n for n in need if not os.path.exists(os.path.join(MEDIA, n))]
if missing:
    print("MISSING from media/:"); [print("   ", m) for m in missing]; sys.exit(1)

rows, total = [], 0
for n in need:
    p = os.path.join(MEDIA, n)
    raw = open(p, "rb").read(); total += len(raw)
    rows.append('"%s":"data:%s;base64,%s"' % (n, MIME[os.path.splitext(n)[1].lower()],
                                              base64.b64encode(raw).decode("ascii")))
block = "const MEDIA = {\n" + ",\n".join(rows) + "\n};\n"
io.open(OUT, "w", encoding="utf-8", newline="").write(src.replace(MARKER, block))

# report what is on disk but no longer referenced
on_disk = set()
for root, _, files in os.walk(MEDIA):
    for f in files:
        if os.path.splitext(f)[1].lower() in (".gif", ".jpg", ".webm", ".webp", ".svg"):
            on_disk.add(os.path.relpath(os.path.join(root, f), MEDIA).replace("\\", "/"))
orphans = sorted(on_disk - set(need) - set(skipped))

print("inlined %d files (%.1f MB raw) -> %s (%.1f MB)"
      % (len(need), total / 1048576., OUT, os.path.getsize(OUT) / 1048576.))
print("not inlined (loaded from media/ by index.html only): %s" % ", ".join(sorted(skipped)))
print("unused files still on disk (%d): %s" % (len(orphans), ", ".join(orphans) or "none"))
