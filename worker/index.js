/**
 * CULT API на Cloudflare Workers — тот же контракт, что и server/index.js,
 * но без сервера: бесплатный HTTPS, глобальный, состояние в KV.
 *
 * Секреты:  BOT_TOKEN  (обязательно)
 *           PROVIDER_TOKEN  (для рублёвых счетов; без него — Telegram Stars)
 *           PUBLIC_URL      (адрес мини-аппа для кнопки в боте)
 * Привязка: KV namespace с именем CULT
 */

const MEMBERSHIP_PRICE = 3000;
const MONTH_MS = 30 * 24 * 3600 * 1000;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Init-Data',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

/* ----------------------------------------- проверка подписи Telegram initData */
async function verifyInitData(initData, botToken) {
  if (!initData) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const checkString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const enc = new TextEncoder();
  const hmac = async (keyData, msg) => {
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
  };

  const secret = await hmac(enc.encode('WebAppData'), botToken);
  const sign = await hmac(secret, checkString);
  const hex = [...sign].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex !== hash) return null;

  const authDate = Number(params.get('auth_date') || 0) * 1000;
  if (!authDate || Date.now() - authDate > 24 * 3600 * 1000) return null;

  try { return JSON.parse(params.get('user') || 'null'); } catch { return null; }
}

/* ------------------------------------------------------------- Telegram Bot API */
const tg = (env, method, body) =>
  fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json());

function invoiceBody(env, title, description, payload, rub) {
  const base = { title, description, payload };
  return env.PROVIDER_TOKEN
    ? { ...base, provider_token: env.PROVIDER_TOKEN, currency: 'RUB', prices: [{ label: title, amount: rub * 100 }] }
    : { ...base, provider_token: '', currency: 'XTR', prices: [{ label: title, amount: Math.max(1, Math.round(rub / 100)) }] };
}

/* ------------------------------------------------------------------- состояние */
const getMember = async (env, id) => JSON.parse((await env.CULT.get(`member:${id}`)) || 'null');

async function grantMembership(env, id) {
  const cur = await getMember(env, id);
  const base = cur && cur.until > Date.now() ? cur.until : Date.now();
  const m = { until: base + MONTH_MS, autoRenew: true, updated: Date.now() };
  await env.CULT.put(`member:${id}`, JSON.stringify(m));
  return m;
}

/* ---------------------------------------------------------------------- роутер */
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const { pathname } = new URL(request.url);

    if (pathname === '/health') {
      return json({ ok: true, payments: env.PROVIDER_TOKEN ? 'RUB' : 'XTR (Stars)' });
    }

    /* ---- вебхук Telegram: подписи нет, но путь знает только Telegram ---- */
    if (pathname === '/telegram/webhook' && request.method === 'POST') {
      const u = await request.json().catch(() => ({}));

      if (u.pre_checkout_query) {
        await tg(env, 'answerPreCheckoutQuery', { pre_checkout_query_id: u.pre_checkout_query.id, ok: true });
        return json({ ok: true });
      }

      const msg = u.message;
      const sp = msg?.successful_payment;
      if (sp) {
        const [kind, arg] = sp.invoice_payload.split(':');
        if (kind === 'membership') {
          const m = await grantMembership(env, msg.from.id);
          await tg(env, 'sendMessage', {
            chat_id: msg.chat.id,
            text: `Добро пожаловать в CULT.\nЧленство активно до ${new Date(m.until).toLocaleDateString('ru-RU')}.`,
          });
        } else if (kind === 'order') {
          const raw = await env.CULT.get(`order:${arg}`);
          if (raw) {
            const o = JSON.parse(raw);
            o.status = 'paid'; o.paidAt = Date.now();
            await env.CULT.put(`order:${arg}`, JSON.stringify(o));
          }
          await tg(env, 'sendMessage', { chat_id: msg.chat.id, text: `Заказ ${arg} оплачен. Мы свяжемся по доставке.` });
        }
        return json({ ok: true });
      }

      if (msg?.text === '/start') {
        await tg(env, 'sendMessage', {
          chat_id: msg.chat.id,
          text: 'CULT — закрытый клуб BYRAIN.\nВся косметика −50% от РРЦ и предложения партнёров в пяти сферах.',
          reply_markup: env.PUBLIC_URL
            ? { inline_keyboard: [[{ text: 'Открыть клуб', web_app: { url: env.PUBLIC_URL } }]] }
            : undefined,
        });
      }
      return json({ ok: true });
    }

    /* ---- всё остальное требует подписанного initData ---- */
    const user = await verifyInitData(request.headers.get('X-Init-Data'), env.BOT_TOKEN);
    if (!user) return json({ error: 'bad init data' }, 401);

    if (pathname === '/me') {
      const m = await getMember(env, user.id);
      return json({
        member: !!m && m.until > Date.now(),
        until: m?.until ?? null,
        autoRenew: m?.autoRenew ?? false,
        orders: [],
      });
    }

    if (pathname === '/membership/invoice') {
      const r = await tg(env, 'createInvoiceLink', invoiceBody(
        env, 'Членство CULT',
        'Доступ к клубным ценам BYRAIN (−50%) и предложениям партнёров на 30 дней',
        `membership:${user.id}:${Date.now()}`, MEMBERSHIP_PRICE,
      ));
      return r.result ? json({ invoice_link: r.result }) : json({ error: 'invoice failed' }, 502);
    }

    if (pathname === '/order/invoice') {
      const m = await getMember(env, user.id);
      if (!m || m.until < Date.now()) return json({ error: 'membership required' }, 403);

      const body = await request.json().catch(() => ({}));
      const total = Number(body.total) || 0;
      if (total <= 0) return json({ error: 'bad total' }, 400);

      const orderId = 'C' + String(Date.now()).slice(-7);
      await env.CULT.put(`order:${orderId}`, JSON.stringify({
        id: orderId, userId: user.id, lines: body.lines || [], total, status: 'pending', ts: Date.now(),
      }));

      const r = await tg(env, 'createInvoiceLink', invoiceBody(
        env, `Заказ ${orderId}`, 'Косметика BYRAIN по клубной цене', `order:${orderId}`, total,
      ));
      return r.result ? json({ invoice_link: r.result, order_id: orderId }) : json({ error: 'invoice failed' }, 502);
    }

    return json({ error: 'not found' }, 404);
  },
};
