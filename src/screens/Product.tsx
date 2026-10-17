import { useEffect, useRef, useState } from 'react';
import { Accordion, Price, Qty, money } from '../components/Primitives';
import { ProductCard } from '../components/Cards';
import { IcCheck, IcCrown, IcHeart, IcHeartOn, IcTruck, IcUpRight } from '../components/Icons';
import { PRODUCT_MAP, ON_SALE } from '../data/products';
import { useApp } from '../store';
import { useNav } from '../router';
import { haptic, openExternal, setMainButton } from '../lib/telegram';
import { asset } from '../lib/assets';

export function Product({ id }: { id: string }) {
  const p = PRODUCT_MAP.get(id)!;
  const member = useApp((s) => s.isMember());
  const add = useApp((s) => s.add);
  const favs = useApp((s) => s.favs);
  const toggleFav = useApp((s) => s.toggleFav);
  const { go, setTab } = useNav();
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const gallery = useRef<HTMLDivElement>(null);
  const fav = favs.includes(p.id);
  const soon = p.rrp === 0;

  /* Главная кнопка Telegram = основное действие экрана */
  useEffect(() => {
    if (soon) { setMainButton(null); return; }
    setMainButton(
      member
        ? { text: `В КОРЗИНУ · ${money(p.club * qty)}`, onClick: () => add(p.id, qty) }
        : { text: 'ВСТУПИТЬ В CULT · 3 000 ₽', onClick: () => go({ k: 'join' }) },
    );
    return () => setMainButton(null);
  }, [member, qty, p.id]);

  useEffect(() => {
    const el = gallery.current;
    if (!el) return;
    const onScroll = () => setImg(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const buyNow = () => { add(p.id, qty); setTab('cart'); go({ k: 'checkout' }); };

  return (
    <div className="screen">
      {/* Галерея */}
      <div style={{ position: 'relative' }}>
        <div className="carousel__track" ref={gallery} style={{ padding: 0, gap: 0 }}>
          {(p.images.length ? p.images : ['']).map((src, i) => (
            <div key={i} style={{ flex: '0 0 100%', scrollSnapAlign: 'center', aspectRatio: 1, background: 'var(--surface-2)' }}>
              {src && <img src={asset(src)} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
            </div>
          ))}
        </div>
        <button className="icon-btn" onClick={() => toggleFav(p.id)}
                style={{ position: 'absolute', top: 10, right: 10, background: 'var(--blur-bg)', backdropFilter: 'blur(10px)' }}
                aria-label="В избранное">
          {fav ? <IcHeartOn size={19} /> : <IcHeart size={19} />}
        </button>
        {p.images.length > 1 && (
          <div className="dots" style={{ position: 'absolute', left: 0, right: 0, bottom: 10, marginTop: 0 }}>
            {p.images.map((_, i) => <span key={i} className={`dots__d${i === img ? ' dots__d--on' : ''}`} />)}
          </div>
        )}
      </div>

      {/* Заголовок и цена */}
      <div className="pad" style={{ paddingTop: 16 }}>
        <div className="eyebrow">{p.brand}{p.volume ? ` · ${p.volume}` : ''}</div>
        <h1 className="h1" style={{ marginTop: 7 }}>{p.title}</h1>
        {p.tagline && <p className="small muted" style={{ marginTop: 7 }}>{p.tagline}</p>}

        <div style={{ marginTop: 15 }}>
          <Price club={p.club} rrp={p.rrp} size="lg" member={member} onLockClick={() => go({ k: 'join' })} />
        </div>

        {!soon && (
          member
            ? (
              <div className="row" style={{ marginTop: 16, gap: 12 }}>
                <Qty value={qty} onChange={setQty} />
                <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => add(p.id, qty)}>В корзину</button>
              </div>
            )
            : (
              <div className="col" style={{ marginTop: 16, gap: 9 }}>
                <div className="saved-strip">
                  <IcCrown size={19} className="gold" />
                  <div style={{ lineHeight: 1.3 }}>
                    <div className="micro" style={{ color: 'var(--gold-ink)' }}>Выгода на этом товаре</div>
                    <div className="saved-strip__v">{money(p.rrp - p.club)}</div>
                  </div>
                </div>
                <button className="btn btn--gold btn--block btn--lg" onClick={() => go({ k: 'join' })}>
                  Вступить и купить за {money(p.club)}
                </button>
              </div>
            )
        )}

        {member && !soon && (
          <button className="btn btn--outline btn--block" style={{ marginTop: 9 }} onClick={buyNow}>
            Купить сейчас
          </button>
        )}

        {soon && <div className="note" style={{ marginTop: 14 }}>Продукт готовится к выходу. Цена появится вместе со стартом продаж.</div>}

        <div className="row" style={{ marginTop: 16, gap: 8, color: 'var(--muted)' }}>
          <IcTruck size={17} />
          <span className="caption">Доставка курьером по Москве — 400 ₽, по России — СДЭК</span>
        </div>
      </div>

      {/* Раскрывающиеся блоки */}
      <div className="pad block--tight">
        {p.desc && (
          <Accordion label="Описание" defaultOpen>
            {p.desc.split('\n').filter(Boolean).map((t, i) => <p key={i}>{t}</p>)}
          </Accordion>
        )}
        {p.effects.length > 0 && (
          <Accordion label="Эффекты">
            <div className="acc__list">
              {p.effects.map((e, i) => <div className="acc__li" key={i}>{e}</div>)}
            </div>
          </Accordion>
        )}
        {p.indications.length > 0 && (
          <Accordion label="Показания">
            <div className="acc__list">
              {p.indications.map((e, i) => <div className="acc__li" key={i}>{e}</div>)}
            </div>
          </Accordion>
        )}
        {p.usage && (
          <Accordion label="Способ применения">
            {p.usage.split('\n').filter(Boolean).map((t, i) => <p key={i}>{t}</p>)}
          </Accordion>
        )}
        {p.inci && (
          <Accordion label="Состав">
            <div className="acc__inci">{p.inci}</div>
          </Accordion>
        )}
        <Accordion label="Коллекции и показания к применению">
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {p.collections.map((c) => (
              <span key={c} className="chip" style={{ height: 28, fontSize: 11.5 }}>{c.replace(/ \/ .*/, '')}</span>
            ))}
          </div>
        </Accordion>
      </div>

      {/* Ссылка на боевую карточку сайта */}
      <div className="pad block--tight">
        <button className="btn btn--ghost btn--block btn--sm" onClick={() => { haptic.tap(); openExternal(p.url); }}>
          Страница товара на byrain.ru<IcUpRight size={15} />
        </button>
      </div>

      {/* Что берут вместе */}
      <div className="block">
        <div className="block-head"><h2 className="h2">С этим товаром покупают</h2></div>
        <div className="hscroll">
          {ON_SALE.filter((x) => x.id !== p.id).slice(0, 6).map((x) => (
            <div key={x.id} style={{ width: 150 }}><ProductCard p={x} /></div>
          ))}
        </div>
      </div>

      {member && !soon && (
        <div className="pad block--tight">
          <div className="row" style={{ gap: 7, color: 'var(--ok)' }}>
            <IcCheck size={16} />
            <span className="caption" style={{ color: 'var(--ok)' }}>
              Клубная цена действует, пока активно членство
            </span>
          </div>
        </div>
      )}
      <div style={{ height: 34 }} />
    </div>
  );
}
