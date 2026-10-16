#!/usr/bin/env python3
"""Скрепер каталога byrain.ru -> data/catalog.json (цены, фото, описания, состав, применение)."""
import re, json, html, os, time, urllib.request, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW  = ROOT / "data" / "raw"
RAW.mkdir(parents=True, exist_ok=True)
STOREPART = "637784936302"
API = ("https://store.tildaapi.com/api/getproductslist/?storepartuid=%s&recid=2098360901"
       "&c=%d&getparts=true&getoptions=true&slice=1&size=200")

def fetch(url, cache=None, ttl=86400*7):
    if cache:
        f = RAW / cache
        if f.exists() and time.time() - f.stat().st_mtime < ttl:
            return f.read_text(encoding="utf-8", errors="ignore")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh)"} )
    txt = urllib.request.urlopen(req, timeout=40).read().decode("utf-8", "ignore")
    if cache:
        (RAW / cache).write_text(txt, encoding="utf-8")
    return txt

def flatten(h):
    h = re.sub(r'(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>', ' ', h)
    h = re.sub(r'(?is)<br\s*/?>', '\n', h)
    h = re.sub(r'(?is)</(p|div|h[1-6]|li|td|tr)>', '\n', h)
    h = re.sub(r'(?is)<[^>]+>', ' ', h)
    h = html.unescape(h)
    lines = [re.sub(r'[ \t ]+', ' ', l).strip() for l in h.split('\n')]
    out = []
    for l in lines:
        if len(l) > 2 and (not out or out[-1] != l):
            out.append(l)
    return out

# служебные строки шапки/подвала/корзины Tilda — выбрасываем
JUNK = re.compile(r'(?i)^(каталог|коллекции|по проблеме|блог|клуб byrain|о компании|научный подход|'
                  r'глобальное расширение|партн[её]рам|контакты|войти|связаться|корзина|главная|'
                  r'перейти к оформлению|продолжить покупки|добавить в корзину|buy now|load more|'
                  r'подробнее.*|посмотреть весь каталог|соглашаюсь|активировать|коллекция|'
                  r'фио\*|email\*|телефон\*|адрес доставки\*|доставка.*|согласен на обработку.*|'
                  r'запомнить контакты.*|все продукты|о нас|для клиентов|статьи о долголетии|'
                  r'политика обработки.*|согласие на обработку.*|сайт использует cookie.*|'
                  r'инновационная косметика.*|команда byrain.*|рекомендуемый уход|с этим товаром покупают|'
                  r'параметры исследования|результаты клинических исследований|byrain дом|'
                  r'ампульные концентраты|абсолютная молодость|трансформация №1|экзосомное омоложение.*|'
                  r'обновление & сияние.*|сияние &.*)$')

SECTIONS = ["Подробнее о товаре", "Состав", "Эффекты", "Показания", "Способ применения",
            "Ключевые ингридиенты", "Ключевые ингредиенты", "Рекомендуемый уход"]

def sections(lines):
    """Разбить плоский текст страницы на секции по заголовкам."""
    start = next((i for i, l in enumerate(lines) if l == "Подробнее о товаре"), None)
    if start is None:
        return {}
    body = lines[start:]
    res, cur = {}, None
    for l in body:
        if l in SECTIONS:
            cur = l
            res.setdefault(cur, [])
            continue
        if cur and not JUNK.match(l):
            res[cur].append(l)
    return res

def tagline(lines, title):
    """Короткий подзаголовок под названием товара на странице."""
    for i, l in enumerate(lines):
        if l.strip().lower() == title.strip().lower():
            for c in lines[i+1:i+4]:
                if not JUNK.match(c) and not re.match(r'^[\d\s]+₽', c) and not re.match(r'^\d+ мл$', c) and 15 < len(c) < 220:
                    return c
    return ""

def main():
    api = json.loads(fetch(API % (STOREPART, int(time.time())), "products.json", ttl=3600))
    parts = {p["uid"]: html.unescape(p["title"]) for p in api.get("parts", [])}
    out = []
    for p in api["products"]:
        slug = p["url"].rsplit("/", 1)[-1]
        try:
            gal = [g["img"] for g in json.loads(p.get("gallery") or "[]")]
        except Exception:
            gal = []
        try:
            page = fetch(p["url"], f"page_{slug}.html")
            lines = flatten(page)
            sec = sections(lines)
            tl = tagline(lines, p["title"])
        except Exception as e:
            print("  ! page fail", slug, e); sec, tl, lines = {}, "", []
        try:
            puids = json.loads(p.get("partuids") or "[]")
        except Exception:
            puids = []
        price = int(float(p["price"])) if p.get("price") else 0
        out.append({
            "id": str(p["uid"]),
            "slug": slug,
            "title": html.unescape(p["title"]).strip(),
            "tagline": tl,
            "rrp": price,
            "club": int(round(price * 0.5)) if price else 0,
            "volume": (f'{p["portion"]:g} мл' if p.get("portion") and p.get("unit") == "MLT" else ""),
            "short": html.unescape(p.get("descr") or "").strip(),
            "images": gal,
            "collections": [parts[u] for u in puids if u in parts],
            "desc": "\n".join(sec.get("Подробнее о товаре", []))[:4000],
            "inci": " ".join(sec.get("Состав", []))[:3000],
            "effects": sec.get("Эффекты", [])[:8],
            "indications": sec.get("Показания", [])[:8],
            "usage": "\n".join(sec.get("Способ применения", []))[:1200],
            "url": p["url"],
        })
        print(f'{price or "—":>7} ₽  {slug:<45} desc:{len(out[-1]["desc"]):>4} inci:{len(out[-1]["inci"]):>4} eff:{len(out[-1]["effects"])} use:{len(out[-1]["usage"]):>4}')
    data = {"scraped": time.strftime("%Y-%m-%d"), "source": "byrain.ru",
            "collections": sorted(set(parts.values())), "products": out}
    (ROOT / "data" / "catalog.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n{len(out)} товаров -> data/catalog.json")

main()
