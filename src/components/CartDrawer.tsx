import { IcCheck } from './Icons';
import { Sheet } from './ui';
import { asset } from '../lib/assets';
import { money, plural, useCart, useShop } from '../store';
import { useNav } from '../router';
import { product } from '../data/catalog';

/**
 * Шторка «добавлено в корзину». Держит покупателя в каталоге:
 * можно продолжить выбирать или уйти на оформление одним касанием.
 */
export function CartDrawer() {
  const justAdded = useShop((s) => s.justAdded);
  const close = useShop((s) => s.closeAdded);
  const cart = useCart();
  const setTab = useNav((n) => n.setTab);

  const p = justAdded ? product(justAdded) : null;

  return (
    <Sheet open={!!p} onClose={close}>
      {p && (
        <div style={{ paddingTop: 14 }}>
          <div className="row" style={{ gap: 8, color: 'var(--ok)', marginBottom: 14 }}>
            <IcCheck size={18} />
            <span className="t-h3" style={{ color: 'var(--ok)' }}>Добавлено в корзину</span>
          </div>

          <div className="line" style={{ borderBottom: 0, paddingTop: 0 }}>
            <div className="line__media">
              <img className="line__img" src={asset(p.images[0])} alt="" />
            </div>
            <div className="grow">
              <div className="card__brand">{p.brand}</div>
              <div className="line__title clamp2" style={{ marginTop: 3 }}>{p.title}</div>
              <div className="price price--sm" style={{ marginTop: 6 }}>
                <span className="price__now">{money(p.club)}</span>
                <span className="price__was">{money(p.rrp)}</span>
              </div>
            </div>
          </div>

          {!cart.freeShipping && cart.toFreeShipping > 0 && (
            <div className="ship" style={{ marginTop: 6 }}>
              <div className="t-cap">
                До бесплатной доставки — <b style={{ color: 'var(--ink)' }}>{money(cart.toFreeShipping)}</b>
              </div>
              <div className="ship__bar">
                <div className="ship__fill"
                     style={{ width: `${Math.min(100, (cart.club / (cart.club + cart.toFreeShipping)) * 100)}%` }} />
              </div>
            </div>
          )}
          {cart.freeShipping && (
            <div className="ship" style={{ marginTop: 6 }}>
              <div className="t-cap" style={{ color: 'var(--ok)' }}>Доставка по Москве бесплатно</div>
            </div>
          )}

          <div className="between" style={{ marginTop: 18 }}>
            <span className="t-cap">В корзине {cart.lines.length} {plural(cart.lines.length, 'товар', 'товара', 'товаров')}</span>
            <span className="t-h3 num">{money(cart.club)}</span>
          </div>

          <button className="btn btn--dark btn--block" style={{ marginTop: 14 }}
                  onClick={() => { close(); setTab('cart'); }}>
            Перейти в корзину
          </button>
          <button className="btn btn--soft btn--block" style={{ marginTop: 10 }} onClick={close}>
            Продолжить покупки
          </button>
        </div>
      )}
    </Sheet>
  );
}
