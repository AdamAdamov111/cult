import { create } from 'zustand';
import type { SectionId } from './types';
import { haptic } from './lib/telegram';

export type Tab = 'home' | 'catalog' | 'cart' | 'profile';

export type Route =
  | { k: 'product'; id: string }
  | { k: 'offer'; id: string }
  | { k: 'section'; id: SectionId }
  | { k: 'join' }
  | { k: 'orders' }
  | { k: 'coupons' }
  | { k: 'checkout' };

interface Nav {
  tab: Tab;
  stacks: Record<Tab, Route[]>;
  go: (r: Route) => void;
  back: () => void;
  setTab: (t: Tab) => void;
  resetTab: (t: Tab) => void;
  depth: () => number;
  top: () => Route | null;
}

export const useNav = create<Nav>((set, get) => ({
  tab: 'home',
  stacks: { home: [], catalog: [], cart: [], profile: [] },

  go: (r) => {
    haptic.tap();
    const { tab, stacks } = get();
    const cur = stacks[tab];
    const last = cur[cur.length - 1];
    // не пушим тот же экран дважды
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
      // повторный тап по активной вкладке — наверх стека и к началу списка
      if (stacks[t].length) set({ stacks: { ...stacks, [t]: [] } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      haptic.tap();
      return;
    }
    haptic.select();
    set({ tab: t });
    window.scrollTo(0, 0);
  },

  resetTab: (t) => set({ tab: t, stacks: { ...get().stacks, [t]: [] } }),

  depth: () => get().stacks[get().tab].length,
  top: () => {
    const s = get().stacks[get().tab];
    return s.length ? s[s.length - 1] : null;
  },
}));
