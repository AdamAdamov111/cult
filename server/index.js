/**
 * CULT — минимальный бэкенд мини-аппа. Без зависимостей: node:http + fetch.
 *
 *   BOT_TOKEN       токен бота из @BotFather                     (обязательно)
 *   PROVIDER_TOKEN  токен платёжного провайдера (ЮKassa и т.п.)  — для рублёвых счетов
 *   PUBLIC_URL      адрес, где опубликован фронт                 — для кнопки меню
 *   PORT            порт, по умолчанию 8787
 *
 * Без PROVIDER_TOKEN счета выставляются в Telegram Stars (XTR) — так можно
 * проверить весь путь оплаты до подключения эквайринга.
 */
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const PROVIDER_TOKEN = process.env.PROVIDER_TOKEN || '';
const PUBLIC_URL = process.env.PUBLIC_URL || '';
const PORT = Number(process.env.PORT || 8787);
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const MEMBERSHIP_PRICE = 3000;         // ₽ в месяц
const MONTH_MS = 30 * 24 * 3600 * 1000;

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN не задан — запустите: BOT_TOKEN=... node server/index.js');
  process.exit(1);
}

/* ------------------------------------------------------------------ хранилище */
const DB_FILE = path.join(process.cwd(), 'server', 'db.json');
const db = fs.existsSync(DB_FILE)
  ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
  : { members: {}, orders: [] };
const save = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 1));

/* ------------------------------------------- проверка подписи Telegram initData */
function verifyInitData(initData) {
  if (!initData) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const checkString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const sign = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
  if (sign !== hash) return null;

  // подпись живёт сутки — дальше считаем данные протухшими
  const authDate = Number(params.get('auth_date') || 0) * 1000;
  if (!authDate || Date.now() - authDate > 24 * 3600 * 1000) return null;

  try { return JSON.parse(params.get('user') || 'null'); } catch { return null; }
}

/* ------------------------------------------------------------- Telegram Bot API */
async function tg(method, body) {
  const r = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!j.ok) console.error(`[tg] ${method}:`, j.description);
  return j;
}

/** Счёт в рублях через провайдера, иначе — в Stars. */
function invoicePayload(title, description, payload, rub) {
  const stars = Math.max(1, Math.round(rub / 100));   // грубый пересчёт для теста
  return PROVIDER_TOKEN
    ? { title, description, payload, provider_token: PROVIDER_TOKEN, currency: 'RUB',
        prices: [{ label: title, amount: rub * 100 }] }
    : { title, description, payload, provider_token: '', currency: 'XTR',
        prices: [{ label: title, amount: stars }] };
}

/* ------------------------------------------------------------------- состояние */
const isMember = (id) => (db.members[id]?.until || 0) > Date.now();

function grantMembership(userId) {
  const cur = db.members[userId];
  const base = cur && cur.until > Date.now() ? cur.until : Date.now();
  db.members[userId] = { until: base + MONTH_MS, autoRenew: true, updated: Date.now() };
  save();
  return db.members[userId];
}

/* ---------------------------------------------------------------- HTTP-маршруты */
const json = (res, code, obj) => {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Init-Data',
  });
  res.end(JSON.stringify(obj));
};

const readBody = (req) => new Promise((resolve) => {
  let b = '';
  req.on('data', (c) => { b += c; if (b.length > 1e6) req.destroy(); });
  req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch { resolve({}); } });
});

const routes = {
  /* Счёт на членство */
  'POST /membership/invoice': async (req, res, user) => {
    if (!user) return json(res, 401, { error: 'bad init data' });
    const { result } = await tg('createInvoiceLink', invoicePayload(
      'Членство CULT',
      'Доступ к клубным ценам BYRAIN (−50%) и предложениям партнёров на 30 дней',
      `membership:${user.id}:${Date.now()}`,
      MEMBERSHIP_PRICE,
    ));
    return result ? json(res, 200, { invoice_link: result }) : json(res, 502, { error: 'invoice failed' });
  },

  /* Счёт на заказ */
  'POST /order/invoice': async (req, res, user, body) => {
    if (!user) return json(res, 401, { error: 'bad init data' });
    if (!isMember(user.id)) return json(res, 403, { error: 'membership required' });
    const total = Number(body.total) || 0;
    if (total <= 0) return json(res, 400, { error: 'bad total' });

    const orderId = 'C' + String(Date.now()).slice(-7);
    db.orders.push({ id: orderId, userId: user.id, lines: body.lines || [], total, status: 'pending', ts: Date.now() });
    save();

    const { result } = await tg('createInvoiceLink', invoicePayload(
      `Заказ ${orderId}`,
      'Косметика BYRAIN по клубной цене',
      `order:${orderId}`,
      total,
    ));
    return result ? json(res, 200, { invoice_link: result, order_id: orderId }) : json(res, 502, { error: 'invoice failed' });
  },

  /* Состояние пользователя — источник правды для фронта */
  'POST /me': async (req, res, user) => {
    if (!user) return json(res, 401, { error: 'bad init data' });
    const m = db.members[user.id];
    return json(res, 200, {
      member: isMember(user.id),
      until: m?.until ?? null,
      autoRenew: m?.autoRenew ?? false,
      orders: db.orders.filter((o) => o.userId === user.id && o.status === 'paid'),
    });
  },

  /* Вебхук Telegram */
  'POST /telegram/webhook': async (req, res, _u, update) => {
    // предчек обязателен: без ответа за 10 секунд платёж отменяется
    if (update.pre_checkout_query) {
      await tg('answerPreCheckoutQuery', { pre_checkout_query_id: update.pre_checkout_query.id, ok: true });
      return json(res, 200, { ok: true });
    }

    const msg = update.message;
    const sp = msg?.successful_payment;
    if (sp) {
      const [kind, arg] = sp.invoice_payload.split(':');
      if (kind === 'membership') {
        const m = grantMembership(msg.from.id);
        await tg('sendMessage', {
          chat_id: msg.chat.id,
          text: `Добро пожаловать в CULT.\nЧленство активно до ${new Date(m.until).toLocaleDateString('ru-RU')}.\nКлубные цены уже открыты.`,
        });
      } else if (kind === 'order') {
        const o = db.orders.find((x) => x.id === arg);
        if (o) { o.status = 'paid'; o.paidAt = Date.now(); save(); }
        await tg('sendMessage', { chat_id: msg.chat.id, text: `Заказ ${arg} оплачен. Мы свяжемся по доставке.` });
      }
      return json(res, 200, { ok: true });
    }

    if (msg?.text === '/start') {
      await tg('sendMessage', {
        chat_id: msg.chat.id,
        text: 'CULT — закрытый клуб BYRAIN.\nВся косметика −50% от РРЦ и предложения партнёров в пяти сферах.',
        reply_markup: PUBLIC_URL
          ? { inline_keyboard: [[{ text: 'Открыть клуб', web_app: { url: PUBLIC_URL } }]] }
          : undefined,
      });
    }
    return json(res, 200, { ok: true });
  },

  'GET /health': async (req, res) => json(res, 200, {
    ok: true, members: Object.keys(db.members).length, orders: db.orders.length,
    payments: PROVIDER_TOKEN ? 'RUB' : 'XTR (Stars)',
  }),
};

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const key = `${req.method} ${new URL(req.url, 'http://x').pathname}`;
  const handler = routes[key];
  if (!handler) return json(res, 404, { error: 'not found' });

  const body = req.method === 'POST' ? await readBody(req) : {};
  const user = key.startsWith('POST /telegram') ? null : verifyInitData(req.headers['x-init-data']);
  try { await handler(req, res, user, body); }
  catch (e) { console.error(e); json(res, 500, { error: 'internal' }); }
}).listen(PORT, () => {
  console.log(`CULT API на :${PORT} · платежи: ${PROVIDER_TOKEN ? 'RUB' : 'Stars (XTR)'}`);
  if (PUBLIC_URL) console.log(`Мини-апп: ${PUBLIC_URL}`);
});
