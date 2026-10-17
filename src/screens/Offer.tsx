import { useEffect, useState } from 'react';
import { Cover } from '../components/Cover';
import { Qr } from '../components/Qr';
import { Sheet, money } from '../components/Primitives';
import { IcCheck, IcClock, IcCopy, IcCrown, IcPin, IcTicket } from '../components/Icons';
import { OFFER_MAP } from '../data/offers';
import { SECTION_MAP } from '../data/sections';
import { useApp } from '../store';
import { useNav } from '../router';
import { haptic, setMainButton } from '../lib/telegram';
import { asset } from '../lib/assets';

export function Offer({ id }: { id: string }) {
  const o = OFFER_MAP.get(id)!;
  const s = SECTION_MAP[o.section];
  const member = useApp((a) => a.isMember());
  const issue = useApp((a) => a.issueCoupon);
  const existing = useApp((a) => a.couponFor(id));
  const say = useApp((a) => a.say);
  const go = useNav((n) => n.go);
  const [sheet, setSheet] = useState<null | 'coupon' | 'request'>(null);
  const [form, setForm] = useState({ name: '', phone: '', when: '', note: '' });
  const [sent, setSent] = useState(false);

  const act = () => {
    if (!member) { go({ k: 'join' }); return; }
    if (o.kind === 'request') { setSheet('request'); return; }
    issue(o.id);
    setSheet('coupon');
  };

  const label = !member ? 'ВСТУПИТЬ В CULT · 3 000 ₽'
    : o.kind === 'request' ? 'ОСТАВИТЬ ЗАЯВКУ'
    : existing ? 'ПОКАЗАТЬ ПРОМОКОД' : 'ПОЛУЧИТЬ ПРЕДЛОЖЕНИЕ';

  useEffect(() => {
    setMainButton({ text: label, onClick: act });
    return () => setMainButton(null);
  }, [member, label, existing?.code]);

  const coupon = existing;

  return (
    <div className="screen">
      <div style={{ position: 'relative', aspectRatio: '16/10' }}>
        <Cover section={o.section} src={asset(o.image) || undefined} label={o.brand} big />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(8,8,8,.8) 4%, rgba(8,8,8,.08) 72%)' }} />
        <div style={{ position: 'absolute', inset: 0, padding: 'var(--pad)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <span className="sbanner__kicker" style={{ color: 'var(--gold)' }}>{s.title} · {o.brand}</span>
          <span style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.14, letterSpacing: '-.02em', marginTop: 3 }}>{o.title}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 27, padding: '0 11px', borderRadius: 6, background: '#fff', color: '#0a0a0a', fontWeight: 700, fontSize: 13, marginTop: 11, alignSelf: 'flex-start' }}>
            {o.deal} для членов клуба
          </span>
        </div>
      </div>

      <div className="pad" style={{ paddingTop: 16 }}>
        <p className="body">{o.summary}</p>

        {o.value ? (
          <div className="saved-strip" style={{ marginTop: 15 }}>
            <IcCrown size={19} className="gold" />
            <div style={{ lineHeight: 1.3 }}>
              <div className="micro" style={{ color: 'var(--gold-ink)' }}>Выгода по предложению</div>
              <div className="saved-strip__v">до {money(o.value)}</div>
            </div>
          </div>
        ) : null}

        <div className="block--tight col" style={{ gap: 10 }}>
          <div className="eyebrow">Условия</div>
          {o.terms.map((t, i) => (
            <div className="row" key={i} style={{ alignItems: 'flex-start', gap: 9 }}>
              <IcCheck size={15} className="gold" />
              <span className="small" style={{ flex: 1 }}>{t}</span>
            </div>
          ))}
        </div>

        <div className="plist block--tight">
          {o.address && (
            <div className="prow"><IcPin size={17} className="muted" /><span className="prow__l">Адрес</span><span className="prow__v">{o.address}</span></div>
          )}
          <div className="prow"><IcClock size={17} className="muted" /><span className="prow__l">Действует</span><span className="prow__v">{o.valid}</span></div>
          <div className="prow"><IcTicket size={17} className="muted" /><span className="prow__l">Как получить</span>
            <span className="prow__v">{o.kind === 'request' ? 'заявка менеджеру' : 'промокод или QR'}</span></div>
        </div>

        {coupon && (
          <div className="coupon-mini block--tight" onClick={() => setSheet('coupon')} style={{ cursor: 'pointer' }}>
            <IcTicket size={19} className="gold" />
            <div style={{ flex: 1 }}>
              <div className="micro">Ваш промокод активен</div>
              <div className="coupon-mini__code">{coupon.code}</div>
            </div>
            <span className="btn btn--sm btn--ghost">Открыть</span>
          </div>
        )}

        <div className="block--tight">
          {member
            ? <button className="btn btn--primary btn--block btn--lg" onClick={act}>
                {o.kind === 'request' ? 'Оставить заявку' : coupon ? 'Показать промокод' : 'Получить предложение'}
              </button>
            : (
              <>
                <button className="btn btn--gold btn--block btn--lg" onClick={() => go({ k: 'join' })}>
                  Вступить в CULT за 3 000 ₽
                </button>
                <div className="note" style={{ marginTop: 10 }}>
                  Предложение доступно только членам клуба. Членство окупается одной покупкой косметики BYRAIN.
                </div>
              </>
            )}
        </div>
      </div>
      <div style={{ height: 34 }} />

      {/* Промокод и QR */}
      <Sheet open={sheet === 'coupon'} onClose={() => setSheet(null)}>
        {coupon && (
          <div style={{ paddingTop: 6 }}>
            <div className="coupon">
              <div style={{ textAlign: 'center' }}>
                <div className="wordmark" style={{ fontSize: 13 }}>Cult</div>
                <div className="micro" style={{ color: 'var(--gold)', marginTop: 7, letterSpacing: '.1em' }}>{coupon.brand}</div>
                <div className="h3" style={{ marginTop: 5 }}>{coupon.deal} · {coupon.title}</div>
              </div>
              <div className="coupon__code">{coupon.code}</div>
              <div className="coupon__qr"><Qr value={coupon.code} size={132} /></div>
              <div className="micro" style={{ textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,.6)' }}>
                Действует до {new Date(coupon.expires).toLocaleDateString('ru-RU')}
              </div>
            </div>
            <button className="btn btn--ghost btn--block" style={{ marginTop: 12 }}
                    onClick={() => {
                      navigator.clipboard?.writeText(coupon.code);
                      haptic.ok(); say('Промокод скопирован');
                    }}>
              <IcCopy size={16} />Скопировать код
            </button>
            <div className="note" style={{ marginTop: 10 }}>
              Назовите код или покажите QR администратору {coupon.brand}. Код привязан к вашему членству.
            </div>
          </div>
        )}
      </Sheet>

      {/* Заявка по travel */}
      <Sheet open={sheet === 'request'} onClose={() => { setSheet(null); setSent(false); }} title={sent ? 'Заявка принята' : 'Заявка на подбор'}>
        {sent ? (
          <div style={{ padding: '10px 0 8px' }}>
            <div className="row" style={{ gap: 10, color: 'var(--ok)' }}><IcCheck size={20} /><span className="h3" style={{ color: 'var(--ok)' }}>Менеджер свяжется в течение дня</span></div>
            <div className="note" style={{ marginTop: 12 }}>
              Заявка №{String(Date.now()).slice(-6)} по предложению «{o.title}». Ответ придёт в этот чат.
            </div>
            <button className="btn btn--primary btn--block" style={{ marginTop: 14 }} onClick={() => { setSheet(null); setSent(false); }}>Готово</button>
          </div>
        ) : (
          <div className="col" style={{ gap: 11, paddingTop: 8 }}>
            <label className="field"><span className="field__label">Имя</span>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Как к вам обращаться" /></label>
            <label className="field"><span className="field__label">Телефон</span>
              <input className="input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+7 ..." /></label>
            <label className="field"><span className="field__label">Желаемые даты</span>
              <input className="input" value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} placeholder="например, вторая половина марта" /></label>
            <label className="field"><span className="field__label">Комментарий</span>
              <textarea className="input" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Состав участников, пожелания" /></label>
            <button className="btn btn--primary btn--block btn--lg"
                    disabled={!form.name.trim() || form.phone.trim().length < 6}
                    onClick={() => { haptic.ok(); setSent(true); }}>
              Отправить заявку
            </button>
            <div className="note">Данные уходят менеджеру клуба. Предложение закрепляется за вами на 48 часов.</div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
