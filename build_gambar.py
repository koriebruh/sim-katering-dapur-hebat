"""Membuat diagram (diagram/*.drawio + *.png) dan mockup (mockup/*.html + *.png).

Jalankan: python3 build_gambar.py   (butuh google-chrome untuk render PNG)
"""
import html, math, os, subprocess, tempfile
from xml.sax.saxutils import quoteattr

ROOT = os.path.dirname(os.path.abspath(__file__))
FONT = "Liberation Sans, Arial, sans-serif"


def shot(html_path, png_path, w, h, scale=2):
    subprocess.run(["google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu",
                    "--hide-scrollbars", f"--force-device-scale-factor={scale}",
                    f"--window-size={w},{h}", f"--screenshot={png_path}",
                    "file://" + html_path], check=True, capture_output=True)


# ---------------------------------------------------------------- diagram
def ang(deg):
    """Titik pada keliling elips, sudut 0 = kanan, 90 = bawah."""
    r = math.radians(deg)
    return ("xy", 0.5 + 0.5 * math.cos(r), 0.5 + 0.5 * math.sin(r))


def anchor(n, side):
    if isinstance(side, str):
        side = (side, 0.5)
    if side[0] == "xy":
        return side[1], side[2]
    f = side[1]
    return {"l": (0, f), "r": (1, f), "t": (f, 0), "b": (f, 1)}[side[0]]


class Diagram:
    def __init__(self, name, w, h):
        self.name, self.w, self.h, self.nodes, self.edges = name, w, h, {}, []

    def node(self, id, shape, x, y, w, h, text, fields=None):
        self.nodes[id] = dict(id=id, shape=shape, x=x, y=y, w=w, h=h, text=text, fields=fields)

    def entity(self, id, x, y, name, fields, w=200):
        self.node(id, "entity", x, y, w, 28 + 18 * len(fields) + 6, name, fields)

    def edge(self, s, t, label="", a="r", b="l", pts=(), lo=(0, 0), sl="", tl=""):
        self.edges.append(dict(s=s, t=t, label=label, a=a, b=b, pts=list(pts), lo=lo, sl=sl, tl=tl))

    # ---- SVG
    def _text(self, cx, cy, text, size=12, bold=False, bg=False):
        lines = text.split("\n")
        out, lh = [], size + 3
        y0 = cy - lh * (len(lines) - 1) / 2
        if bg:
            wmax = max(len(l) for l in lines) * size * 0.56 + 6
            out.append(f'<rect x="{cx - wmax / 2:.1f}" y="{y0 - lh / 2 - 1:.1f}" width="{wmax:.1f}" '
                       f'height="{lh * len(lines) + 2:.1f}" fill="#fff"/>')
        weight = ' font-weight="bold"' if bold else ""
        for i, l in enumerate(lines):
            out.append(f'<text x="{cx:.1f}" y="{y0 + i * lh:.1f}" font-size="{size}" text-anchor="middle" '
                       f'dominant-baseline="central"{weight}>{html.escape(l)}</text>')
        return "".join(out)

    def svg(self):
        o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" '
             f'font-family="{FONT}"><rect width="100%" height="100%" fill="#fff"/>'
             '<defs><marker id="ar" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">'
             '<path d="M0,0 L10,4 L0,8 z" fill="#333"/></marker></defs>']
        st = 'fill="#fff" stroke="#333" stroke-width="1.4"'
        for e in self.edges:
            s, t = self.nodes[e["s"]], self.nodes[e["t"]]
            fa, fb = anchor(s, e["a"]), anchor(t, e["b"])
            p = [(s["x"] + s["w"] * fa[0], s["y"] + s["h"] * fa[1])] + e["pts"] + \
                [(t["x"] + t["w"] * fb[0], t["y"] + t["h"] * fb[1])]
            o.append('<polyline points="%s" fill="none" stroke="#333" stroke-width="1.3" marker-end="url(#ar)"/>'
                     % " ".join(f"{x:.1f},{y:.1f}" for x, y in p))
            k = (len(p) - 1) // 2
            mx, my = (p[k][0] + p[k + 1][0]) / 2, (p[k][1] + p[k + 1][1]) / 2
            if e["label"]:
                o.append(self._text(mx + e["lo"][0], my + e["lo"][1], e["label"], 11, bg=True))
            for lab, (q0, q1) in ((e["sl"], (p[0], p[1])), (e["tl"], (p[-1], p[-2]))):
                if lab:
                    d = math.hypot(q1[0] - q0[0], q1[1] - q0[1]) or 1
                    ux, uy = (q1[0] - q0[0]) / d, (q1[1] - q0[1]) / d
                    o.append(self._text(q0[0] + ux * 16 - uy * 11, q0[1] + uy * 16 + ux * 11, lab, 12, bold=True))
        for n in self.nodes.values():
            x, y, w, h, sh = n["x"], n["y"], n["w"], n["h"], n["shape"]
            cx, cy = x + w / 2, y + h / 2
            if sh == "rect":
                o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" {st}/>')
            elif sh == "term":
                o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h / 2}" {st}/>')
            elif sh == "ellipse":
                o.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{w / 2}" ry="{h / 2}" {st}/>')
            elif sh == "diamond":
                o.append(f'<polygon points="{cx},{y} {x + w},{cy} {cx},{y + h} {x},{cy}" {st}/>')
            elif sh == "store":
                o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#fff"/>'
                         f'<path d="M{x},{y} H{x + w} M{x},{y + h} H{x + w}" stroke="#333" stroke-width="1.4"/>')
            elif sh == "entity":
                o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" {st}/>'
                         f'<rect x="{x}" y="{y}" width="{w}" height="26" fill="#D9E2EC" stroke="#333" stroke-width="1.4"/>')
                o.append(self._text(cx, y + 13, n["text"], 12, bold=True))
                for i, f in enumerate(n["fields"]):
                    o.append(f'<text x="{x + 8}" y="{y + 42 + i * 18}" font-size="11.5">{html.escape(f)}</text>')
                continue
            o.append(self._text(cx, cy, n["text"], 12))
        return "".join(o) + "</svg>"

    # ---- draw.io
    def drawio(self):
        STY = {"rect": "rounded=0;", "term": "rounded=1;arcSize=50;", "ellipse": "ellipse;", "diamond": "rhombus;",
               "store": "shape=partialRectangle;left=0;right=0;fillColor=none;",
               "entity": "rounded=0;align=left;verticalAlign=top;spacingLeft=6;"}
        c = ['<mxCell id="0"/><mxCell id="1" parent="0"/>']
        for n in self.nodes.values():
            if n["shape"] == "entity":
                v = f"<b>{n['text']}</b><hr>" + "<br>".join(n["fields"])
            else:
                v = html.escape(n["text"]).replace("\n", "<br>")
            c.append(f'<mxCell id="{n["id"]}" value={quoteattr(v)} style="{STY[n["shape"]]}whiteSpace=wrap;html=1;" '
                     f'vertex="1" parent="1"><mxGeometry x="{n["x"]}" y="{n["y"]}" width="{n["w"]}" '
                     f'height="{n["h"]}" as="geometry"/></mxCell>')
        for i, e in enumerate(self.edges):
            fa, fb = anchor(self.nodes[e["s"]], e["a"]), anchor(self.nodes[e["t"]], e["b"])
            pts = "".join(f'<mxPoint x="{x}" y="{y}"/>' for x, y in e["pts"])
            pts = f'<Array as="points">{pts}</Array>' if pts else ""
            off = f'<mxPoint x="{e["lo"][0]}" y="{e["lo"][1]}" as="offset"/>'
            v = html.escape(e["label"]).replace("\n", "<br>")
            c.append(f'<mxCell id="e{i}" value={quoteattr(v)} style="endArrow=classic;html=1;rounded=0;fontSize=11;'
                     f'exitX={fa[0]:.3f};exitY={fa[1]:.3f};exitDx=0;exitDy=0;entryX={fb[0]:.3f};entryY={fb[1]:.3f};'
                     f'entryDx=0;entryDy=0;" edge="1" parent="1" source="{e["s"]}" target="{e["t"]}">'
                     f'<mxGeometry relative="1" as="geometry">{pts}{off}</mxGeometry></mxCell>')
            for j, (lab, pos) in enumerate(((e["sl"], -0.8), (e["tl"], 0.8))):
                if lab:
                    c.append(f'<mxCell id="e{i}l{j}" value="{lab}" style="edgeLabel;html=1;fontStyle=1;fontSize=12;" '
                             f'vertex="1" connectable="0" parent="e{i}"><mxGeometry x="{pos}" relative="1" '
                             f'as="geometry"><mxPoint y="-12" as="offset"/></mxGeometry></mxCell>')
        return (f'<mxfile host="app.diagrams.net"><diagram name={quoteattr(self.name)}>'
                f'<mxGraphModel dx="1000" dy="700" grid="1" gridSize="10" page="1" pageWidth="{self.w}" '
                f'pageHeight="{self.h}"><root>{"".join(c)}</root></mxGraphModel></diagram></mxfile>')

    def save(self, base):
        d = os.path.join(ROOT, "diagram")
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, base + ".drawio"), "w").write(self.drawio())
        with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
            f.write(f'<body style="margin:0">{self.svg()}</body>')
        shot(f.name, os.path.join(d, base + ".png"), self.w, self.h)
        os.unlink(f.name)


def flowchart_berjalan():
    g = Diagram("Flowchart Sistem Berjalan", 640, 880)
    steps = [("mulai", "term", "Mulai", 36),
             ("a", "rect", "Pelanggan memesan lewat\nWhatsApp / telepon", 50),
             ("b", "rect", "Admin mencatat pesanan\ndi buku pesanan", 50),
             ("c", "rect", "Admin menghitung total secara\nmanual dan meminta uang muka", 50),
             ("d", "diamond", "Uang muka\ndibayar?", 84),
             ("e", "rect", "Admin memberi tahu dapur\n(lisan / pesan WhatsApp)", 50),
             ("f", "rect", "Dapur belanja bahan\ndan memasak", 50),
             ("g", "rect", "Pesanan dikemas\ndan dikirim", 50),
             ("h", "rect", "Pelunasan dicatat\ndi buku kas", 50),
             ("i", "rect", "Pemilik merekap buku\nsecara manual tiap bulan", 50),
             ("selesai", "term", "Selesai", 36)]
    y, prev = 20, None
    for id, sh, text, h in steps:
        w = 170 if sh == "diamond" else (120 if sh == "term" else 250)
        g.node(id, sh, 200 - w / 2, y, w, h, text)
        if prev:
            g.edge(prev, id, "Ya" if prev == "d" else "", "b", "t", lo=(14, 0))
        prev, y = id, y + h + 28
    g.node("x", "rect", 430, g.nodes["d"]["y"] + 17, 180, 50, "Admin menagih ulang,\npesanan ditunda")
    g.edge("d", "x", "Tidak", "r", "l", lo=(0, -10))
    cy = g.nodes["c"]["y"] + 25
    g.edge("x", "c", "", "t", "r", pts=[(520, cy)])
    g.save("gambar-2.1-flowchart-sistem-berjalan")


def dfd_konteks():
    g = Diagram("DFD Konteks", 960, 600)
    g.node("s", "ellipse", 350, 230, 260, 140, "Sistem Informasi\nPemesanan dan Produksi\nKatering")
    g.node("pel", "rect", 20, 277, 150, 46, "Pelanggan")
    g.node("adm", "rect", 405, 20, 150, 46, "Admin Pemesanan")
    g.node("dap", "rect", 790, 277, 150, 46, "Kepala Dapur")
    g.node("man", "rect", 130, 520, 170, 46, "Manajer Operasional")
    g.node("own", "rect", 660, 520, 170, 46, "Pemilik")
    g.edge("pel", "s", "data pesanan, pembayaran", ("r", 0.25), ang(188), lo=(0, -12))
    g.edge("s", "pel", "konfirmasi pesanan, tagihan", ang(172), ("r", 0.75), lo=(0, 14))
    g.edge("adm", "s", "data menu, pelanggan,\npesanan, pembayaran", ("b", 0.3), ang(258), lo=(-88, 0))
    g.edge("s", "adm", "daftar pesanan,\nsisa tagihan", ang(282), ("b", 0.7), lo=(70, 0))
    g.edge("s", "dap", "jadwal produksi,\nrekap kebutuhan menu", ang(-8), ("l", 0.25), lo=(0, -18))
    g.edge("dap", "s", "status pesanan", ("l", 0.75), ang(8), lo=(0, 13))
    g.edge("man", "s", "periode laporan", ("t", 0.35), ang(138), lo=(-58, 0))
    g.edge("s", "man", "laporan penjualan\ndan piutang", ang(118), ("t", 0.8), lo=(62, 8))
    g.edge("s", "own", "dashboard ringkasan\nusaha", ang(55), ("t", 0.4), lo=(86, 0))
    g.save("gambar-3.1-dfd-konteks")


def dfd_level1():
    g = Diagram("DFD Level 1", 1000, 590)
    for id, y, t in (("p1", 15, "1.0\nKelola Data\nMaster"), ("p2", 200, "2.0\nPemesanan"), ("p3", 385, "3.0\nPembayaran")):
        g.node(id, "ellipse", 300, y, 150, 80, t)
    g.node("p4", "ellipse", 570, 275, 150, 80, "4.0\nProduksi dan\nPengiriman")
    g.node("p5", "ellipse", 570, 465, 150, 80, "5.0\nPelaporan")
    g.node("d1", "store", 225, 130, 130, 34, "D1 Menu")
    g.node("d2", "store", 395, 130, 130, 34, "D2 Pelanggan")
    g.node("d3", "store", 310, 315, 130, 34, "D3 Pesanan")
    g.node("d4", "store", 310, 500, 130, 34, "D4 Pembayaran")
    g.node("adm1", "rect", 20, 32, 140, 46, "Admin Pemesanan")
    g.node("pel", "rect", 20, 217, 140, 46, "Pelanggan")
    g.node("adm2", "rect", 20, 402, 140, 46, "Admin Pemesanan")
    g.node("dap", "rect", 845, 292, 140, 46, "Kepala Dapur")
    g.node("man", "rect", 845, 410, 140, 46, "Manajer\nOperasional")
    g.node("own", "rect", 845, 520, 140, 46, "Pemilik")
    g.edge("adm1", "p1", "data menu,\ndata pelanggan", "r", "l", lo=(0, -18))
    g.edge("p1", "d1", "", ang(125), "t")
    g.edge("p1", "d2", "", ang(55), "t")
    g.edge("d1", "p2", "harga menu", "b", ang(235), lo=(-42, 0))
    g.edge("d2", "p2", "data pelanggan", "b", ang(305), lo=(52, 0))
    g.edge("pel", "p2", "data pesanan", ("r", 0.25), ang(188), lo=(0, -10))
    g.edge("p2", "pel", "konfirmasi, tagihan", ang(172), ("r", 0.75), lo=(0, 12))
    g.edge("p2", "d3", "pesanan", "b", "t", lo=(34, 0))
    g.edge("d3", "p3", "tagihan", "b", "t", lo=(32, 0))
    g.edge("adm2", "p3", "data pembayaran", ("r", 0.25), ang(188), lo=(0, -10))
    g.edge("p3", "adm2", "sisa tagihan", ang(172), ("r", 0.75), lo=(0, 12))
    g.edge("p3", "d4", "pembayaran", "b", "t", lo=(44, 0))
    g.edge("d3", "p4", "pesanan terjadwal", ("r", 0.2), ang(190), lo=(0, -12))
    g.edge("p4", "d3", "status pesanan", ang(170), ("r", 0.8), lo=(0, 13))
    g.edge("p4", "dap", "jadwal produksi", ang(-8), ("l", 0.25), lo=(0, -10))
    g.edge("dap", "p4", "status", ("l", 0.75), ang(8), lo=(0, 12))
    g.edge("d3", "p5", "data pesanan", ("b", 0.9), ang(205), lo=(8, -8))
    g.edge("d4", "p5", "data pembayaran", "r", ang(172), lo=(0, 12))
    g.edge("p5", "man", "laporan penjualan\ndan piutang", ang(-25), "l", lo=(-34, -26))
    g.edge("p5", "own", "dashboard", ang(20), "l", lo=(-14, 16))
    g.save("gambar-3.2-dfd-level-1")


def erd():
    g = Diagram("ERD", 960, 720)
    g.entity("pelanggan", 30, 40, "pelanggan", ["id_pelanggan (PK)", "nama", "no_hp", "alamat"])
    g.entity("pesanan", 380, 40, "pesanan", ["id_pesanan (PK)", "id_pelanggan (FK)", "id_pengguna (FK)", "tgl_pesan",
                                             "tgl_kirim", "alamat_kirim", "total", "status"])
    g.entity("pengguna", 730, 40, "pengguna", ["id_pengguna (PK)", "nama", "username", "password", "peran"])
    g.entity("menu", 30, 350, "menu", ["id_menu (PK)", "nama_menu", "slug", "komposisi", "harga", "foto", "aktif"])
    g.entity("foto", 30, 580, "menu_foto", ["menu_id (PK, FK)", "tipe", "data", "diperbarui_pada"])
    g.edge("menu", "foto", "memiliki", "b", "t", lo=(38, 0), sl="1", tl="1")
    g.entity("detail", 380, 350, "detail_pesanan", ["id_detail (PK)", "id_pesanan (FK)", "id_menu (FK)", "jumlah",
                                                    "harga_satuan", "subtotal"])
    g.entity("bayar", 730, 350, "pembayaran", ["id_bayar (PK)", "id_pesanan (FK)", "tgl_bayar", "jenis", "metode",
                                               "jumlah"])
    g.edge("pelanggan", "pesanan", "melakukan", ("r", 0.4), ("l", 0.25), sl="1", tl="N")
    g.edge("pengguna", "pesanan", "mencatat", ("l", 0.4), ("r", 0.27), sl="1", tl="N")
    g.edge("pesanan", "detail", "memiliki", "b", "t", lo=(36, 0), sl="1", tl="N")
    g.edge("menu", "detail", "dipesan pada", ("r", 0.4), ("l", 0.35), sl="1", tl="N")
    g.edge("pesanan", "bayar", "dibayar\ndengan", ("b", 0.85), ("t", 0.3), lo=(34, 0), sl="1", tl="N")
    g.save("gambar-3.3-erd")


# ---------------------------------------------------------------- mockup
CSS = """
*{box-sizing:border-box}body{margin:0;font:14px/1.45 'Liberation Sans',Arial,sans-serif;color:#1f2933;background:#f4f1ec}
.app{display:flex;height:660px}.side{width:210px;background:#2f4a3a;color:#dfe8e1;padding:22px 0}
.brand{font-weight:700;font-size:17px;color:#fff;padding:0 22px 4px}.brand small{display:block;font-weight:400;font-size:11px;opacity:.7}
.side a{display:block;padding:10px 22px;margin-top:2px}.side a.on{background:#e98a2b;color:#fff;font-weight:700}
.side .nav{margin-top:24px}.main{flex:1;padding:24px 30px;overflow:hidden}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
h1{font-size:22px;margin:0}.who{font-size:12px;color:#52606d;background:#fff;border:1px solid #ddd6cb;border-radius:20px;padding:6px 14px}
.card{background:#fff;border:1px solid #e2dcd2;border-radius:10px;padding:16px 18px}
.grid{display:grid;gap:16px}.g4{grid-template-columns:repeat(4,1fr)}.g2{grid-template-columns:1.5fr 1fr}
.kpi b{display:block;font-size:24px;margin-top:4px}.kpi span{font-size:12px;color:#52606d}.kpi i{font-style:normal;font-size:12px;color:#2f855a}
h2{font-size:15px;margin:0 0 10px}table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;background:#f1ede6;padding:8px 10px;font-size:12px;color:#52606d}td{padding:8px 10px;border-top:1px solid #eee8de}
td.r,th.r{text-align:right}.b{display:inline-block;padding:2px 10px;border-radius:12px;font-size:11.5px;font-weight:700}
.b1{background:#fde8cf;color:#9c4f0c}.b2{background:#dbeafe;color:#1e4fa3}.b3{background:#d9f2e1;color:#1f6b3b}.b4{background:#fde2e2;color:#a12626}
.btn{display:inline-block;background:#e98a2b;color:#fff;font-weight:700;border-radius:7px;padding:9px 18px;font-size:13px}
.btn.o{background:#fff;color:#2f4a3a;border:1px solid #2f4a3a}.btn.s{padding:4px 10px;font-size:12px}
label{display:block;font-size:12px;color:#52606d;margin:0 0 4px}.in{border:1px solid #cfc8bc;border-radius:7px;padding:8px 10px;background:#fff;min-height:36px}
.row{display:flex;gap:14px;margin-bottom:12px}.row>div{flex:1}.bar{display:flex;align-items:flex-end;gap:14px;height:170px;padding-top:10px}
.bar div{flex:1;background:#e98a2b;border-radius:5px 5px 0 0;position:relative}.bar div span{position:absolute;bottom:-20px;left:0;right:0;text-align:center;font-size:11px;color:#52606d}
.bar div em{position:absolute;top:-17px;left:0;right:0;text-align:center;font-size:11px;font-style:normal}
.menu{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid #eee8de}.menu img{width:54px;height:40px;object-fit:cover;border-radius:6px}
.menu b{flex:1;font-weight:400}.tot{display:flex;justify-content:space-between;padding:5px 0}.tot.big{font-size:17px;font-weight:700;border-top:2px solid #2f4a3a;margin-top:6px;padding-top:9px}
"""
NAV = ["Dashboard", "Pesanan", "Jadwal Produksi", "Menu & Paket", "Pelanggan", "Pembayaran", "Laporan"]
IMG = "../asset/WhatsApp Image 2026-11-15 at "


def page(title, who, active, body):
    nav = "".join(f'<a class="{"on" if n == active else ""}">{n}</a>' for n in NAV)
    return (f'<!doctype html><meta charset="utf-8"><style>{CSS}</style><div class="app"><div class="side">'
            f'<div class="brand">Dapur Hebat<small>SIM Pemesanan &amp; Produksi</small></div><div class="nav">{nav}</div></div>'
            f'<div class="main"><div class="top"><h1>{title}</h1><div class="who">{who}</div></div>{body}</div></div>')


def rows(data, right=()):
    return "".join("<tr>" + "".join(f'<td class="{"r" if i in right else ""}">{c}</td>' for i, c in enumerate(r)) + "</tr>"
                   for r in data)


def mockups():
    P = {}
    P["gambar-3.4-login"] = f"""<!doctype html><meta charset="utf-8"><style>{CSS}</style>
<div style="display:flex;height:660px"><div style="flex:1.1;background:#2f4a3a url('{IMG}16.45.03.jpeg') center/cover;position:relative">
<div style="position:absolute;inset:0;background:rgba(30,50,38,.62);color:#fff;padding:70px 60px">
<div style="font-size:34px;font-weight:700">Katering Dapur Hebat</div><div style="font-size:16px;margin-top:8px;opacity:.9">Sistem Informasi Pemesanan dan Produksi Katering</div></div></div>
<div style="flex:1;display:flex;align-items:center;justify-content:center"><div class="card" style="width:380px;padding:34px">
<h1 style="margin-bottom:6px">Masuk</h1><div style="color:#52606d;margin-bottom:22px">Gunakan akun sesuai peran Anda.</div>
<label>Nama pengguna</label><div class="in" style="margin-bottom:14px">admin.rina</div>
<label>Kata sandi</label><div class="in" style="margin-bottom:26px">••••••••</div>
<div class="btn" style="display:block;text-align:center">Masuk</div>
<div style="font-size:12px;color:#52606d;margin-top:18px">Peran: Admin Pemesanan · Kepala Dapur · Manajer Operasional · Pemilik</div></div></div></div>"""

    P["gambar-3.5-dashboard-peran"] = page("Dashboard Kepala Dapur — Sabtu, 21 November 2026", "Bu Sari · Kepala Dapur", "Dashboard", f"""
<div class="grid g4" style="margin-bottom:16px"><div class="card kpi"><span>Pesanan dikirim hari ini</span><b>4</b></div>
<div class="card kpi"><span>Total porsi hari ini</span><b>230</b></div><div class="card kpi"><span>Sedang diproses</span><b>2</b></div>
<div class="card kpi"><span>Pesanan besok</span><b>3</b><i>145 porsi</i></div></div>
<div class="grid g2"><div class="card"><h2>Jadwal produksi hari ini</h2><table><tr><th>Jam kirim</th><th>Pelanggan</th><th>Menu</th><th class="r">Porsi</th><th>Status</th><th></th></tr>
{rows([["09.00", "SDN Pamulang 02", "Paket Hebat 2", "80", '<span class="b b3">Selesai</span>', ""],
       ["11.00", "PT Maju Bersama", "Paket Hebat 1", "50", '<span class="b b2">Dikirim</span>', '<span class="btn o s">Selesai</span>'],
       ["11.30", "Ibu Dewi (arisan)", "Nasi box ayam bakar", "30", '<span class="b b1">Diproses</span>', '<span class="btn s">Kirim</span>'],
       ["16.00", "Kel. Bpk. Hadi", "Tumpeng Mini", "70", '<span class="b b1">Diproses</span>', '<span class="btn s">Kirim</span>']], right=(3,))}</table></div>
<div class="card"><h2>Rekap kebutuhan komponen menu hari ini</h2><table><tr><th>Komponen</th><th class="r">Porsi</th></tr>
{rows([["Nasi putih", "160"], ["Nasi kuning", "70"], ["Tempe orek", "200"], ["Urap kacang panjang", "200"], ["Ayam goreng", "120"],
       ["Kentang balado", "120"], ["Soun goreng", "80"], ["Telur ceplok balado", "80"], ["Ayam bakar", "30"]], right=(1,))}</table></div></div>""")

    P["gambar-3.6-form-pesanan"] = page("Pesanan Baru", "Rina · Admin Pemesanan", "Pesanan", f"""
<div class="grid g2"><div class="card"><h2>Data pesanan</h2>
<div class="row"><div><label>Pelanggan</label><div class="in">PT Maju Bersama — 0812-5550-142</div></div><div style="flex:.5"><label>No. pesanan</label><div class="in">PSN-2611-018</div></div></div>
<div class="row"><div><label>Tanggal kirim</label><div class="in">21/11/2026</div></div><div><label>Jam kirim</label><div class="in">11.00</div></div><div><label>Tanggal pesan</label><div class="in">15/11/2026</div></div></div>
<div class="row"><div><label>Alamat kirim</label><div class="in">Jl. Siliwangi No. 12, Pamulang Barat</div></div></div>
<h2 style="margin-top:18px">Item pesanan</h2><table><tr><th>Menu</th><th class="r">Harga</th><th class="r">Jumlah</th><th class="r">Subtotal</th></tr>
{rows([["Paket Hebat 1", "Rp30.000", "50", "Rp1.500.000"], ["Nasi box ayam bakar", "Rp27.000", "30", "Rp810.000"]], right=(1, 2, 3))}</table>
<div style="margin-top:12px"><span class="btn o s">+ Tambah menu</span></div>
<div class="row" style="margin-top:16px"><div><label>Catatan</label><div class="in">Sambal dipisah, 5 box tanpa timun</div></div></div></div>
<div class="card"><h2>Ringkasan pembayaran</h2><div class="tot"><span>Total porsi</span><span>80</span></div>
<div class="tot"><span>Subtotal</span><span>Rp2.310.000</span></div><div class="tot"><span>Ongkos kirim</span><span>Rp0</span></div>
<div class="tot big"><span>Total</span><span>Rp2.310.000</span></div>
<div class="row" style="margin-top:16px"><div><label>Uang muka (min. 50%)</label><div class="in">Rp1.155.000</div></div><div><label>Metode</label><div class="in">Transfer bank</div></div></div>
<div class="tot"><span>Sisa tagihan</span><b>Rp1.155.000</b></div>
<div style="margin-top:22px;display:flex;gap:10px"><span class="btn">Simpan pesanan</span><span class="btn o">Batal</span></div>
<div style="font-size:12px;color:#52606d;margin-top:14px">Total dan sisa tagihan dihitung otomatis oleh sistem.</div></div></div>""")

    P["gambar-3.7-daftar-pesanan"] = page("Daftar Pesanan", "Rina · Admin Pemesanan", "Pesanan", f"""
<div class="card" style="margin-bottom:16px"><div class="row" style="margin:0;align-items:flex-end"><div style="flex:2"><label>Cari pelanggan / no. pesanan</label><div class="in"></div></div>
<div><label>Tanggal kirim</label><div class="in">16/11 – 22/11/2026</div></div><div><label>Status</label><div class="in">Semua status</div></div>
<div style="flex:0 0 auto"><span class="btn">Cari</span></div><div style="flex:0 0 auto"><span class="btn o">+ Pesanan baru</span></div></div></div>
<div class="card"><table><tr><th>No. pesanan</th><th>Pelanggan</th><th>Tgl kirim</th><th class="r">Porsi</th><th class="r">Total</th><th class="r">Sisa tagihan</th><th>Status</th></tr>
{rows([["PSN-2611-018", "PT Maju Bersama", "21/11/2026", "80", "Rp2.310.000", "Rp1.155.000", '<span class="b b1">Diproses</span>'],
       ["PSN-2611-017", "SDN Pamulang 02", "21/11/2026", "80", "Rp1.760.000", "Rp0", '<span class="b b3">Selesai</span>'],
       ["PSN-2611-016", "Ibu Dewi (arisan)", "21/11/2026", "30", "Rp810.000", "Rp405.000", '<span class="b b1">Diproses</span>'],
       ["PSN-2611-015", "Kel. Bpk. Hadi", "21/11/2026", "70", "Rp2.450.000", "Rp1.225.000", '<span class="b b1">Diproses</span>'],
       ["PSN-2611-014", "CV Maju Lancar", "20/11/2026", "40", "Rp1.280.000", "Rp0", '<span class="b b3">Selesai</span>'],
       ["PSN-2611-013", "Masjid Al-Ikhlas", "20/11/2026", "100", "Rp2.500.000", "Rp1.250.000", '<span class="b b2">Dikirim</span>'],
       ["PSN-2611-012", "Ibu Ratna", "19/11/2026", "25", "Rp700.000", "Rp0", '<span class="b b3">Selesai</span>'],
       ["PSN-2611-011", "PT Sinar Abadi", "18/11/2026", "60", "Rp1.800.000", "Rp1.800.000", '<span class="b b4">Menunggu DP</span>']], right=(3, 4, 5))}</table>
<div style="font-size:12px;color:#52606d;margin-top:12px">Menampilkan 8 dari 8 pesanan</div></div>""")

    P["gambar-3.8-laporan-manajer"] = page("Laporan Penjualan", "Pak Budi · Manajer Operasional", "Laporan", f"""
<div class="card" style="margin-bottom:16px"><div class="row" style="margin:0;align-items:flex-end"><div><label>Jenis laporan</label><div class="in">Penjualan per menu</div></div>
<div><label>Periode</label><div class="in">01/10/2026 – 31/10/2026</div></div><div style="flex:0 0 auto"><span class="btn">Tampilkan</span></div>
<div style="flex:0 0 auto"><span class="btn o">Cetak PDF</span></div><div style="flex:0 0 auto"><span class="btn o">Ekspor Excel</span></div></div></div>
<div class="grid g2"><div class="card"><h2>Penjualan per menu — Oktober 2026</h2><table><tr><th>Menu</th><th class="r">Pesanan</th><th class="r">Porsi</th><th class="r">Penjualan</th></tr>
{rows([["Paket Hebat 1", "14", "720", "Rp21.600.000"], ["Nasi box ayam bakar", "12", "540", "Rp14.580.000"], ["Paket Hebat 2", "9", "610", "Rp13.420.000"],
       ["Tumpeng Mini", "7", "330", "Rp11.550.000"], ["Paket Hebat 3", "8", "390", "Rp10.920.000"], ["Nasi box ayam serundeng", "8", "360", "Rp9.000.000"],
       ["Nasi box cumi cabe ijo", "4", "150", "Rp4.800.000"], ["<b>Total</b>", "<b>62</b>", "<b>3.100</b>", "<b>Rp85.870.000</b>"]], right=(1, 2, 3))}</table></div>
<div class="card"><h2>Piutang belum lunas</h2><table><tr><th>Pelanggan</th><th>Tgl kirim</th><th class="r">Sisa</th></tr>
{rows([["PT Sinar Abadi", "28/10", "Rp1.800.000"], ["Masjid Al-Ikhlas", "25/10", "Rp1.250.000"], ["Kel. Bpk. Hadi", "24/10", "Rp1.225.000"],
       ["Ibu Dewi", "30/10", "Rp405.000"], ["<b>Total piutang</b>", "", "<b>Rp4.680.000</b>"]], right=(2,))}</table>
<div style="font-size:12px;color:#52606d;margin-top:14px">Pembayaran diterima bulan ini: Rp81.190.000</div></div></div>""")

    bars = [("Jun", 58.2), ("Jul", 64.9), ("Agu", 71.4), ("Sep", 76.0), ("Okt", 85.9), ("Nov*", 49.3)]
    P["gambar-3.9-dashboard-pimpinan"] = page("Dashboard Pemilik", "Ibu Hj. Nurhayati · Pemilik", "Dashboard", f"""
<div class="grid g4" style="margin-bottom:16px"><div class="card kpi"><span>Omzet Oktober 2026</span><b>Rp85,9 jt</b><i>▲ 13% dari September</i></div>
<div class="card kpi"><span>Jumlah pesanan</span><b>62</b><i>▲ 7 pesanan</i></div><div class="card kpi"><span>Porsi terjual</span><b>3.100</b><i>▲ 11%</i></div>
<div class="card kpi"><span>Piutang belum lunas</span><b>Rp4,7 jt</b><span>4 pelanggan</span></div></div>
<div class="grid g2"><div class="card"><h2>Tren omzet 6 bulan (juta rupiah)</h2><div class="bar">
{"".join(f'<div style="height:{v / 90 * 100:.0f}%"><em>{str(v).replace(".", ",")}</em><span>{m}</span></div>' for m, v in bars)}</div>
<div style="font-size:12px;color:#52606d;margin-top:30px">*November berjalan sampai tanggal 15.</div>
<h2 style="margin-top:18px">Perlu perhatian</h2><div style="font-size:13px">• Piutang PT Sinar Abadi Rp1,8 jt sudah lewat 18 hari.<br>• Nasi box cumi cabe ijo hanya 4 pesanan bulan ini — pertimbangkan promo atau evaluasi harga.</div></div>
<div class="card"><h2>Menu terlaris bulan ini</h2>
{"".join(f'<div class="menu"><img src="{IMG}{f}"><b>{n}</b><span>{p} porsi</span></div>' for n, f, p in
         [("Paket Hebat 1", "16.45.01 (2).jpeg", "720"), ("Paket Hebat 2", "16.45.02 (2).jpeg", "610"), ("Nasi box ayam bakar", "16.45.01 (1).jpeg", "540"),
          ("Paket Hebat 3", "16.45.02 (1).jpeg", "390"), ("Nasi box ayam serundeng", "16.45.01.jpeg", "360"), ("Tumpeng Mini", "16.45.03.jpeg", "330")])}</div></div>""")

    kartu = "".join(f'<div class="card" style="padding:0;overflow:hidden"><img src="{IMG}{f}" style="width:100%;height:150px;object-fit:cover;display:block">'
                    f'<div style="padding:12px 14px"><b>{n}</b><div style="display:flex;justify-content:space-between;margin-top:6px;font-size:13px">'
                    f'<span style="color:#52606d">per porsi</span><b style="color:#c9701a">{p}</b></div></div></div>' for n, f, p in
                    [("Paket Hebat 1", "16.45.01 (2).jpeg", "Rp30.000"), ("Nasi Box Ayam Bakar", "16.45.01 (1).jpeg", "Rp27.000"),
                     ("Nasi Box Cumi Cabe Ijo", "16.45.02.jpeg", "Rp32.000"), ("Tumpeng Mini", "16.45.03.jpeg", "Rp35.000")])
    P["gambar-3.10-halaman-publik"] = f"""<!doctype html><meta charset="utf-8"><style>{CSS}</style>
<div style="background:#fff;display:flex;justify-content:space-between;align-items:center;padding:16px 60px;border-bottom:1px solid #e2dcd2">
<b style="font-size:19px;color:#2f4a3a">Katering Dapur Hebat</b><div style="display:flex;gap:28px;align-items:center;font-size:14px"><span>Beranda</span><span>Menu</span><span>Cara Pesan</span><span>Kontak</span><span class="btn o s">Masuk</span></div></div>
<div style="display:flex;align-items:center;gap:40px;padding:44px 60px;background:#2f4a3a;color:#fff"><div style="flex:1">
<div style="font-size:38px;font-weight:700;line-height:1.2">Nasi box dan tumpeng untuk setiap acara Anda</div>
<div style="font-size:16px;opacity:.85;margin:14px 0 24px">Masakan rumahan, dikirim tepat waktu ke kantor, sekolah, dan rumah di Tangerang Selatan.</div>
<span class="btn">Pesan lewat WhatsApp</span> <span class="btn o" style="margin-left:8px">Lihat menu</span></div>
<img src="{IMG}16.45.02 (1).jpeg" style="width:440px;height:270px;object-fit:cover;border-radius:14px"></div>
<div style="padding:34px 60px"><h1 style="margin-bottom:6px">Menu pilihan</h1><div style="color:#52606d;margin-bottom:18px">Tujuh pilihan nasi box, paket, dan tumpeng mini. Minimal pemesanan 25 porsi.</div>
<div class="grid g4">{kartu}</div></div>"""

    d = os.path.join(ROOT, "mockup")
    os.makedirs(d, exist_ok=True)
    for name, htm in P.items():
        p = os.path.join(d, name + ".html")
        open(p, "w").write(htm)
        shot(p, os.path.join(d, name + ".png"), 1280, 860 if "publik" in name else 660, 1.5)


if __name__ == "__main__":
    # mockups() tidak dipanggil lagi: gambar di mockup/ kini tangkapan layar aplikasi asli
    flowchart_berjalan(); dfd_konteks(); dfd_level1(); erd()
    print("ok")
