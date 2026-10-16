import { useEffect, useState } from 'react';
import { Empty, Qty, money } from '../components/Primitives';
import { ProductCard } from '../components/Cards';
import { IcBag, IcCheck, IcCrown, IcSpark, IcTrash, IcTruck } from '../components/Icons';
import { PRODUCT_MAP, ON_SALE } from '../data/products';
import { useApp, useCartTotals } from '../store';
import { useNav } from '../router';
import { haptic, setMainButton } from '../lib/telegram';
import { DEMO_MODE, payOrder } from '../lib/payments';
import type { Order } from '../types';

const DELIVERY = [
  { id: 'courier', title: 'Курьером по Москве', sub: 'на следующий день', price: 400 },
  { id: 'cdek', title: 'СДЭК по России', sub: '2–5 дней, до пункта выдачи', price: 450 },
  { id: 'pickup', title: 'Самовывоз, Москва', sub: 'шоурум, по записи', price: 0 },
] as const;

export function Cart() {
  const cart = useApp((s) => s.cart);
  const totals = useCartTotals();
  const member = useApp((s) => s.isMember());
  const setQty = useApp((s) => s.setQty);
  const removeLine = useApp((s) => s.removeLine);
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const placeOrder = useApp((s) => s.placeOrder);
  const say = useApp((s) => s.say);
  const { go, setTab } = useNav();

  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const ship = DELIVERY.find((d) => d.id === profile.delivery)!;
  const grand = totals.club + ship.price;

  const errs = {
    name: profile.name.trim().length < 2,
    phone: profile.phone.replace(/\D/g, '').length < 10,
    address: profile.delivery !== 'pickup' && profile.address.trim().length < 6,
  };
  const valid = !errs.name && !errs.phone && !errs.address;

  const pay = async () => {
    setTouched(true);
    if (!member) { go({ k: 'join' }); return; }
    if (!valid) { haptic.err(); say('Заполните контакты и адрес'); return; }
    setBusy(true);
    haptic.press();
    const r = await payOrder({ lines: cart.map((l) => ({ id: l.id, qty: l.qty })), total: grand });
    setBusy(false);
    if (r === 'cancelled') return;
    if (r === 'failed') { say('Оплата не прошла'); return; }
    setDone(placeOrder(ship.price));
  };

  useEffect(() => {
    if (!cart.length || done) { setMainButton(null); return; }
    setMainButton(
      member
        ? { text: `ОПЛАТИТЬ ${money(grand)}`, onClick: pay, active: !busy }
        : { text: 'ВСТУПИТЬ И КУПИТЬ ПО КЛУБНОЙ ЦЕНЕ', onClick: () => go({ k: 'join' }) },
    );
    return () => setMainButton(null);
  }, [cart.length, member, grand, busy, done, valid]);

  /* ----- Успех ----- */
  if (done) {
    return (
      <div className="screen">
        <div className="pad" style={{ paddingTop: 36, textAlign: 'center' }}>
          <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'var(--gold-wash)', display: 'grid', placeItems: 'center', margin: '0 auto 18px', color: 'var(--gold-ink)' }}>
            <IcCheck size={30} />
          </div>
          <h1 className="h1">Заказ {done.id} оплачен</h1>
          <p className="small muted" style={{ marginTop: 9 }}>
            Подтверждение придёт в этот чат. Сэкономлено {money(done.saved)}.
          </p>
        </div>
        <div className="pad block--tight">
          <div className="plist">
            {done.lines.map((l, i) => (
              <div className="prow" key={i}>
                <span className="prow__l clamp1" style={{ flex: 1 }}>{l.title}</span>
                <span className="prow__v num">{l.qty} × {money(l.price)}</span>
              </div>
            ))}
            <div className="prow"><span className="prow__l">Доставка</span><span className="prow__v num">{done.shipping ? money(done.shipping) : 'бесплатно'}</span></div>
            <div className="prow"><span className="prow__l">Итого</span><span className="prow__v num" style={{ color: 'var(--ink)', fontWeight: 700 }}>{money(done.total)}</span></div>
          </div>
          <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: 16 }} onClick={() => { setDone(null); setTab('home'); }}>
            Продолжить покупки
          </button>
          <button className="btn btn--ghost btn--block" style={{ marginTop: 9 }} onClick={() => { setDone(null); setTab('profile'); go({ k: 'orders' }); }}>
            Мои заказы
          </button>
        </div>
      </div>
    );
  }

  /* ----- Пустая ----- */
  if (!cart.length) {
    return (
      <div className="screen">
        <Empty icon={<IcBag size={56} />} title="Корзина пуста"
               text="Клубные цены на всю косметику BYRAIN — минус 50% от цены с полки."
               action={<button className="btn btn--primary" onClick={() => setTab('catalog')}>Открыть каталог</button>} />
        <div className="block">
          <div className="block-head"><h2 className="h2">Хиты клуба</h2></div>
          <div className="hscroll">
            {ON_SALE.slice(0, 6).map((p) => <div key={p.id} style={{ width: 150 }}><ProductCard p={p} /></div>)}
          </div>
        </div>
      </div>
    );
  }

  /* ----- Корзина + оформление на одном экране ----- */
  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 14 }}>
        <h1 className="h1">Корзина</h1>

        <div style={{ marginTop: 6 }}>
          {cart.map((l) => {
            const p = PRODUCT_MAP.get(l.id);
            if (!p) return null;
            return (
              <div className="citem" key={l.id}>
                <div className="citem__media" onClick={() => go({ k: 'product', id: p.id })}>
                  {p.images[0] && <img className="citem__img" src={p.images[0]} alt="" loading="lazy" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ alignItems: 'flex-start' }}>
                    <div className="citem__title clamp2" style={{ flex: 1 }} onClick={() => go({ k: 'product', id: p.id })}>{p.title}</div>
                    <button className="citem__del" onClick={() => removeLine(l.id)} aria-label="Удалить"><IcTrash size={16} /></button>
                  </div>
                  <div className="price price--sm" style={{ marginTop: 5 }}>
                    <span className="price__club">{money(p.club)}</span>
                    <span className="price__rrp">{money(p.rrp)}</span>
                  </div>
                  <div style={{ marginTop: 9 }}><Qty value={l.qty} onChange={(v) => setQty(l.id, v)} min={0} /></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Экономия */}
        <div className="saved-strip" style={{ marginTop: 16 }}>
          <IcSpark size={20} className="gold" />
          <div style={{ lineHeight: 1.3, flex: 1 }}>
            <div className="micro" style={{ color: 'var(--gold-ink)' }}>
              {member ? 'Экономия на этом заказе' : 'Сэкономите, вступив в клуб'}
            </div>
            <div className="saved-strip__v">{money(totals.saved)}</div>
          </div>
        </div>

        {!member && (
          <button className="btn btn--gold btn--block btn--lg" style={{ marginTop: 11 }} onClick={() => go({ k: 'join' })}>
            <IcCrown size={18} />Вступить за 3 000 ₽ и сэкономить {money(totals.saved)}
          </button>
        )}

        {/* Доставка */}
        <div className="block--tight">
          <div className="eyebrow" style={{ marginBottom: 9 }}>Доставка</div>
          <div className="radio-list">
            {DELIVERY.map((d) => (
              <button key={d.id} className={`radio${profile.delivery === d.id ? ' radio--on' : ''}`}
                      onClick={() => { haptic.select(); setProfile({ delivery: d.id }); }}>
                <span className="radio__mark" />
                <span>
                  <span className="radio__title">{d.title}</span>
                  <span className="radio__sub">{d.sub}</span>
                </span>
                <span className="radio__price">{d.price ? money(d.price) : 'бесплатно'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Контакты */}
        <div className="block--tight col" style={{ gap: 11 }}>
          <div className="eyebrow">Получатель</div>
          <label className="field"><span className="field__label">Имя и фамилия</span>
            <input className={`input${touched && errs.name ? ' input--err' : ''}`} value={profile.name}
                   onChange={(e) => setProfile({ name: e.target.value })} placeholder="Как в документах" /></label>
          <label className="field"><span className="field__label">Телефон</span>
            <input className={`input${touched && errs.phone ? ' input--err' : ''}`} type="tel" value={profile.phone}
                   onChange={(e) => setProfile({ phone: e.target.value })} placeholder="+7 900 000-00-00" /></label>
          <label className="field"><span className="field__label">E-mail</span>
            <input className="input" type="email" value={profile.email}
                   onChange={(e) => setProfile({ email: e.target.value })} placeholder="для чека" /></label>
          {profile.delivery !== 'pickup' && (
            <label className="field"><span className="field__label">Адрес доставки</span>
              <textarea className={`input${touched && errs.address ? ' input--err' : ''}`} rows={2} value={profile.address}
                        onChange={(e) => setProfile({ address: e.target.value })} placeholder="Город, улица, дом, квартира" /></label>
          )}
          <div className="row" style={{ gap: 8, color: 'var(--muted)' }}>
            <IcTruck size={16} /><span className="caption">Данные сохраняются в профиле и подставятся в следующий заказ</span>
          </div>
        </div>

        {/* Итоги */}
        <div className="block--tight">
          <div className="hr" style={{ marginBottom: 6 }} />
          <div className="sumrow"><span className="muted">Товары по РРЦ</span><span className="sumrow__v" style={{ textDecoration: 'line-through', color: 'var(--faint)' }}>{money(totals.rrp)}</span></div>
          <div className="sumrow"><span className="muted">Клубная цена</span><span className="sumrow__v">{money(totals.club)}</span></div>
          <div className="sumrow sumrow--save"><span>Выгода клуба</span><span className="sumrow__v">−{money(totals.saved)}</span></div>
          <div className="sumrow"><span className="muted">Доставка</span><span className="sumrow__v">{ship.price ? money(ship.price) : 'бесплатно'}</span></div>
          <div className="hr" style={{ marginTop: 8 }} />
          <div className="sumrow sumrow--total"><span>К оплате</span><span className="sumrow__v">{money(grand)}</span></div>
        </div>

        <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: 14 }} onClick={pay} disabled={busy}>
          {busy ? 'Оплата…' : member ? `Оплатить ${money(grand)}` : 'Вступить и оплатить'}
        </button>

        {DEMO_MODE && (
          <div className="note" style={{ marginTop: 12 }}>
            <span className="demo-tag">демо</span>{' '}
            Оплата имитируется. В боевом контуре — Telegram Payments и вебхук в CRM.
          </div>
        )}
      </div>
      <div style={{ height: 30 }} />
    </div>
  );
}
