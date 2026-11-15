# Draws the app icons for Letter Adventure: a rainbow over a pastel sky with "ABC".
# Run from the project folder:  python tools/make-icons.py
# Needs nothing beyond the Python standard library.
# The artwork fills the whole square and keeps the important parts inside the
# middle 80 %, so the same file works as a normal and a maskable icon.
import math, os, struct, zlib

TOP, MID, BOT = (255, 217, 236), (233, 220, 255), (210, 240, 255)
BANDS = [(255, 122, 147), (255, 165, 82), (255, 216, 74), (106, 216, 149), (105, 188, 255), (184, 147, 255)]
INK, WHITE = (217, 45, 127), (255, 255, 255)
FONT = {  # 5 x 7 block letters
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
}

def colour(x, y):
    """Colour at a point; x and y run from 0 to 1."""
    t = (x + y) / 2
    a, b, u = (TOP, MID, t * 2) if t < 0.5 else (MID, BOT, t * 2 - 1)
    c = tuple(a[i] + (b[i] - a[i]) * u for i in range(3))
    # rainbow: six bands of an arc, upper half only
    dx, dy = x - 0.5, y - 0.62
    r = math.hypot(dx, dy)
    if dy <= 0 and 0.16 <= r < 0.40:
        c = BANDS[min(5, int((0.40 - r) / 0.04))]
    # "ABC" in rounded blocks with a white edge, across the lower middle
    cell, gap = 0.034, 0.022
    width = 3 * 5 * cell + 2 * gap
    lx, ly = x - (0.5 - width / 2), y - 0.64
    if -cell <= lx < width + cell and -cell <= ly < 7 * cell + cell:
        best = None
        for n, ch in enumerate("ABC"):
            ox = n * (5 * cell + gap)
            for row in range(7):
                for col in range(5):
                    if FONT[ch][row][col] == "1":
                        cx, cy = ox + (col + 0.5) * cell, (row + 0.5) * cell
                        d = max(abs(lx - cx), abs(ly - cy))
                        best = d if best is None else min(best, d)
        if best is not None:
            if best <= cell * 0.5: c = INK
            elif best <= cell * 0.95: c = WHITE
    return c

def render(size, ss=3):
    rows = []
    for py in range(size):
        row = bytearray([0])
        for px in range(size):
            acc = [0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    c = colour((px + (sx + 0.5) / ss) / size, (py + (sy + 0.5) / ss) / size)
                    for i in range(3): acc[i] += c[i]
            row += bytes(round(v / (ss * ss)) for v in acc)
        rows.append(bytes(row))
    return b"".join(rows)

def png(size, raw):
    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons")
os.makedirs(out, exist_ok=True)
for size in (512, 192, 180):
    with open(os.path.join(out, f"icon-{size}.png"), "wb") as f:
        f.write(png(size, render(size)))
print("icons written")
