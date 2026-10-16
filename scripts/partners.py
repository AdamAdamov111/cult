#!/usr/bin/env python3
"""Разведка сайтов партнёров: текст, заголовки, изображения -> data/partners/*.json"""
import re, json, html, sys, time, pathlib, urllib.request, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'data' / 'partners'
RAW = ROOT / 'data' / 'raw' / 'partners'
OUT.mkdir(parents=True, exist_ok=True)
RAW.mkdir(parents=True, exist_ok=True)

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

def fetch(url, cache_name, ttl=86400 * 3):
    f = RAW / cache_name
    if f.exists() and time.time() - f.stat().st_mtime < ttl:
        return f.read_text(encoding='utf-8', errors='ignore')
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'ru,en;q=0.8'})
    txt = urllib.request.urlopen(req, timeout=45).read().decode('utf-8', 'ignore')
    f.write_text(txt, encoding='utf-8')
    return txt

def meta(h, *names):
    for n in names:
        m = re.search(r'<meta[^>]+(?:property|name)=["\']%s["\'][^>]+content=["\']([^"\']+)' % re.escape(n), h, re.I)
        if m: return html.unescape(m.group(1)).strip()
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']%s["\']' % re.escape(n), h, re.I)
        if m: return html.unescape(m.group(1)).strip()
    return ''

def images(h, base):
    """Крупные картинки страницы: src, data-src, srcset и фоновые."""
    urls = []
    for pat in (r'<img[^>]+(?:data-src|data-original|src)=["\']([^"\']+)',
                r'srcset=["\']([^"\']+)',
                r'background-image:\s*url\((["\']?)([^"\')]+)'):
        for m in re.finditer(pat, h, re.I):
            raw = m.group(m.lastindex)
            for part in raw.split(','):
                u = part.strip().split(' ')[0]
                if u: urls.append(u)
    out, seen = [], set()
    for u in urls:
        if u.startswith('data:') or not u: continue
        u = urllib.parse.urljoin(base, u)
        if re.search(r'\.(svg|gif|ico)(\?|$)', u, re.I): continue
        if not re.search(r'\.(jpe?g|png|webp|avif)(\?|$)', u, re.I): continue
        if u in seen: continue
        seen.add(u); out.append(u)
    return out

def text_lines(h):
    h = re.sub(r'(?is)<(script|style|noscript|svg|head)[^>]*>.*?</\1>', ' ', h)
    h = re.sub(r'(?is)<br\s*/?>', '\n', h)
    h = re.sub(r'(?is)</(p|div|h[1-6]|li|td|tr|section)>', '\n', h)
    h = re.sub(r'(?is)<[^>]+>', ' ', h)
    h = html.unescape(h)
    lines, out = [l.strip() for l in re.sub(r'[ \t ]+', ' ', h).split('\n')], []
    for l in lines:
        if len(l) > 2 and (not out or out[-1] != l):
            out.append(l)
    return out

def headings(h):
    res = []
    for m in re.finditer(r'(?is)<h([1-3])[^>]*>(.*?)</h\1>', h):
        t = html.unescape(re.sub(r'(?is)<[^>]+>', ' ', m.group(2)))
        t = re.sub(r'\s+', ' ', t).strip()
        if 2 < len(t) < 160: res.append(t)
    seen, out = set(), []
    for t in res:
        if t not in seen: seen.add(t); out.append(t)
    return out

def prices(lines):
    out = []
    for l in lines:
        for m in re.finditer(r'(\d[\d\s ]{2,9})\s*(?:₽|руб|р\.)', l):
            v = int(re.sub(r'\D', '', m.group(1)))
            if 300 <= v <= 3_000_000: out.append((v, l[:120]))
    return out[:40]

def scrape(slug, url, extra=()):
    pages = [(slug, url)] + [(f'{slug}-{i}', u) for i, u in enumerate(extra)]
    data = {'slug': slug, 'url': url, 'pages': []}
    for name, u in pages:
        try:
            h = fetch(u, f'{name}.html')
        except Exception as e:
            print(f'  ! {u}: {e}'); continue
        lines = text_lines(h)
        data['pages'].append({
            'url': u,
            'title': (re.search(r'<title[^>]*>([^<]*)', h) or [None, ''])[1].strip() if '<title' in h else '',
            'desc': meta(h, 'description', 'og:description'),
            'og': meta(h, 'og:image'),
            'headings': headings(h)[:40],
            'images': images(h, u)[:120],
            'prices': prices(lines),
            'lines': lines[:400],
        })
        print(f'  {name}: {len(data["pages"][-1]["images"])} img, {len(data["pages"][-1]["headings"])} h, {len(lines)} lines')
    (OUT / f'{slug}.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    return data

SITES = [
    ('travel-times', 'https://www.travel-times.ru', ['https://www.travel-times.ru/tury']),
    ('mayrveda',     'https://mayrveda.ru', ['https://mayrveda.ru/programmy/', 'https://mayrveda.ru/nomera/']),
    ('firstpadel',   'https://firstpadel.ru', []),
    ('worldclass',   'https://www.worldclass.ru/clubs/romanov/detail/', []),
    ('omnybeauty',   'https://omnybeauty.com', []),
    ('greymy',       'https://greymy.ru', ['https://greymy.ru/catalog/']),
    ('oribe',        'https://authentica.love/catalog/brands/oribe/', []),
    ('jarptica',     'https://jarpticabani.ru', []),
    ('seneshal',     'https://seneshal.com', []),
    ('barvikha',     'https://www.barvikhahotel.com', []),
    ('medsi',        'https://medsi.ru', []),
]

if __name__ == '__main__':
    only = sys.argv[1:] 
    for slug, url, extra in SITES:
        if only and slug not in only: continue
        print(slug)
        scrape(slug, url, extra)
