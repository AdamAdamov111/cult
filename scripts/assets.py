#!/usr/bin/env python3
"""Отобранные фото партнёров -> public/img/*.jpg (свой хостинг, без хотлинка)."""
import json, pathlib, sys, hashlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from images import download

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'img'

import json

CAND = json.loads((ROOT / 'data' / 'cand_index.json').read_text(encoding='utf-8'))

# slug -> [hash, ...] в том же порядке, что и в контактном листе
LOOKUP = {}
for f in sorted((ROOT / 'data' / 'partners').glob('*.json')):
    d = json.loads(f.read_text(encoding='utf-8'))
    for p in d['pages']:
        for u in ([p['og']] if p.get('og') else []) + p['images']:
            LOOKUP[(d['slug'], hashlib.md5(u.encode()).hexdigest()[:10])] = u

def at(slug, i):
    """Источник по номеру из контактного листа."""
    try:
        return LOOKUP.get((slug, CAND[slug][i]))
    except (KeyError, IndexError):
        return None

PICKS = {
    # обложки разделов
    'sec-cosmetics': ('greymy', 12),
    'sec-sport':     ('firstpadel', 16),
    'sec-travel':    ('travel-times', 3),
    'sec-beauty':    ('omnybeauty', 12),
    'sec-health':    ('jarptica', 21),

    # спорт
    'padel-court':   ('firstpadel', 16),
    'padel-player':  ('firstpadel', 5),
    'padel-hall':    ('firstpadel', 11),
    'padel-kids':    ('firstpadel', 19),
    'padel-woman':   ('firstpadel', 10),
    'wc-pool':       'https://www.worldclass.ru/upload/iblock/a37/swim_pool.jpg',
    'wc-club':       'https://www.worldclass.ru/upload/iblock/018/gc5hoduousb6m3equkuhovuk5ppf4s63/Romanov_1.jpg',
    'wc-spa':        'https://www.worldclass.ru/upload/iblock/ece/12dc6ce1p6p5nlhfqaiz8j5pkob6vhix/spa_1.jpg',
    'wc-relax':      'https://www.worldclass.ru/upload/iblock/17e/relax_zone.jpg',
    'wc-pilates':    'https://www.worldclass.ru/upload/iblock/6e0/pilates.jpg',
    'wc-massage':    'https://www.worldclass.ru/upload/iblock/546/massage.jpg',

    # travel
    'tt-lake':       ('travel-times', 3),
    'tt-aurora':     ('travel-times', 4),
    'tt-glacier':    ('travel-times', 2),
    'tt-safari':     ('travel-times', 1),
    'tt-balloons':   ('travel-times', 0),
    'tt-fjord':      ('travel-times', 5),
    'tt-bay':        ('travel-times', 14),
    'tt-dubai':      ('travel-times', 18),
    'tt-beach':      ('travel-times', 20),
    'tt-palms':      ('travel-times', 22),
    'tt-japan':      ('travel-times', 19),
    'sen-lake':      ('seneshal', 14),
    'sen-night':     ('seneshal', 10),
    'sen-room':      ('seneshal', 22),
    'sen-suite':     ('seneshal', 23),
    'sen-trees':     ('seneshal', 20),
    'sen-lobby':     ('seneshal', 9),
    'bar-room':      ('barvikha', 0),
    'bar-pool':      ('barvikha', 1),
    'bar-exterior':  ('barvikha', 3),

    # красота
    'omny-face':     ('omnybeauty', 12),
    'omny-face2':    ('omnybeauty', 13),
    'omny-proc':     ('omnybeauty', 23),
    'omny-proc2':    ('omnybeauty', 20),
    'omny-device':   ('omnybeauty', 21),
    'omny-team':     ('omnybeauty', 0),

    # здоровье
    'mayr-stones':   ('mayrveda', 15),
    'mayr-bowls':    ('mayrveda', 21),
    'mayr-hotel':    ('mayrveda', 0),
    'mayr-building': ('mayrveda', 4),
    'mayr-massage':  ('mayrveda', 18),
    'jar-parilka':   ('jarptica', 21),
    'jar-sauna':     ('jarptica', 19),
    'jar-tub':       ('jarptica', 8),
    'jar-exterior':  ('jarptica', 0),
    'jar-spa':       ('jarptica', 18),
    'jar-forest':    ('jarptica', 22),

    'medsi-doctor':  ('medsi', 1),
    'medsi-device':  ('medsi', 7),

    # бренды
    'brand-greymy':  ('greymy', 12),
    'brand-oribe':   ('oribe', 3),
    'greymy-model':  ('greymy', 13),
}

BIG = {'sec-cosmetics', 'sec-sport', 'sec-travel', 'sec-beauty', 'sec-health'}

if __name__ == '__main__':
    ok = miss = 0
    for name, src in PICKS.items():
        url = src if isinstance(src, str) else at(*src)
        if not url:
            print(f'  ? нет источника: {name} {src}'); miss += 1; continue
        p = download(url, OUT / f'{name}.jpg', max_px=1200 if name in BIG else 860)
        if p: ok += 1
        else: print(f'  ! не скачалось: {name}'); miss += 1
    print(f'{ok} фото -> public/img  (пропущено {miss})')
