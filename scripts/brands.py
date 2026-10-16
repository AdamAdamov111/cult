#!/usr/bin/env python3
"""Каталоги брендов-партнёров (GREYMY, ORIBE, KEVIN MURPHY) -> data/brands.json"""
import re, json, html, time, pathlib, urllib.request, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / 'data' / 'raw' / 'partners'
RAW.mkdir(parents=True, exist_ok=True)
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

def fetch(url, name, ttl=86400 * 3):
    f = RAW / name
    if f.exists() and time.time() - f.stat().st_mtime < ttl:
        return f.read_text(encoding='utf-8', errors='ignore')
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'ru,en;q=0.8'})
    t = urllib.request.urlopen(req, timeout=45).read().decode('utf-8', 'ignore')
    f.write_text(t, encoding='utf-8')
    return t

clean = lambda s: re.sub(r'\s+', ' ', html.unescape(s or '')).strip()

def pick_img(block, base):
    """Крупное фото товара: webp/jpg из picture или src, минуя иконки."""
    for m in re.finditer(r'(?:srcset|data-src|src)=["\']([^"\']+\.(?:jpe?g|png|webp))', block, re.I):
        u = m.group(1).split(' ')[0]
        if re.search(r'(icon|logo|sprite|placeholder|/56_56_|/\d{2}_\d{2}_)', u, re.I):
            continue
        return urllib.parse.urljoin(base, u)
    return ''

def parse_greymy(url):
    h = fetch(url, 'greymy-cat.html')
    out = []
    for blk in h.split('catalog-block__wrapper')[1:]:
        blk = blk[:12000]
        price = re.search(r'itemprop="price" content="(\d+)"', blk)
        link = re.search(r'href="(/product/[^"]+)"', blk)
        en = re.search(r'<span >\s*([^<]{3,80})</span>', blk)
        ru = re.search(r'class="nameSecond">([^<]{3,90})</span>', blk)
        if not (price and link and (en or ru)):
            continue
        out.append({
            'title': clean(en.group(1) if en else ''),
            'subtitle': clean(ru.group(1) if ru else ''),
            'rrp': int(price.group(1)),
            'image': pick_img(blk, url),
            'url': urllib.parse.urljoin(url, link.group(1)),
        })
    return out

def parse_authentica(url, name):
    h = fetch(url, name)
    out = []
    for blk in h.split('products-list__item')[1:]:
        blk = blk[:14000]
        title = re.search(r'<img[^>]+alt="([^"]{3,140})"', blk)
        link = re.search(r'href="(/catalog/[^"]+)"', blk)
        price = re.search(r'(\d[\d\s ]{2,8})\s*(?:₽|&#8381;|руб)', blk)
        if not (title and link and price):
            continue
        out.append({
            'title': clean(title.group(1)),
            'subtitle': '',
            'rrp': int(re.sub(r'\D', '', price.group(1))),
            'image': pick_img(blk, url),
            'url': urllib.parse.urljoin(url, link.group(1)),
        })
    return out

BRANDS = [
    {'id': 'greymy', 'title': 'GREYMY', 'country': 'Швейцария',
     'about': 'Профессиональный уход за волосами: маски, шампуни, несмываемые средства и стайлинг.',
     'discount': 0.35, 'site': 'https://greymy.ru',
     'items': lambda: parse_greymy('https://greymy.ru/dlya-volos/')},
    {'id': 'oribe', 'title': 'ORIBE', 'country': 'США',
     'about': 'Культовый салонный бренд: уход и стайлинг премиального класса.',
     'discount': 0.30, 'site': 'https://authentica.love/catalog/brands/oribe/',
     'items': lambda: parse_authentica('https://authentica.love/catalog/brands/oribe/', 'oribe.html')},
    {'id': 'kevinmurphy', 'title': 'KEVIN MURPHY', 'country': 'Австралия',
     'about': 'Уход за волосами на натуральных активах, вес формулы — как у средств для кожи.',
     'discount': 0.30, 'site': 'https://authentica.love/catalog/brands/kevin_murphy/',
     'items': lambda: parse_authentica('https://authentica.love/catalog/brands/kevin_murphy/', 'kevinmurphy.html')},
]

if __name__ == '__main__':
    data = []
    for b in BRANDS:
        items = b['items']()
        # отбрасываем дубли и позиции без фото
        seen, clean_items = set(), []
        for it in items:
            key = it['title'].lower()
            if key in seen or not it['image'] or not it['rrp']:
                continue
            seen.add(key)
            it['club'] = int(round(it['rrp'] * (1 - b['discount']) / 10) * 10)
            clean_items.append(it)
        print(f"{b['title']:<14} {len(clean_items):>3} товаров, "
              f"цены {min((i['rrp'] for i in clean_items), default=0)}–{max((i['rrp'] for i in clean_items), default=0)} ₽")
        data.append({k: v for k, v in b.items() if k != 'items'} | {'products': clean_items})
    (ROOT / 'data' / 'brands.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    print('-> data/brands.json')
