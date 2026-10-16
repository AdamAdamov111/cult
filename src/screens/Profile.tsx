import { useState } from 'react';
import { Empty, Sheet, money } from '../components/Primitives';
import { IcCheck, IcCrown, IcRight, IcSupport, IcTicket, IcUpRight, IcUser } from '../components/Icons';
import { MEMBERSHIP_PRICE } from '../data/sections';
import { useApp } from '../store';
import { useNav } from '../router';
import { confirmMsg, haptic, openExternal, tgUser } from '../lib/telegram';

const SUPPORT_URL = 'https://t.me/byrain_support';

export function Profile() {
  const member = useApp((s) => s.isMember());
  const until = useApp((s) => s.memberUntil);
  const autoRenew = useApp((s) => s.autoRenew);
  const cancelRenew = useApp((s) => s.cancelRenew);
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const orders = useApp((s) => s.orders);
  const coupons = useApp((s) => s.coupons);
  const savedTotal = useApp((s) => s.savedTotal);
  const favs = useApp((s) => s.favs);
  const go = useNav((n) => n.go);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(profile);

  const tgu = tgUser();
  const untilTxt = until ? new Date(until).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const openEdit = () => { setDraft(profile); setEdit(true); haptic.tap(); };
  const save = () => { setProfile(draft); setEdit(false); haptic.ok(); };

  const doCancel = async () => {
    if (await confirmMsg('Отключить автопродление? Клубные цены будут действовать до конца оплаченного периода.')) {
      cancelRenew();
    }
  };

  return (
    <div className="screen screen--root">
      {/* Пользователь */}
      <div className="pad" style={{ paddingTop: 16 }}>
        <div className="row" style={{ gap: 13 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', background: 'var(--surface-3)', display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>
            {tgu?.photo ? <img src={tgu.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IcUser size={26} className="muted" />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="h2 clamp1">{profile.name || tgu?.name || 'Гость клуба'}</div>
            <div className="caption">{tgu?.username ? '@' + tgu.username : member ? 'Член клуба CULT' : 'Без членства'}</div>
          </div>
        </div>
      </div>

      {/* Членство */}
      <div className="pad block--tight">
        {member ? (
          <div className="memcard">
            <div className="memcard__glow" />
            <div className="memcard__mark">Cult</div>
            <div className="memcard__st">Членство активно</div>
            <div className="memcard__until">
              {autoRenew ? `Следующее списание ${money(MEMBERSHIP_PRICE)} — ${untilTxt}` : `Действует до ${untilTxt}, автопродление отключено`}
            </div>
            <div className="micro" style={{ position: 'relative', marginTop: 15, color: 'rgba(255,255,255,.6)' }}>Сэкономлено в клубе</div>
            <div className="memcard__saved">{money(savedTotal)}</div>
            {autoRenew && (
              <button className="btn btn--sm" style={{ marginTop: 15, background: 'rgba(255,255,255,.12)', color: '#fff', position: 'relative' }}
                      onClick={doCancel}>
                Отключить автопродление
              </button>
            )}
          </div>
        ) : (
          <button className="memcard" style={{ width: '100%', textAlign: 'left' }} onClick={() => go({ k: 'join' })}>
            <div className="memcard__glow" />
            <div className="memcard__mark">Cult</div>
            <div className="memcard__st">Членства нет</div>
            <div className="memcard__until">Вся косметика BYRAIN −50% и предложения партнёров — за {money(MEMBERSHIP_PRICE)} в месяц</div>
            <span className="btn btn--sm btn--gold" style={{ marginTop: 15, position: 'relative' }}>
              <IcCrown size={15} />Вступить в CULT
            </span>
          </button>
        )}
      </div>

      {/* Контакты */}
      <div className="pad block--tight">
        <div className="eyebrow" style={{ marginBottom: 9 }}>Контакты и доставка</div>
        <div className="plist">
          <button className="prow" onClick={openEdit}>
            <span className="prow__l">Имя</span><span className="prow__v">{profile.name || 'не указано'}</span><IcRight size={16} className="prow__chev" />
          </button>
          <button className="prow" onClick={openEdit}>
            <span className="prow__l">Телефон</span><span className="prow__v">{profile.phone || 'не указан'}</span><IcRight size={16} className="prow__chev" />
          </button>
          <button className="prow" onClick={openEdit}>
            <span className="prow__l">E-mail</span><span className="prow__v clamp1">{profile.email || 'не указан'}</span><IcRight size={16} className="prow__chev" />
          </button>
          <button className="prow" onClick={openEdit}>
            <span className="prow__l">Адрес</span><span className="prow__v clamp1">{profile.address || 'не указан'}</span><IcRight size={16} className="prow__chev" />
          </button>
        </div>
      </div>

      {/* Разделы профиля */}
      <div className="pad block--tight">
        <div className="plist">
          <button className="prow" onClick={() => go({ k: 'orders' })}>
            <span className="prow__l">История заказов</span><span className="prow__v num">{orders.length}</span><IcRight size={16} className="prow__chev" />
          </button>
          <button className="prow" onClick={() => go({ k: 'coupons' })}>
            <span className="prow__l">Промокоды и купоны</span><span className="prow__v num">{coupons.length}</span><IcRight size={16} className="prow__chev" />
          </button>
          <div className="prow">
            <span className="prow__l">Избранное</span><span className="prow__v num">{favs.length}</span>
          </div>
          <button className="prow" onClick={() => { haptic.tap(); openExternal(SUPPORT_URL); }}>
            <IcSupport size={17} className="muted" /><span className="prow__l">Поддержка клуба</span><IcUpRight size={15} className="prow__chev" />
          </button>
        </div>
      </div>

      <div className="pad block--tight">
        <div className="note">
          Клубные цены действуют, пока активно членство. Заказы и промокоды привязаны к вашему Telegram-аккаунту.
        </div>
      </div>
      <div style={{ height: 30 }} />

      {/* Редактирование контактов */}
      <Sheet open={edit} onClose={() => setEdit(false)} title="Контакты">
        <div className="col" style={{ gap: 11, paddingTop: 8 }}>
          <label className="field"><span className="field__label">Имя и фамилия</span>
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
          <label className="field"><span className="field__label">Телефон</span>
            <input className="input" type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+7 900 000-00-00" /></label>
          <label className="field"><span className="field__label">E-mail</span>
            <input className="input" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label>
          <label className="field"><span className="field__label">Адрес доставки</span>
            <textarea className="input" rows={2} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></label>
          <button className="btn btn--primary btn--block btn--lg" onClick={save}><IcCheck size={17} />Сохранить</button>
        </div>
      </Sheet>
    </div>
  );
}

/* ======================= История заказов ======================= */
export function Orders() {
  const orders = useApp((s) => s.orders);
  const setTab = useNav((n) => n.setTab);
  if (!orders.length) {
    return (
      <div className="screen">
        <Empty title="Заказов пока нет" text="Оформленные заказы появятся здесь с составом и статусом."
               action={<button className="btn btn--primary" onClick={() => setTab('catalog')}>В каталог</button>} />
      </div>
    );
  }
  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 14 }}>
        <h1 className="h1">История заказов</h1>
        <div style={{ marginTop: 14 }}>
          {orders.map((o) => (
            <div className="order" key={o.id}>
              <div className="row--between">
                <span className="h3">№ {o.id}</span>
                <span className="order__st order__st--ok">{o.status}</span>
              </div>
              <div className="caption" style={{ marginTop: 3 }}>
                {new Date(o.ts).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="col" style={{ gap: 4, marginTop: 10 }}>
                {o.lines.map((l, i) => (
                  <div className="row--between" key={i}>
                    <span className="caption clamp1" style={{ flex: 1, color: 'var(--ink-2)' }}>{l.title}</span>
                    <span className="caption num">{l.qty} × {money(l.price)}</span>
                  </div>
                ))}
              </div>
              <div className="hr" style={{ margin: '11px 0 8px' }} />
              <div className="row--between">
                <span className="small">Итого</span>
                <span className="h3 num">{money(o.total)}</span>
              </div>
              <div className="row--between" style={{ marginTop: 2 }}>
                <span className="micro gold">Выгода клуба</span>
                <span className="micro gold num">−{money(o.saved)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 30 }} />
    </div>
  );
}

/* ======================= Купоны ======================= */
export function Coupons() {
  const coupons = useApp((s) => s.coupons);
  const say = useApp((s) => s.say);
  const go = useNav((n) => n.go);
  if (!coupons.length) {
    return (
      <div className="screen">
        <Empty icon={<IcTicket size={56} />} title="Купонов пока нет"
               text="Откройте предложение партнёра и нажмите «Получить предложение» — промокод появится здесь." />
      </div>
    );
  }
  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 14 }}>
        <h1 className="h1">Промокоды и купоны</h1>
        <div className="col" style={{ gap: 10, marginTop: 14 }}>
          {coupons.map((c) => (
            <div className="coupon-mini" key={c.code}>
              <IcTicket size={19} className="gold" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="micro">{c.brand} · {c.deal}</div>
                <div className="coupon-mini__code">{c.code}</div>
                <div className="micro clamp1">{c.title}</div>
                <div className="micro faint">до {new Date(c.expires).toLocaleDateString('ru-RU')}</div>
              </div>
              <div className="col" style={{ gap: 6 }}>
                <button className="btn btn--sm btn--ghost" onClick={() => { navigator.clipboard?.writeText(c.code); haptic.ok(); say('Скопировано'); }}>Копировать</button>
                <button className="btn btn--sm btn--outline" onClick={() => go({ k: 'offer', id: c.offerId })}>Открыть</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 30 }} />
    </div>
  );
}
