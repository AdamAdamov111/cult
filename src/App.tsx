import { useEffect } from 'react';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { Home } from './screens/Home';
import { Catalog } from './screens/Catalog';
import { Cart } from './screens/Cart';
import { Profile, Orders, Coupons } from './screens/Profile';
import { Section } from './screens/Section';
import { Product } from './screens/Product';
import { Offer } from './screens/Offer';
import { Join } from './screens/Join';
import { useNav, type Route } from './router';
import { useApp } from './store';
import { useSheets } from './lib/sheets';
import { initTelegram, setBackButton, setMainButton } from './lib/telegram';
import { PRODUCT_MAP } from './data/products';
import { OFFER_MAP } from './data/offers';
import { SECTION_MAP } from './data/sections';
import { Skel } from './components/Primitives';
import { ErrorBoundary } from './components/ErrorBoundary';

function titleOf(r: Route | null): string | undefined {
  if (!r) return undefined;
  switch (r.k) {
    case 'product': return PRODUCT_MAP.get(r.id)?.title;
    case 'offer': return OFFER_MAP.get(r.id)?.brand;
    case 'section': return SECTION_MAP[r.id].title;
    case 'join': return 'Членство CULT';
    case 'orders': return 'Заказы';
    case 'coupons': return 'Купоны';
    case 'checkout': return 'Оформление';
    default: return undefined;
  }
}

function Screen({ route, tab }: { route: Route | null; tab: string }) {
  if (route) {
    switch (route.k) {
      case 'product': return <Product id={route.id} />;
      case 'offer': return <Offer id={route.id} />;
      case 'section': return <Section id={route.id} />;
      case 'join': return <Join />;
      case 'orders': return <Orders />;
      case 'coupons': return <Coupons />;
      case 'checkout': return <Cart />;
    }
  }
  switch (tab) {
    case 'catalog': return <Catalog />;
    case 'cart': return <Cart />;
    case 'profile': return <Profile />;
    default: return <Home />;
  }
}

export default function App() {
  const hydrated = useApp((s) => s.hydrated);
  const hydrate = useApp((s) => s.hydrate);
  const toast = useApp((s) => s.toast);
  const { tab, stacks, back } = useNav();
  const sheets = useSheets((s) => s.stack);
  const closeTop = useSheets((s) => s.closeTop);

  const route = stacks[tab].length ? stacks[tab][stacks[tab].length - 1] : null;
  const depth = stacks[tab].length;

  useEffect(() => { hydrate(); initTelegram(() => {}); }, []);

  /* Кнопка «назад» Telegram: сначала шторка, потом стек экранов */
  useEffect(() => {
    const show = depth > 0 || sheets.length > 0;
    setBackButton(show, () => { if (!closeTop()) back(); });
  }, [depth, sheets.length, tab]);

  /* Главная кнопка живёт только на экранах, которые её объявляют */
  useEffect(() => {
    if (!route || !['product', 'offer', 'join', 'checkout'].includes(route.k)) setMainButton(null);
    if (route === null && tab !== 'cart') setMainButton(null);
  }, [route?.k, (route as any)?.id, tab]);

  /* Сброс прокрутки при смене экрана */
  useEffect(() => { window.scrollTo(0, 0); }, [tab, depth, route?.k, (route as any)?.id]);

  if (!hydrated) {
    return (
      <div className="app">
        <div className="pad" style={{ paddingTop: 70 }}>
          <Skel h={168} r={14} />
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {[0, 1, 2, 3, 4].map((i) => <Skel key={i} h={64} w={64} r={32} />)}
          </div>
          <div className="grid2" style={{ padding: 0, marginTop: 24 }}>
            {[0, 1, 2, 3].map((i) => <Skel key={i} h={210} r={10} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header title={titleOf(route)} />
      <ErrorBoundary key={`${tab}:${route?.k ?? 'root'}:${(route as any)?.id ?? ''}`}>
        <Screen route={route} tab={tab} />
      </ErrorBoundary>
      <TabBar />
      {toast && (
        <div className="toast-root"><div className="toast">{toast}</div></div>
      )}
    </div>
  );
}
