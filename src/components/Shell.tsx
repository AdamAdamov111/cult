import { useEffect, useState } from 'react';
import { IcBag, IcGrid, IcHome, IcLeft, IcSearch, IcUser } from './Icons';
import { useShop } from '../store';
import { useNav, type Tab } from '../router';

/* ---------------- Шапка ---------------- */

export function Header({ title }: { title?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const member = useShop((s) => s.isMember());
  const until = useShop((s) => s.memberUntil);
  const count = useShop((s) => s.cartCount());
  const { go, setTab, back, depth } = useNav();
  const d = depth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const untilTxt = until
    ? new Date(until).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    : '';

  return (
    <header className={`hdr${scrolled ? ' hdr--line' : ''}`}>
      <div className="hdr__bar">
        {d > 0 ? (
          <button className="iconbtn" onClick={back} aria-label="Назад" style={{ marginLeft: -10 }}>
            <IcLeft size={21} />
          </button>
        ) : (
          <span className="wordmark" style={{ fontSize: 15 }}>Cult</span>
        )}

        {title && <span className="hdr__title clamp1 grow">{title}</span>}
        {!title && <span className="grow" />}

        {!title && (
          <button className="iconbtn" onClick={() => setTab('catalog')} aria-label="Поиск">
            <IcSearch size={20} />
          </button>
        )}

        {d === 0 && !title && (
          member ? (
            <button className="chip-status chip-status--on" onClick={() => setTab('profile')}>
              <span className="chip-status__dot" />до {untilTxt}
            </button>
          ) : (
            <button className="chip-status chip-status--join" onClick={() => go({ k: 'join' })}>
              Вступить
            </button>
          )
        )}

        <button className="iconbtn" onClick={() => setTab('cart')} aria-label="Корзина" style={{ marginRight: -8 }}>
          <IcBag size={20} />
          {count > 0 && <span className="iconbtn__dot num">{count}</span>}
        </button>
      </div>
    </header>
  );
}

/* ---------------- Нижнее меню ---------------- */

const TABS: { id: Tab; label: string; Icon: (p: { size?: number }) => JSX.Element }[] = [
  { id: 'home', label: 'Главная', Icon: IcHome },
  { id: 'catalog', label: 'Каталог', Icon: IcGrid },
  { id: 'cart', label: 'Корзина', Icon: IcBag },
  { id: 'profile', label: 'Профиль', Icon: IcUser },
];

export function TabBar() {
  const tab = useNav((s) => s.tab);
  const setTab = useNav((s) => s.setTab);
  const count = useShop((s) => s.cartCount());

  return (
    <nav className="tabs" role="tablist">
      {TABS.map(({ id, label, Icon }) => (
        <button key={id} className={`tab${tab === id ? ' tab--on' : ''}`} role="tab"
                aria-selected={tab === id} onClick={() => setTab(id)}>
          <Icon size={21} />
          <span className="tab__cap">{label}</span>
          {id === 'cart' && count > 0 && <span className="tab__dot num">{count}</span>}
        </button>
      ))}
    </nav>
  );
}
