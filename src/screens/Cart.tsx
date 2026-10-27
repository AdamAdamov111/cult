import { useState } from 'react';
import { IcBag, IcCheck, IcCrown, IcTrash } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { Empty, Qty, SectionHead } from '../components/ui';
import { asset } from '../lib/assets';
import { haptic } from '../lib/telegram';
import { DEMO_MODE, payOrder } from '../lib/payments';
import { money, useCart, useShop, type Order } from '../store';
import { useNav } from '../router';
import { FREE_SHIPPING_FROM, SHIPPING_COST, hits } from '../data/catalog';

const DELIVERY = [
  { id: 'courier', title: 'Курьером по Москве', sub: 'на следующий день', price: SHIPPING_COST },
  { id: 'cdek', title: 'СДЭК по России', sub: '2–5 дней, до пункта выдачи', price: 450 },
  { id: 'pickup', title: 'Самовывоз, Москва', sub: 'шоурум, по записи', price: 0 },
] as const;

export function Cart() {
  const cart = useCart();
  const member = useShop((s) => s.isMember());
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.remove);
  const profile = useShop((s) => s.profile);
  const setProfile = useShop((s) => s.setProfile);
  const placeOrder = useShop((s) => s.placeOrder);
  const say = useShop((s) => s.say);
  const { go, setTab } = useNav();

  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const option = DELIVERY.find((d) => d.id === profile.delivery) ?? DELIVERY[0];
  const shipping = option.id === 'pickup' ? 0 : (cart.freeShipping ? 0 : option.price);
  const grand = cart.club + shipping;

  const errs = {
    name: profile.name.trim().length < 2,
    phone: profile.phone.replace(/\D/g, '').length < 10,
    address: option.id !== 'pickup' && profile.address.trim().length < 6,
  };
  const valid = !errs.name && !errs.phone && !errs.address;

  const pay = async () => {
    setTouched(true);
    if (!member) { go({ k: 'join' }); return; }
    if (!valid) { haptic.err(); say('Заполните контакты и адрес'); return; }
    setBusy(true);
    const r = await payOrder({ lines: cart.lines.map((l) => ({ id: l.product.id, qty: l.qty })), total: grand });
    setBusy(false);
    if (r === 'cancelled') return;
    if (r === 'failed') { haptic.err(); say('Оплата не прошла'); return; }
    setDone(placeOrder(shipping));
  };

  /* ---------- Успех ---------- */
  if (done) {
    return (
      <div className="screen pad" style={{ paddingTop: 44 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--gold-wash)',
            display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: 'var(--gold-ink)',
          }}>
            <IcCheck size={30} />
          </div>
          <h1 className="t-h1">Заказ {done.id} оплачен</h1>
          <p className="t-sm muted" style={{ marginTop: 10 }}>
            Подтверждение придёт на почту. Сэкономлено {money(done.saved)}.
          </p>
        </div>

        <div className="list" style={{ marginTop: 24 }}>
          {done.lines.map((l, i) => (
            <div className="lrow" key={i}>
              <span className="lrow__l clamp1 grow">{l.title}</span>
              <span className="lrow__v num">{l.qty} × {money(l.price)}</span>
            </div>
          ))}
          <div className="lrow">
            <span className="lrow__l">Доставка</span>
            <span className="lrow__v num">{done.shipping ? money(done.shipping) : 'бесплатно'}</span>
          </div>
          <div className="lrow">
            <span className="lrow__l">Итого</span>
            <span className="lrow__v num" style={{ color: 'var(--ink)', fontWeight: 700 }}>{money(done.total)}</span>
          </div>
        </div>

        <button className="btn btn--dark btn--block" style={{ marginTop: 20 }}
                onClick={() => { setDone(null); setTab('home'); }}>
          Продолжить покупки
        </button>
        <button className="btn btn--soft btn--block" style={{ marginTop: 10 }}
                onClick={() => { setDone(null); setTab('profile'); go({ k: 'orders' }); }}>
          Мои заказы
        </button>
        <div style={{ height: 36 }} />
      </div>
    );
  }

  /* ---------- Пустая ---------- */
  if (!cart.lines.length) {
    return (
      <div className="screen">
        <Empty icon={<IcBag size={46} />} title="Корзина пуста"
               text="Клубные цены на весь ассортимент: BYRAIN −50%, GREYMY −35%."
               action={<button className="btn btn--dark" onClick={() => setTab('catalog')}>Открыть каталог</button>} />
        <section className="sec">
          <SectionHead title="Бестселлеры" />
          <div className="rail">
            {hits.map((p) => <div key={p.id} style={{ width: 160 }}><ProductCard p={p} /></div>)}
          </div>
        </section>
        <div style={{ height: 36 }} />
      </div>
    );
  }

  /* ---------- Корзина и оформление ---------- */
  return (
    <div className="screen pad" style={{ paddingTop: 14 }}>
      <h1 className="t-h1">Корзина</h1>

      <div style={{ marginTop: 8 }}>
        {cart.lines.map(({ product: p, qty }) => (
          <div className="line" key={p.id}>
            <div className="line__media" onClick={() => go({ k: 'product', id: p.id })}>
              <img className="line__img" src={asset(p.images[0])} alt="" loading="lazy" />
            </div>
            <div className="grow">
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div className="grow" onClick={() => go({ k: 'product', id: p.id })}>
                  <div className="card__brand">{p.brand}</div>
                  <div className="line__title clamp2" style={{ marginTop: 3 }}>{p.title}</div>
                </div>
                <button className="line__del" onClick={() => remove(p.id)} aria-label="Удалить">
                  <IcTrash size={16} />
                </button>
              </div>
              <div className="price price--sm" style={{ marginTop: 7 }}>
                <span className="price__now">{money(p.club)}</span>
                <span className="price__was">{money(p.rrp)}</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <Qty value={qty} onChange={(v) => setQty(p.id, v)} min={0} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Бесплатная доставка */}
      <div className="ship" style={{ marginTop: 18 }}>
        {cart.freeShipping ? (
          <div className="t-sm" style={{ color: 'var(--ok)' }}>Доставка по Москве бесплатно</div>
        ) : (
          <>
            <div className="t-sm">
              До бесплатной доставки — <b>{money(cart.toFreeShipping)}</b>
            </div>
            <div className="ship__bar">
              <div className="ship__fill" style={{ width: `${(cart.club / FREE_SHIPPING_FROM) * 100}%` }} />
            </div>
          </>
        )}
      </div>

      {/* Выгода */}
      <div className="save" style={{ marginTop: 12 }}>
        <IcCrown size={19} className="gold" />
        <div className="grow">
          <div className="t-micro gold">{member ? 'Экономия на этом заказе' : 'Сэкономите, вступив в клуб'}</div>
          <div className="save__v">{money(cart.saved)}</div>
        </div>
      </div>

      {!member && (
        <button className="btn btn--gold btn--block" style={{ marginTop: 12 }} onClick={() => go({ k: 'join' })}>
          Вступить за 3 000 ₽ и сэкономить {money(cart.saved)}
        </button>
      )}

      {/* Доставка */}
      <div className="t-label" style={{ marginTop: 28 }}>Доставка</div>
      <div className="col" style={{ gap: 8, marginTop: 10 }}>
        {DELIVERY.map((d) => {
          const free = d.id !== 'pickup' && cart.freeShipping;
          return (
            <button key={d.id} className={`radio${option.id === d.id ? ' radio--on' : ''}`}
                    onClick={() => { haptic.select(); setProfile({ delivery: d.id }); }}>
              <span className="radio__m" />
              <span>
                <span className="radio__t">{d.title}</span>
                <span className="radio__s">{d.sub}</span>
              </span>
              <span className="radio__p">
                {d.price === 0 || free ? 'бесплатно' : money(d.price)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Получатель */}
      <div className="t-label" style={{ marginTop: 28 }}>Получатель</div>
      <div className="col" style={{ gap: 12, marginTop: 10 }}>
        <Field label="Имя и фамилия" value={profile.name} bad={touched && errs.name}
               onChange={(v) => setProfile({ name: v })} placeholder="Как в документах" />
        <Field label="Телефон" value={profile.phone} bad={touched && errs.phone} type="tel"
               onChange={(v) => setProfile({ phone: v })} placeholder="+7 900 000-00-00" />
        <Field label="E-mail" value={profile.email} type="email"
               onChange={(v) => setProfile({ email: v })} placeholder="для чека" />
        {option.id !== 'pickup' && (
          <Field label="Адрес доставки" value={profile.address} bad={touched && errs.address} area
                 onChange={(v) => setProfile({ address: v })} placeholder="Город, улица, дом, квартира" />
        )}
      </div>

      {/* Итоги */}
      <div style={{ marginTop: 26 }}>
        <div className="hr" style={{ marginBottom: 6 }} />
        <div className="sum"><span className="muted">Товары по РРЦ</span>
          <span className="sum__v" style={{ textDecoration: 'line-through', color: 'var(--faint)' }}>{money(cart.rrp)}</span></div>
        <div className="sum"><span className="muted">Клубная цена</span><span className="sum__v">{money(cart.club)}</span></div>
        <div className="sum"><span className="gold">Выгода клуба</span>
          <span className="sum__v gold">−{money(cart.saved)}</span></div>
        <div className="sum"><span className="muted">Доставка</span>
          <span className="sum__v">{shipping ? money(shipping) : 'бесплатно'}</span></div>
        <div className="hr" style={{ marginTop: 8 }} />
        <div className="sum sum--total"><span>К оплате</span><span className="sum__v">{money(grand)}</span></div>
      </div>

      <button className="btn btn--dark btn--block" style={{ marginTop: 16 }} onClick={pay} disabled={busy}>
        {busy ? 'Оплата…' : member ? `Оплатить ${money(grand)}` : 'Вступить и оплатить'}
      </button>

      {DEMO_MODE && (
        <div className="note" style={{ marginTop: 12 }}>
          Демо: оплата имитируется. В боевом контуре — карта или СБП через платёжного провайдера.
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text', bad, area,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; bad?: boolean; area?: boolean;
}) {
  return (
    <label className="field">
      <span className="field__l">{label}</span>
      {area ? (
        <textarea className={`input${bad ? ' input--bad' : ''}`} rows={2} value={value}
                  onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={`input${bad ? ' input--bad' : ''}`} type={type} value={value}
               onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}
