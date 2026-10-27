import { useState } from 'react';
import { IcCheck, IcCrown, IcRight, IcSupport, IcUpRight } from '../components/Icons';
import { Empty, Sheet } from '../components/ui';
import { confirmMsg, haptic, openExternal } from '../lib/telegram';
import { money, useShop } from '../store';
import { useNav } from '../router';
import { MEMBERSHIP_PRICE } from '../data/catalog';

const SUPPORT = 'https://t.me/byrain_support';

export function Profile() {
  const member = useShop((s) => s.isMember());
  const until = useShop((s) => s.memberUntil);
  const autoRenew = useShop((s) => s.autoRenew);
  const cancelRenew = useShop((s) => s.cancelRenew);
  const profile = useShop((s) => s.profile);
  const setProfile = useShop((s) => s.setProfile);
  const orders = useShop((s) => s.orders);
  const favs = useShop((s) => s.favs);
  const savedTotal = useShop((s) => s.savedTotal);
  const reset = useShop((s) => s.reset);
  const go = useNav((n) => n.go);

  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(profile);

  const untilTxt = until
    ? new Date(until).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const doCancel = async () => {
    if (await confirmMsg('Отключить автопродление? Клубные цены будут действовать до конца оплаченного периода.')) {
      cancelRenew();
    }
  };

  return (
    <div className="screen pad" style={{ paddingTop: 16 }}>
      {/* Членство */}
      {member ? (
        <div className="memcard">
          <div className="memcard__glow" />
          <div className="memcard__m">Cult</div>
          <div className="memcard__s">Членство активно</div>
          <div style={{ position: 'relative', fontSize: 13, opacity: .78, marginTop: 16 }}>
            {autoRenew
              ? `Следующее списание ${money(MEMBERSHIP_PRICE)} — ${untilTxt}`
              : `Действует до ${untilTxt}, автопродление отключено`}
          </div>
          <div style={{ position: 'relative', fontSize: 11, opacity: .6, marginTop: 16 }}>Сэкономлено в клубе</div>
          <div style={{ position: 'relative', fontSize: 25, fontWeight: 700, letterSpacing: '-.03em' }} className="num">
            {money(savedTotal)}
          </div>
          {autoRenew && (
            <button className="btn btn--sm" style={{ marginTop: 16, background: 'rgba(255,255,255,.12)', color: '#fff', position: 'relative' }}
                    onClick={doCancel}>
              Отключить автопродление
            </button>
          )}
        </div>
      ) : (
        <button className="memcard" style={{ width: '100%', textAlign: 'left' }} onClick={() => go({ k: 'join' })}>
          <div className="memcard__glow" />
          <div className="memcard__m">Cult</div>
          <div className="memcard__s">Членства нет</div>
          <div style={{ position: 'relative', fontSize: 13, opacity: .78, marginTop: 16 }}>
            BYRAIN −50% и GREYMY −35% за {money(MEMBERSHIP_PRICE)} в месяц
          </div>
          <span className="btn btn--sm btn--gold" style={{ marginTop: 16, position: 'relative' }}>
            <IcCrown size={15} />Вступить в CULT
          </span>
        </button>
      )}

      {/* Контакты */}
      <div className="t-label" style={{ marginTop: 28 }}>Контакты и доставка</div>
      <div className="list" style={{ marginTop: 10 }}>
        {([
          ['Имя', profile.name || 'не указано'],
          ['Телефон', profile.phone || 'не указан'],
          ['E-mail', profile.email || 'не указан'],
          ['Адрес', profile.address || 'не указан'],
        ] as const).map(([l, v]) => (
          <button className="lrow" key={l} onClick={() => { setDraft(profile); setEdit(true); haptic.tap(); }}>
            <span className="lrow__l">{l}</span>
            <span className="lrow__v clamp1">{v}</span>
            <IcRight size={15} className="faint" />
          </button>
        ))}
      </div>

      {/* Разделы */}
      <div className="list" style={{ marginTop: 20 }}>
        <button className="lrow" onClick={() => go({ k: 'orders' })}>
          <span className="lrow__l">История заказов</span>
          <span className="lrow__v num">{orders.length}</span>
          <IcRight size={15} className="faint" />
        </button>
        <div className="lrow">
          <span className="lrow__l">Избранное</span>
          <span className="lrow__v num">{favs.length}</span>
        </div>
        <button className="lrow" onClick={() => { haptic.tap(); openExternal(SUPPORT); }}>
          <IcSupport size={17} className="muted" />
          <span className="lrow__l">Поддержка клуба</span>
          <IcUpRight size={14} className="faint" />
        </button>
      </div>

      <div className="note" style={{ marginTop: 20 }}>
        Клубные цены действуют, пока активно членство. Заказы хранятся на этом устройстве.
      </div>

      <button className="t-cap" style={{ display: 'block', margin: '24px auto 0', color: 'var(--faint)' }}
              onClick={reset}>
        Сбросить демо-состояние
      </button>
      <div className="t-micro" style={{ textAlign: 'center', marginTop: 8 }}>CULT · закрытый клуб BYRAIN</div>
      <div style={{ height: 36 }} />

      <Sheet open={edit} onClose={() => setEdit(false)} title="Контакты">
        <div className="col" style={{ gap: 12, paddingTop: 10 }}>
          <label className="field"><span className="field__l">Имя и фамилия</span>
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
          <label className="field"><span className="field__l">Телефон</span>
            <input className="input" type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label>
          <label className="field"><span className="field__l">E-mail</span>
            <input className="input" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label>
          <label className="field"><span className="field__l">Адрес доставки</span>
            <textarea className="input" rows={2} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></label>
          <button className="btn btn--dark btn--block" onClick={() => { setProfile(draft); setEdit(false); haptic.ok(); }}>
            <IcCheck size={17} />Сохранить
          </button>
        </div>
      </Sheet>
    </div>
  );
}

export function Orders() {
  const orders = useShop((s) => s.orders);
  const setTab = useNav((n) => n.setTab);

  if (!orders.length) {
    return (
      <Empty title="Заказов пока нет" text="Оформленные заказы появятся здесь с составом и статусом."
             action={<button className="btn btn--dark" onClick={() => setTab('catalog')}>В каталог</button>} />
    );
  }

  return (
    <div className="screen pad" style={{ paddingTop: 16 }}>
      <h1 className="t-h1">История заказов</h1>
      <div className="col" style={{ gap: 10, marginTop: 16 }}>
        {orders.map((o) => (
          <div className="order" key={o.id}>
            <div className="between">
              <span className="t-h3">№ {o.id}</span>
              <span className="order__st">{o.status}</span>
            </div>
            <div className="t-cap" style={{ marginTop: 3 }}>
              {new Date(o.ts).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="col" style={{ gap: 5, marginTop: 12 }}>
              {o.lines.map((l, i) => (
                <div className="between" key={i}>
                  <span className="t-cap clamp1 grow" style={{ color: 'var(--ink-2)' }}>{l.title}</span>
                  <span className="t-cap num">{l.qty} × {money(l.price)}</span>
                </div>
              ))}
            </div>
            <div className="hr" style={{ margin: '12px 0 9px' }} />
            <div className="between"><span className="t-sm">Итого</span>
              <span className="t-h3 num">{money(o.total)}</span></div>
            <div className="between" style={{ marginTop: 2 }}>
              <span className="t-micro gold">Выгода клуба</span>
              <span className="t-micro gold num">−{money(o.saved)}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 36 }} />
    </div>
  );
}
