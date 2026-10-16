import { IcBag, IcGrid, IcHome, IcUser } from './Icons';
import { useNav, type Tab } from '../router';
import { useApp } from '../store';

const TABS: { id: Tab; label: string; Icon: (p: { size?: number }) => JSX.Element }[] = [
  { id: 'home', label: 'Главная', Icon: IcHome },
  { id: 'catalog', label: 'Каталог', Icon: IcGrid },
  { id: 'cart', label: 'Корзина', Icon: IcBag },
  { id: 'profile', label: 'Профиль', Icon: IcUser },
];

export function TabBar() {
  const tab = useNav((s) => s.tab);
  const setTab = useNav((s) => s.setTab);
  const count = useApp((s) => s.cartCount());

  return (
    <nav className="tabbar" role="tablist">
      {TABS.map(({ id, label, Icon }) => (
        <button key={id} className={`tab${tab === id ? ' tab--on' : ''}`} role="tab"
                aria-selected={tab === id} onClick={() => setTab(id)}>
          <Icon size={22} />
          <span className="tab__label">{label}</span>
          {id === 'cart' && count > 0 && <span className="tab__badge num">{count}</span>}
        </button>
      ))}
    </nav>
  );
}
