#!/usr/bin/env python3
"""Подгонка изображения под точный размер плашки с выбором точки кадрирования.

focus — какую часть исходника сохранить: 0 = верх/лево, 0.5 = центр, 1 = низ/право.
Результат всегда ровно target-размера, поэтому в вёрстке он не кадрируется.
"""
from PIL import Image
import sys, pathlib

def fit(src, dst, w=1312, h=672, fx=0.5, fy=0.5, quality=86):
    im = Image.open(src).convert('RGB')
    sw, sh = im.size
    k = max(w / sw, h / sh)
    nw, nh = round(sw * k), round(sh * k)
    im = im.resize((nw, nh), Image.LANCZOS)
    left = round((nw - w) * fx)
    top = round((nh - h) * fy)
    im = im.crop((left, top, left + w, top + h))
    dst = pathlib.Path(dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, 'JPEG', quality=quality, optimize=True, progressive=True)
    kept = round(min(1, (h / k) / sh) * 100)
    print(f'{dst.name:<22} {w}×{h}  {dst.stat().st_size // 1024:>4} KB  '
          f'из {sw}×{sh}, сохранено {kept}% высоты')
    return dst

if __name__ == '__main__':
    a = sys.argv[1:]
    fit(a[0], a[1], int(a[2]), int(a[3]), float(a[4] if len(a) > 4 else .5), float(a[5] if len(a) > 5 else .5))


def compose(src, dst, w=1312, h=672, side='right', pad=0.0, quality=88, shade=0.0):
    """Вертикальное фото в широкую плашку без обрезки.

    Снимок кладётся целиком по высоте, оставшееся поле достраивается
    растяжкой краевых пикселей — на студийном фоне шов не виден.
    Текст плашки ложится на достроенную часть.
    """
    from PIL import Image, ImageFilter
    im = Image.open(src).convert('RGB')
    sw, sh = im.size
    ih = round(h * (1 - pad))
    iw = round(sw * ih / sh)
    photo = im.resize((iw, ih), Image.LANCZOS)

    # фон: размытая копия кадра во всю плашку — без полос и швов
    bg = im.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(radius=70))
    canvas = Image.new('RGB', (w, h))
    canvas.paste(bg, (0, 0))

    x = w - iw if side == 'right' else 0
    y = (h - ih) // 2
    canvas.paste(photo, (x, y))

    # мягкое затемнение со стороны подписей — чтобы текст читался на светлом кадре
    if shade > 0:
        from PIL import ImageDraw
        veil = Image.new('L', (w, 1))
        px = veil.load()
        for i in range(w):
            t = i / w if side == 'right' else 1 - i / w
            px[i, 0] = int(255 * shade * max(0.0, 1 - t / 0.72) ** 1.5)
        mask = veil.resize((w, h))
        canvas = Image.composite(Image.new('RGB', (w, h), (10, 10, 10)), canvas, mask)

    dst = pathlib.Path(dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst, 'JPEG', quality=quality, optimize=True, progressive=True)
    print(f'{dst.name:<22} {w}×{h}  {dst.stat().st_size // 1024:>4} KB  '
          f'снимок целиком {iw}×{ih}, фон достроен')
    return dst
