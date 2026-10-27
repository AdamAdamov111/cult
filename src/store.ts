import { useMemo } from 'react';
import { create } from 'zustand';
import { product, FREE_SHIPPING_FROM, SHIPPING_COST } from './data/catalog';
import { storage, haptic } from './lib/telegram';

const KEY = 'cult.shop.v1';
const MONTH = 30 * 24 * 3600 * 1000;

export interface Profile {
  name: string; phone: string; email: string; address: string;
  delivery: 'courier' | 'cdek' | 'pickup';
}

export interface OrderLine { title: string; qty: number; price: number }
export interface Order {
  id: string; ts: number; lines: OrderLine[];
  shipping: number; total: number; saved: number; status: string;
}

interface Persisted {
  memberUntil: number | null;
  autoRenew: boolean;
  cart: Record<string, number>;
  favs: string[];
  profile: Profile;
  orders: Order[];
  savedTotal: number;
}

const emptyProfile: Profile = {
  name: '', phone: '', email: '', address: '', delivery: 'courier',
};

const defaults: Persisted = {
  memberUntil: null, autoRenew: true, cart: {}, favs: [],
  profile: emptyProfile, orders: [], savedTotal: 0,
};

interface Shop extends Persisted {
  hydrated: boolean;
  toast: string | null;
  justAdded: string | null;     // товар, по которому открыта шторка корзины

  isMember: () => boolean;
  cartCount: () => number;
  qtyOf: (id: string) => number;

  add: (id: string, qty?: number, silent?: boolean) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clearCart: () => void;
  closeAdded: () => void;

  toggleFav: (id: string) => void;
  isFav: (id: string) => boolean;

  join: (months?: number) => void;
  cancelRenew: () => void;

  setProfile: (p: Partial<Profile>) => void;
  placeOrder: (shipping: number) => Order;

  say: (m: string) => void;
  hydrate: () => Promise<void>;
  reset: () => void;
}

let saveTimer: number | undefined;
let toastTimer: number | undefined;

export const useShop = create<Shop>((set, get) => {
  const persist = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const s = get();
      const data: Persisted = {
        memberUntil: s.memberUntil, autoRenew: s.autoRenew, cart: s.cart,
        favs: s.favs, profile: s.profile, orders: s.orders, savedTotal: s.savedTotal,
      };
      storage.set(KEY, JSON.stringify(data));
    }, 350) as unknown as number;
  };
  const patch = (p: Partial<Shop>) => { set(p); persist(); };

  return {
    ...defaults,
    hydrated: false,
    toast: null,
    justAdded: null,

    isMember: () => {
      const u = get().memberUntil;
      return !!u && u > Date.now();
    },

    cartCount: () => Object.values(get().cart).reduce((s, n) => s + n, 0),
    qtyOf: (id) => get().cart[id] ?? 0,

    add: (id, qty = 1, silent = false) => {
      const cart = { ...get().cart };
      cart[id] = Math.min(99, (cart[id] ?? 0) + qty);
      haptic.ok();
      patch({ cart, justAdded: silent ? null : id });
    },

    setQty: (id, qty) => {
      haptic.select();
      const cart = { ...get().cart };
      if (qty <= 0) delete cart[id]; else cart[id] = Math.min(99, qty);
      patch({ cart });
    },

    remove: (id) => {
      haptic.tap();
      const cart = { ...get().cart };
      delete cart[id];
      patch({ cart });
    },

    clearCart: () => patch({ cart: {} }),
    closeAdded: () => set({ justAdded: null }),

    toggleFav: (id) => {
      haptic.tap();
      const favs = get().favs;
      patch({ favs: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id] });
    },
    isFav: (id) => get().favs.includes(id),

    join: (months = 1) => {
      haptic.ok();
      const base = get().isMember() ? get().memberUntil! : Date.now();
      patch({ memberUntil: base + MONTH * months, autoRenew: true });
      get().say('Добро пожаловать в CULT');
    },

    cancelRenew: () => { patch({ autoRenew: false }); get().say('Автопродление отключено'); },

    setProfile: (p) => patch({ profile: { ...get().profile, ...p } }),

    placeOrder: (shipping) => {
      const s = get();
      const lines: OrderLine[] = [];
      let club = 0, rrp = 0;
      for (const [id, qty] of Object.entries(s.cart)) {
        const p = product(id);
        if (!p) continue;
        lines.push({ title: p.title, qty, price: p.club });
        club += p.club * qty;
        rrp += p.rrp * qty;
      }
      const order: Order = {
        id: 'C' + String(Date.now()).slice(-7),
        ts: Date.now(), lines, shipping,
        total: club + shipping, saved: rrp - club, status: 'Оплачен',
      };
      haptic.ok();
      patch({ orders: [order, ...s.orders], cart: {}, savedTotal: s.savedTotal + (rrp - club) });
      return order;
    },

    say: (m) => {
      clearTimeout(toastTimer);
      set({ toast: m });
      toastTimer = setTimeout(() => set({ toast: null }), 1900) as unknown as number;
    },

    hydrate: async () => {
      const txt = await Promise.race([
        storage.get(KEY),
        new Promise<null>((r) => setTimeout(() => r(null), 2000)),
      ]);
      if (txt) {
        try {
          const d = JSON.parse(txt) as Partial<Persisted>;
          set({ ...defaults, ...d, profile: { ...emptyProfile, ...(d.profile || {}) }, hydrated: true });
          return;
        } catch { /* битое состояние — стартуем чисто */ }
      }
      set({ hydrated: true });
    },

    reset: () => { patch({ ...defaults }); get().say('Состояние сброшено'); },
  };
});

/** Итоги корзины. Отдельным хуком: селектор с новым объектом зациклил бы рендер. */
export function useCart() {
  const cart = useShop((s) => s.cart);
  return useMemo(() => {
    const lines = Object.entries(cart)
      .map(([id, qty]) => ({ product: product(id)!, qty }))
      .filter((l) => l.product);
    const club = lines.reduce((s, l) => s + l.product.club * l.qty, 0);
    const rrp = lines.reduce((s, l) => s + l.product.rrp * l.qty, 0);
    const freeShipping = club >= FREE_SHIPPING_FROM;
    return {
      lines, club, rrp, saved: rrp - club, freeShipping,
      toFreeShipping: Math.max(0, FREE_SHIPPING_FROM - club),
      shipping: freeShipping ? 0 : SHIPPING_COST,
    };
  }, [cart]);
}

export const money = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

/** Склонение: plural(1,'товар','товара','товаров') → «товар». */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
