import { useEffect, useState } from 'react';
import { money } from '../components/Primitives';
import { IcCheck, IcCrown, IcSpark, IcTicket } from '../components/Icons';
import { OFFERS, TOTAL_OFFER_VALUE } from '../data/offers';
import { ON_SALE } from '../data/products';
import { MEMBERSHIP_PRICE } from '../data/sections';
import { useApp, useCartTotals } from '../store';
import { useNav } from '../router';
import { haptic, setMainButton } from '../lib/telegram';
import { DEMO_MODE, payMembership } from '../lib/payments';

const PERKS = [
  { t: 'Вся косметика BYRAIN −50% от РРЦ', d: `${ON_SALE.length} позиций: кремы, сыворотки, маски, ампулы. Клубная цена действует на весь ассортимент без исключений.` },
  { t: 'Топ-бренды косметики по клубным ценам', d: 'Отобранные марки партнёров бренда — цены, которых нет в рознице.' },
  { t: `${OFFERS.length} предложений партнёров в пяти сферах`, d: 'Спорт, travel, красота, здоровье и доступ в другие закрытые клубы. Промокод, QR или заявка прямо в приложении.' },
];

export function Join() {
  const join = useApp((s) => s.join);
  const totals = useCartTotals();
  const isMember = useApp((s) => s.isMember());
  const { back, setTab } = useNav();
  const [busy, setBusy] = useState(false);

  /* Главный пример выгоды — самый дорогой товар каталога */
  const flagship = [...ON_SALE].filter((p) => p.cat !== 'set').sort((a, b) => b.rrp - a.rrp)[0];

  const pay = async () => {
    if (busy) return;
    setBusy(true);
    haptic.press();
    const r = await payMembership();
    setBusy(false);
    if (r === 'cancelled') return;
    if (r === 'failed') { useApp.getState().say('Оплата не прошла. Попробуйте ещё раз'); return; }
    if (r === 'demo') join();              // демо-режим: активируем локально
    else await useApp.getState().syncMembership();
    totals.club > 0 ? setTab('cart') : back();
  };

  useEffect(() => {
    if (isMember) return;
    setMainButton({ text: `ОПЛАТИТЬ ${money(MEMBERSHIP_PRICE)} / МЕСЯЦ`, onClick: pay });
    return () => setMainButton(null);
  }, [isMember, busy, totals.club]);

  if (isMember) {
    return (
      <div className="screen">
        <div className="join-hero">
          <div className="join-hero__glow" />
          <div className="join-hero__mark">Cult</div>
          <div className="join-hero__sub">Вы член клуба</div>
        </div>
        <div className="pad block--tight">
          <button className="btn btn--primary btn--block btn--lg" onClick={() => setTab('home')}>Перейти к покупкам</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="join-hero">
        <div className="join-hero__glow" />
        <div className="join-hero__mark">Cult</div>
        <div className="join-hero__sub">Закрытый клуб BYRAIN</div>
        <div className="join-hero__claim">
          Членство 3 000 ₽ в месяц<br />возвращает себя первой покупкой
        </div>
      </div>

      {/* Персональная математика */}
      {totals.club > 0 ? (
        <div className="pad" style={{ marginTop: 16 }}>
          <div className="saved-strip">
            <IcSpark size={20} className="gold" />
            <div style={{ lineHeight: 1.35, flex: 1 }}>
              <div className="micro" style={{ color: 'var(--gold-ink)' }}>Экономия на вашей корзине</div>
              <div className="saved-strip__v">{money(totals.saved)}</div>
              <div className="micro">вместо {money(totals.rrp)} заплатите {money(totals.club)}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pad" style={{ marginTop: 16 }}>
          <div className="saved-strip">
            <IcSpark size={20} className="gold" />
            <div style={{ lineHeight: 1.35, flex: 1 }}>
              <div className="micro" style={{ color: 'var(--gold-ink)' }}>Пример выгоды</div>
              <div className="h3" style={{ marginTop: 2 }}>{flagship.title}</div>
              <div className="micro">{money(flagship.club)} в клубе вместо {money(flagship.rrp)} с полки — минус {money(flagship.rrp - flagship.club)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Что даёт членство */}
      <div className="pad block--tight">
        {PERKS.map((p, i) => (
          <div className="perk" key={i}>
            <span className="perk__ic">{i === 0 ? <IcCrown size={18} /> : i === 1 ? <IcSpark size={18} /> : <IcTicket size={18} />}</span>
            <div>
              <div className="perk__t">{p.t}</div>
              <div className="perk__d">{p.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Цена */}
      <div className="pad">
        <div className="plan-price">
          <div className="plan-price__v">{money(MEMBERSHIP_PRICE)}</div>
          <div className="plan-price__p">в месяц · автопродление · отмена в любой момент</div>
        </div>

        <button className="btn btn--gold btn--block btn--lg" style={{ marginTop: 16 }} onClick={pay} disabled={busy}>
          {busy ? 'Оплата…' : `Вступить за ${money(MEMBERSHIP_PRICE)}`}
        </button>

        <div className="col" style={{ gap: 7, marginTop: 14 }}>
          {[
            'Списание раз в месяц, отменить можно в профиле',
            'Доступ к клубным ценам открывается сразу',
            `Суммарная выгода по предложениям партнёров — до ${money(TOTAL_OFFER_VALUE)} в год`,
          ].map((t) => (
            <div className="row" key={t} style={{ alignItems: 'flex-start', gap: 8 }}>
              <IcCheck size={14} className="gold" />
              <span className="caption" style={{ flex: 1 }}>{t}</span>
            </div>
          ))}
        </div>

        {DEMO_MODE && (
          <div className="note" style={{ marginTop: 16 }}>
            <span className="demo-tag">демо</span>{' '}
            Платёжный контур не подключён: оплата имитируется, членство активируется локально.
            Боевая оплата идёт через Telegram Payments на стороне бота.
          </div>
        )}
      </div>
      <div style={{ height: 34 }} />
    </div>
  );
}
