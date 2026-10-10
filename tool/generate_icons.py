"""Regenerate launcher assets from assets/icons/app_icon.svg. Requires Pillow 12.3.0."""
from pathlib import Path
import json
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
svg = ET.parse(ROOT / 'assets/icons/app_icon.svg').getroot()
polygons = [(node.attrib['fill'], [tuple(map(float, p.split(',')))
             for p in node.attrib['points'].split()])
            for node in svg.findall('{http://www.w3.org/2000/svg}polygon')]


def render(size, adaptive=False):
    scale = size * 4 / 1024
    canvas = Image.new('RGBA' if adaptive else 'RGB', (size * 4, size * 4),
                       (0, 0, 0, 0) if adaptive else '#FFFFFF')
    draw = ImageDraw.Draw(canvas)
    # Keep foreground inside Android's central 66/108 safe area.
    factor = 0.72 if adaptive else 1
    for color, points in polygons:
        draw.polygon([((512 + (x - 512) * factor) * scale,
                       (512 + (y - 512) * factor) * scale) for x, y in points], fill=color)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def save(image, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


save(render(1024), ROOT / 'assets/icons/app_icon.png')
res = ROOT / 'android/app/src/main/res'
for density, size, foreground in [('mdpi', 48, 108), ('hdpi', 72, 162),
                                  ('xhdpi', 96, 216), ('xxhdpi', 144, 324),
                                  ('xxxhdpi', 192, 432)]:
    save(render(size), res / f'mipmap-{density}/ic_launcher.png')
    save(render(foreground, adaptive=True), res / f'mipmap-{density}/ic_launcher_foreground.png')
adaptive = res / 'mipmap-anydpi-v26/ic_launcher.xml'
adaptive.parent.mkdir(parents=True, exist_ok=True)
adaptive.write_text('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
''')
(res / 'values/icon_colors.xml').write_text('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
''')
ios = ROOT / 'ios/Runner/Assets.xcassets/AppIcon.appiconset'
for item in json.loads((ios / 'Contents.json').read_text())['images']:
    size = round(float(item['size'].split('x')[0]) * float(item['scale'][:-1]))
    save(render(size), ios / item['filename'])
for size in (192, 512):
    for prefix in ('Icon', 'Icon-maskable'):
        save(render(size), ROOT / f'web/icons/{prefix}-{size}.png')
save(render(32), ROOT / 'web/favicon.png')
print('Generated source PNG, Android legacy/adaptive, iOS, and web icons.')
