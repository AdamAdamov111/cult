import { useEffect } from 'react';
import { Header, TabBar } from './components/Shell';
import { CartDrawer } from './components/CartDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Skel } from './components/ui';
import { Home } from './screens/Home';
import { Catalog } from './screens/Catalog';
import { Cart } from './screens/Cart';
import { Product } from './screens/Product';
import { Brand } from './screens/Brand';
import { Join } from './screens/Join';
import { Profile, Orders } from './screens/Profile';
import { useNav, type Route } from './router';
import { useShop } from './store';
import { initTelegram, setBackButton } from './lib/telegram';
import { brand, product } from './data/catalog';

function titleOf(r: Route | null): string | undefined {
  if (!r) return undefined;
  switch (r.k) {
    case 'product': return product(r.id)?.title;
    case 'brand': return brand(r.id)?.title;
    case 'join': return 'Членство CULT';
    case 'orders': return 'Заказы';
  }
}

function Screen({ route, tab }: { route: Route | null; tab: string }) {
  if (route) {
    switch (route.k) {
      case 'product': return <Product id={route.id} />;
      case 'brand': return <Brand id={route.id} />;
      case 'join': return <Join />;
      case 'orders': return <Orders />;
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
  const hydrated = useShop((s) => s.hydrated);
  const hydrate = useShop((s) => s.hydrate);
  const toast = useShop((s) => s.toast);
  const { tab, stacks, back } = useNav();

  const route = stacks[tab].length ? stacks[tab][stacks[tab].length - 1] : null;
  const depth = stacks[tab].length;

  useEffect(() => { hydrate(); initTelegram(() => {}); }, []);
  useEffect(() => { setBackButton(depth > 0, back); }, [depth, tab]);
  useEffect(() => { window.scrollTo(0, 0); }, [tab, depth, route?.k, (route as any)?.id]);

  if (!hydrated) {
    return (
      <div className="app">
        <div style={{ paddingTop: 60 }}>
          <Skel h={430} r={0} />
          <div className="pad" style={{ marginTop: 20 }}>
            <Skel h={72} r={8} />
            <div className="grid" style={{ padding: 0, marginTop: 26 }}>
              {[0, 1, 2, 3].map((i) => <Skel key={i} h={240} r={12} />)}
            </div>
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
      <CartDrawer />
      {toast && <div className="toast-root"><div className="toast">{toast}</div></div>}
    </div>
  );
}
