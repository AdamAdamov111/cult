import { useEffect, useRef, useState } from 'react';
import {
  IcCheck, IcCrown, IcHeart, IcHeartOn, IcReturn, IcShield, IcTruck, IcUpRight,
} from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { Accordion, Price, Qty, SectionHead } from '../components/ui';
import { asset } from '../lib/assets';
import { haptic, openExternal } from '../lib/telegram';
import { money, useShop } from '../store';
import { useNav } from '../router';
import { ON_SALE, discountOf, product, savingOf } from '../data/catalog';

export function Product({ id }: { id: string }) {
  const p = product(id);
  const member = useShop((s) => s.isMember());
  const add = useShop((s) => s.add);
  const fav = useShop((s) => s.isFav(id));
  const toggleFav = useShop((s) => s.toggleFav);
  const go = useNav((n) => n.go);

  const [qty, setQty] = useState(1);
  const [page, setPage] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setPage(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [id]);

  if (!p) return null;
  const related = ON_SALE.filter((x) => x.id !== p.id && x.brandId === p.brandId).slice(0, 6);

  return (
    <div className="screen">
      {/* Галерея */}
      <div className="gallery">
        <div className="gallery__track" ref={track}>
          {(p.images.length ? p.images : ['']).map((src, i) => (
            <div className="gallery__slide" key={i}>
              {src && <img className="gallery__img" src={asset(src)} alt={p.title} />}
            </div>
          ))}
        </div>

        <button className="iconbtn" aria-label="В избранное"
                onClick={() => toggleFav(p.id)}
                style={{ position: 'absolute', top: 8, right: 8, background: 'var(--veil)' }}>
          {fav ? <IcHeartOn size={19} /> : <IcHeart size={19} />}
        </button>

        {p.rrp > 0 && (
          <span className="off" style={{ position: 'absolute', top: 14, left: 14, height: 22, padding: '0 8px' }}>
            −{discountOf(p)}%
          </span>
        )}

        {p.images.length > 1 && (
          <div className="dots" style={{ position: 'absolute', left: 0, right: 0, bottom: 12 }}>
            {p.images.map((_, i) => <span key={i} className={`dot${i === page ? ' dot--on' : ''}`} />)}
          </div>
        )}
      </div>

      {/* Заголовок и цена */}
      <div className="pad" style={{ paddingTop: 20 }}>
        <div className="t-label">{p.brand}{p.volume ? ` · ${p.volume}` : ''}</div>
        <h1 className="t-h1" style={{ marginTop: 8 }}>{p.title}</h1>
        {p.tagline && <p className="t-sm muted" style={{ marginTop: 8 }}>{p.tagline}</p>}

        <div style={{ marginTop: 18 }}>
          <Price club={p.club} rrp={p.rrp} size="lg" member={member} onLock={() => go({ k: 'join' })} />
        </div>

        {p.rrp > 0 && !member && (
          <div className="save" style={{ marginTop: 16 }}>
            <IcCrown size={19} className="gold" />
            <div className="grow">
              <div className="t-micro gold">Выгода по клубной цене</div>
              <div className="save__v">{money(savingOf(p))}</div>
            </div>
          </div>
        )}

        {p.rrp === 0 && (
          <div className="note" style={{ marginTop: 16 }}>
            Продукт готовится к выходу. Цена появится вместе со стартом продаж.
          </div>
        )}
      </div>

      {/* Гарантии */}
      <div className="trust" style={{ marginTop: 22 }}>
        <div className="trust__i"><IcShield size={19} className="muted" /><span className="trust__t">Оригинал<br />от бренда</span></div>
        <div className="trust__i"><IcTruck size={19} className="muted" /><span className="trust__t">От 15 000 ₽<br />бесплатно</span></div>
        <div className="trust__i"><IcReturn size={19} className="muted" /><span className="trust__t">Возврат<br />14 дней</span></div>
      </div>

      {/* Подробности */}
      <div className="pad" style={{ marginTop: 22 }}>
        {p.desc && (
          <Accordion label="Описание" open>
            {p.desc.split('\n').filter(Boolean).map((t, i) => <p key={i}>{t}</p>)}
          </Accordion>
        )}
        {p.effects.length > 0 && (
          <Accordion label="Эффекты">
            {p.effects.map((e, i) => <div className="acc__li" key={i}>{e}</div>)}
          </Accordion>
        )}
        {p.indications.length > 0 && (
          <Accordion label="Показания">
            {p.indications.map((e, i) => <div className="acc__li" key={i}>{e}</div>)}
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
        <Accordion label="Доставка и оплата">
          <p>Курьером по Москве — 400 ₽, бесплатно при заказе от 15 000 ₽.</p>
          <p>По России — СДЭК, 2–5 дней до пункта выдачи.</p>
          <p>Возврат в течение 14 дней, если упаковка не вскрыта.</p>
        </Accordion>
      </div>

      {p.url && (
        <div className="pad" style={{ marginTop: 20 }}>
          <button className="btn btn--soft btn--block btn--sm"
                  onClick={() => { haptic.tap(); openExternal(p.url); }}>
            Страница товара у бренда<IcUpRight size={15} />
          </button>
        </div>
      )}

      {related.length > 0 && (
        <section className="sec">
          <SectionHead title={`Ещё из ${p.brand}`} />
          <div className="rail">
            {related.map((x) => <div key={x.id} style={{ width: 160 }}><ProductCard p={x} /></div>)}
          </div>
        </section>
      )}

      <div style={{ height: 96 }} />

      {/* Липкая панель покупки */}
      {p.rrp > 0 && (
        <div className="buybar">
          {member ? (
            <>
              <Qty value={qty} onChange={setQty} />
              <button className="btn btn--dark grow" onClick={() => add(p.id, qty)}>
                В корзину · {money(p.club * qty)}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--line" onClick={() => add(p.id, qty)} aria-label="Добавить в корзину">
                <IcCheck size={18} />
              </button>
              <button className="btn btn--gold grow" onClick={() => go({ k: 'join' })}>
                Вступить и купить за {money(p.club)}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
