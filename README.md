# CULT — закрытый клуб BYRAIN

Telegram Mini App: членство 3 000 ₽/мес открывает клубные цены на всю косметику
BYRAIN (−50% от РРЦ) и предложения партнёров в пяти сферах.

## Что внутри

| | |
|---|---|
| Фронт | React 18 + TypeScript + Vite, без UI-фреймворков |
| Состояние | zustand, сохранение в Telegram CloudStorage (с откатом на localStorage) |
| Telegram | initData, тема, BackButton, MainButton, haptics, Telegram Payments |
| Данные | byrain.ru — 27 товаров с составом и применением; GREYMY, ORIBE, KEVIN MURPHY — 81 позиция; 39 предложений 15 партнёров |
| Бэкенд | два варианта одного контракта: `server/` (node:http) и `worker/` (Cloudflare Workers) |
| Живая ссылка | https://adamadamov111.github.io/cult/ |

## Запуск

```bash
npm install
npm run dev          # http://localhost:5190
```

Данные пересобираются из боевых источников:

```bash
python3 scripts/scrape.py     # byrain.ru        -> data/catalog.json
python3 scripts/brands.py     # бренды-партнёры  -> data/brands.json
python3 scripts/partners.py   # разведка сайтов  -> data/partners/*.json
python3 scripts/assets.py     # отобранные фото  -> public/img/*.jpg
```

Сборка: `npm run build` → `dist/`.

## Экраны

```
Главная    карусель партнёрских баннеров · сторис по сегментам · баннеры
           пяти разделов · выкладка косметики · «скоро в клубе»
Каталог    косметика с подразделами, партнёрские предложения, общий поиск
Раздел     КОСМЕТИКА — магазин; СПОРТ / TRAVEL / КРАСОТА / ЗДОРОВЬЕ — предложения
Товар      галерея, клубная цена и РРЦ, состав, применение, показания, эффекты
Предложение промокод + QR члену клуба; заявка по travel; пейволл гостю
Корзина    товары, доставка, контакты и оплата на одном экране
Членство   выгода на текущей корзине, три строки пользы, оплата
Профиль    карта членства, контакты, заказы, купоны, поддержка
```

Гость видит всё приложение и обе цены; покупка по клубной цене и промокоды
партнёров открываются после оплаты членства.

## Подключение бота

1. `@BotFather` → `/newbot` → токен (токен никуда не вставлять в код — только в секреты).
2. `/newapp` → выбрать бота → адрес мини-аппа: `https://adamadamov111.github.io/cult/`
3. `/mybots` → Bot Settings → Menu Button → тот же адрес.
4. Поднять API — любой из двух вариантов.

**Без сервера — Cloudflare Workers** (рекомендуется: бесплатно, HTTPS сразу):

```bash
cd worker
npx wrangler kv namespace create CULT     # id → в wrangler.toml
npx wrangler secret put BOT_TOKEN
npx wrangler deploy                        # выдаст https://cult-api.<...>.workers.dev
```

**Свой сервер — Node:**

```bash
BOT_TOKEN=... PUBLIC_URL=https://adamadamov111.github.io/cult/ node server/index.js
```

5. Привязать вебхук:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<адрес-api>/telegram/webhook"
```

6. Фронту указать адрес API — создать `.env` и перевыложить (`npm run deploy`):

```
VITE_API_URL=https://<адрес-api>
```

Без `VITE_API_URL` приложение работает в демо-режиме: оплата имитируется,
членство активируется локально. Это видно на экранах — плашка «демо».

## Платежи

`@BotFather` → Payments → провайдер (ЮKassa и др.) → `PROVIDER_TOKEN`.
Пока провайдера нет, сервер выставляет счета в Telegram Stars — весь путь
оплаты (счёт → предчек → `successful_payment` → выдача членства) проверяется
без эквайринга.

## Партнёры в приложении

| Сфера | Партнёры | Предложений |
|---|---|---|
| Косметика | BYRAIN, GREYMY, ORIBE, KEVIN MURPHY | 98 товаров |
| Спорт | First Padel Club, World Class Романов | 6 |
| Travel | Travel Times, Seneshal, Barvikha Hotel & Spa | 10 |
| Красота | Omny Beauty, GREYMY | 6 |
| Здоровье | MAYRVEDA, МЕДСИ, Жар-Птица | 8 |

Скидки партнёров — от 15% до 50%, у BYRAIN фиксированные −50% от РРЦ.
Фотографии взяты с сайтов партнёров и лежат в `public/img` (свой хостинг,
без обращений к чужим CDN). Размеры скидок и условия сформированы для
демонстрации — перед запуском согласуются с каждым партнёром.

## Где заменить демо-контент

| Что | Файл |
|---|---|
| Предложения партнёров | `src/data/offers.ts` |
| Баннеры карусели | `src/data/banners.ts` |
| Сторис | `src/data/stories.ts` |
| Разделы и цена членства | `src/data/sections.ts` |
| Товары | пересобрать `scripts/scrape.py` |

Обложки разделов и партнёров рисуются из брендового градиента с монограммой
(`src/components/Cover.tsx`). Как только появятся настоящие фото — положить
ссылку в поле `image`, и обложка заменится снимком без правок вёрстки.
