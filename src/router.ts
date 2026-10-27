import { create } from 'zustand';
import { haptic } from './lib/telegram';

export type Tab = 'home' | 'catalog' | 'cart' | 'profile';

export type Route =
  | { k: 'product'; id: string }
  | { k: 'brand'; id: string }
  | { k: 'join' }
  | { k: 'orders' };

interface Nav {
  tab: Tab;
  stacks: Record<Tab, Route[]>;
  /** фильтр каталога, выставленный извне (с главной) */
  pending: { cat?: string; brandId?: string } | null;

  go: (r: Route) => void;
  back: () => void;
  setTab: (t: Tab) => void;
  openCatalog: (f: { cat?: string; brandId?: string }) => void;
  takePending: () => { cat?: string; brandId?: string } | null;
  depth: () => number;
  top: () => Route | null;
}

export const useNav = create<Nav>((set, get) => ({
  tab: 'home',
  stacks: { home: [], catalog: [], cart: [], profile: [] },
  pending: null,

  go: (r) => {
    haptic.tap();
    const { tab, stacks } = get();
    const cur = stacks[tab];
    const last = cur[cur.length - 1];
    if (last && last.k === r.k && (last as any).id === (r as any).id) return;
    set({ stacks: { ...stacks, [tab]: [...cur, r] } });
    window.scrollTo(0, 0);
  },

  back: () => {
    haptic.tap();
    const { tab, stacks } = get();
    if (!stacks[tab].length) return;
    set({ stacks: { ...stacks, [tab]: stacks[tab].slice(0, -1) } });
  },

  setTab: (t) => {
    const { tab, stacks } = get();
    if (t === tab) {
      if (stacks[t].length) set({ stacks: { ...stacks, [t]: [] } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      haptic.tap();
      return;
    }
    haptic.select();
    set({ tab: t });
    window.scrollTo(0, 0);
  },

  openCatalog: (f) => {
    haptic.tap();
    set({ tab: 'catalog', pending: f, stacks: { ...get().stacks, catalog: [] } });
    window.scrollTo(0, 0);
  },

  takePending: () => {
    const p = get().pending;
    if (p) set({ pending: null });
    return p;
  },

  depth: () => get().stacks[get().tab].length,
  top: () => {
    const s = get().stacks[get().tab];
    return s.length ? s[s.length - 1] : null;
  },
}));
