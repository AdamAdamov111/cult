import { IcCheck, IcHeart, IcHeartOn, IcPlus } from './Icons';
import { Price } from './ui';
import { asset } from '../lib/assets';
import { useShop } from '../store';
import { useNav } from '../router';
import { discountOf, type Product } from '../data/catalog';

/**
 * Карточка товара. Кнопка добавления — кружок в углу фотографии,
 * поэтому высота карточек одинаковая и сетка не превращается в стену кнопок.
 */
export function ProductCard({ p }: { p: Product }) {
  const member = useShop((s) => s.isMember());
  const inCart = useShop((s) => s.qtyOf(p.id));
  const fav = useShop((s) => s.isFav(p.id));
  const add = useShop((s) => s.add);
  const toggleFav = useShop((s) => s.toggleFav);
  const go = useNav((n) => n.go);

  const open = () => go({ k: 'product', id: p.id });

  return (
    <div className="card">
      <div className="card__media" onClick={open}>
        <img className="card__img" src={asset(p.images[0])} alt={p.title} loading="lazy" decoding="async" />

        <div className="card__marks">
          {p.rrp > 0 && <span className="off">−{discountOf(p)}%</span>}
          {p.rrp === 0 && <span className="off off--quiet">СКОРО</span>}
        </div>

        <button className="card__fav" aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
                onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}>
          {fav ? <IcHeartOn size={18} /> : <IcHeart size={18} />}
        </button>

        {p.rrp > 0 && (
          <button className={`card__add${inCart ? ' card__add--in' : ''}`}
                  aria-label={inCart ? `В корзине: ${inCart}` : 'Добавить в корзину'}
                  onClick={(e) => { e.stopPropagation(); add(p.id); }}>
            {inCart ? <IcCheck size={17} /> : <IcPlus size={18} />}
          </button>
        )}
      </div>

      <div onClick={open}>
        <div className="card__brand">{p.brand}</div>
        <div className="card__title clamp2">{p.title}</div>
        {p.volume && <div className="card__vol">{p.volume}</div>}
        <div className="card__price">
          <Price club={p.club} rrp={p.rrp} size="sm" member={member}
                 onLock={() => go({ k: 'join' })} />
        </div>
      </div>
    </div>
  );
}
