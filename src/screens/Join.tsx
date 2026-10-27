import { useState } from 'react';
import { IcCheck, IcCrown, IcSpark, IcTruck } from '../components/Icons';
import { DEMO_MODE, payMembership } from '../lib/payments';
import { money, useCart, useShop } from '../store';
import { useNav } from '../router';
import { BRANDS, MEMBERSHIP_PRICE, ON_SALE } from '../data/catalog';

export function Join() {
  const member = useShop((s) => s.isMember());
  const join = useShop((s) => s.join);
  const say = useShop((s) => s.say);
  const cart = useCart();
  const { back, setTab } = useNav();
  const [busy, setBusy] = useState(false);

  const flagship = [...ON_SALE].filter((p) => p.cat !== 'set').sort((a, b) => b.rrp - a.rrp)[0];

  const perks = [
    {
      icon: <IcCrown size={17} />,
      title: 'BYRAIN −50% от розничной цены',
      text: `${ON_SALE.filter((p) => p.brandId === 'byrain').length} позиций: кремы, сыворотки, маски, ампулы. Клубная цена на весь ассортимент.`,
    },
    {
      icon: <IcSpark size={17} />,
      title: 'GREYMY −35%',
      text: 'Профессиональный уход за волосами по ценам, которых нет в рознице.',
    },
    {
      icon: <IcTruck size={17} />,
      title: 'Бесплатная доставка от 15 000 ₽',
      text: 'По Москве — на следующий день, по России — СДЭК.',
    },
  ];

  const pay = async () => {
    if (busy) return;
    setBusy(true);
    const r = await payMembership();
    setBusy(false);
    if (r === 'cancelled') return;
    if (r === 'failed') { say('Оплата не прошла. Попробуйте ещё раз'); return; }
    join();
    if (cart.club > 0) setTab('cart'); else back();
  };

  if (member) {
    return (
      <div className="screen">
        <div className="paywall">
          <div className="paywall__glow" />
          <div className="paywall__mark">Cult</div>
          <div className="paywall__kicker">Вы член клуба</div>
        </div>
        <div className="pad" style={{ marginTop: 20 }}>
          <button className="btn btn--dark btn--block" onClick={() => setTab('catalog')}>
            Перейти к покупкам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="paywall">
        <div className="paywall__glow" />
        <div className="paywall__mark">Cult</div>
        <div className="paywall__kicker">Закрытый клуб BYRAIN</div>
        <div className="paywall__claim">
          Членство {money(MEMBERSHIP_PRICE)} в месяц<br />возвращает себя первой покупкой
        </div>
      </div>

      {/* Личная математика */}
      <div className="pad" style={{ marginTop: 18 }}>
        <div className="save">
          <IcSpark size={19} className="gold" />
          {cart.club > 0 ? (
            <div className="grow">
              <div className="t-micro gold">Экономия на вашей корзине</div>
              <div className="save__v">{money(cart.saved)}</div>
              <div className="t-micro">вместо {money(cart.rrp)} заплатите {money(cart.club)}</div>
            </div>
          ) : flagship && (
            <div className="grow">
              <div className="t-micro gold">Пример выгоды</div>
              <div className="t-h3" style={{ marginTop: 2 }}>{flagship.title}</div>
              <div className="t-micro">
                {money(flagship.club)} в клубе вместо {money(flagship.rrp)} — минус {money(flagship.rrp - flagship.club)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Что даёт членство */}
      <div className="pad" style={{ marginTop: 8 }}>
        {perks.map((p, i) => (
          <div className="perk" key={i}>
            <span className="perk__i">{p.icon}</span>
            <div>
              <div className="perk__t">{p.title}</div>
              <div className="perk__d">{p.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Цена */}
      <div className="pad">
        <div className="plan">
          <div className="plan__v">{money(MEMBERSHIP_PRICE)}</div>
          <div className="plan__p">в месяц · автопродление · отмена в любой момент</div>
        </div>

        <button className="btn btn--gold btn--block" style={{ marginTop: 18 }} onClick={pay} disabled={busy}>
          {busy ? 'Оформляем…' : `Вступить за ${money(MEMBERSHIP_PRICE)}`}
        </button>

        <div className="col" style={{ gap: 9, marginTop: 18 }}>
          {[
            'Списание раз в месяц, отменить можно в профиле',
            'Доступ к клубным ценам открывается сразу',
            `Два бренда в клубе: ${BRANDS.map((b) => b.title).join(' и ')}`,
          ].map((t) => (
            <div className="row" key={t} style={{ alignItems: 'flex-start', gap: 9 }}>
              <span className="gold" style={{ marginTop: 3, display: 'flex' }}><IcCheck size={14} /></span>
              <span className="t-cap grow">{t}</span>
            </div>
          ))}
        </div>

        {DEMO_MODE && (
          <div className="note" style={{ marginTop: 18 }}>
            Демо: платёжный контур не подключён, членство активируется локально.
          </div>
        )}
      </div>
      <div style={{ height: 40 }} />
    </div>
  );
}
