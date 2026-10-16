import { Price } from './Primitives';
import { Cover } from './Cover';
import { IcHeart, IcHeartOn, IcLock, IcPin, IcClock, IcRight } from './Icons';
import { useApp } from '../store';
import { useNav } from '../router';
import { SECTION_MAP, type SectionDef } from '../data/sections';
import type { Offer, Product } from '../types';

/* ======================= Карточка товара ======================= */
export function ProductCard({ p }: { p: Product }) {
  const member = useApp((s) => s.isMember());
  const favs = useApp((s) => s.favs);
  const toggleFav = useApp((s) => s.toggleFav);
  const add = useApp((s) => s.add);
  const inCart = useApp((s) => s.qtyOf(p.id));
  const go = useNav((s) => s.go);
  const fav = favs.includes(p.id);
  const soon = p.rrp === 0;

  return (
    <div className="pcard">
      <div className="pcard__media" onClick={() => go({ k: 'product', id: p.id })}>
        {p.images[0] && <img className="pcard__img" src={p.images[0]} alt={p.title} loading="lazy" decoding="async" />}
        <div className="pcard__marks">
          {p.hit && <span className="badge-off" style={{ background: 'var(--ink)' }}>ХИТ</span>}
          {soon && <span className="badge-soon">скоро</span>}
        </div>
        <button className="pcard__fav" onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}
                aria-label={fav ? 'Убрать из избранного' : 'В избранное'}>
          {fav ? <IcHeartOn size={18} /> : <IcHeart size={18} />}
        </button>
      </div>

      <div onClick={() => go({ k: 'product', id: p.id })}>
        <div className="pcard__title clamp2">{p.title}</div>
        {p.volume && <div className="pcard__vol">{p.volume}</div>}
        <Price club={p.club} rrp={p.rrp} size="sm" member={member} onLockClick={() => go({ k: 'join' })} />
      </div>

      {!soon && (
        <div className="pcard__cta">
          {member
            ? (
              <button className={`btn btn--sm btn--block ${inCart ? 'btn--outline' : 'btn--primary'}`}
                      onClick={() => add(p.id)}>
                {inCart ? `В корзине · ${inCart}` : 'В корзину'}
              </button>
            )
            : (
              <button className="btn btn--sm btn--block btn--gold-outline" onClick={() => go({ k: 'join' })}>
                Вступить · −{Math.round((1 - p.club / p.rrp) * 100)}%
              </button>
            )}
        </div>
      )}
    </div>
  );
}

/* ======================= Карточка предложения партнёра ======================= */
export function OfferCard({ o }: { o: Offer }) {
  const member = useApp((s) => s.isMember());
  const go = useNav((s) => s.go);
  return (
    <button className="ocard" onClick={() => go({ k: 'offer', id: o.id })}>
      <div className="ocard__media">
        <Cover section={o.section} src={o.image || undefined} label={o.brand} className="ocard__img" />
        <span className="ocard__off">{o.deal}</span>
        {!member && <span className="ocard__lock"><IcLock size={13} /></span>}
      </div>
      <div className="ocard__body">
        <div className="ocard__brand">{o.brand}</div>
        <div className="ocard__title clamp2">{o.title}</div>
        <div className="ocard__meta">
          <span className="row" style={{ gap: 4 }}><IcPin size={13} />{o.city}</span>
          <span className="row" style={{ gap: 4 }}><IcClock size={13} />{o.valid}</span>
        </div>
      </div>
    </button>
  );
}

/* ======================= Баннер раздела ======================= */
export function SectionBanner({ s, count }: { s: SectionDef; count?: string }) {
  const go = useNav((n) => n.go);
  return (
    <button className="sbanner" onClick={() => go({ k: 'section', id: s.id })}>
      <Cover section={s.id} src={s.image} label={s.title} big className="sbanner__img" />
      <div className="sbanner__scrim" style={{ background: 'linear-gradient(0deg, rgba(8,8,8,.74) 6%, rgba(8,8,8,.08) 76%)' }} />
      <div className="sbanner__content">
        <span className="sbanner__kicker">{s.kicker}</span>
        <span className="sbanner__title">{s.title}</span>
        <span className="sbanner__sub">{count != null ? `${s.sub} · ${count}` : s.sub}</span>
      </div>
      <span className="sbanner__arrow"><IcRight size={17} /></span>
    </button>
  );
}

export { SECTION_MAP };
