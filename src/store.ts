import { useMemo } from 'react';
import { create } from 'zustand';
import type { CartLine, Coupon, Order, Profile } from './types';
import { PRODUCT_MAP } from './data/products';
import { OFFER_MAP } from './data/offers';
import { MEMBERSHIP_PRICE } from './data/sections';
import { storage, haptic, tgUser } from './lib/telegram';

const KEY = 'cult.state.v1';
const MONTH = 30 * 24 * 3600 * 1000;

interface Persisted {
  memberUntil: number | null;
  autoRenew: boolean;
  cart: CartLine[];
  profile: Profile;
  coupons: Coupon[];
  orders: Order[];
  viewed: string[];
  favs: string[];
  savedTotal: number;
}

interface AppState extends Persisted {
  hydrated: boolean;
  toast: string | null;

  isMember: () => boolean;
  /* корзина */
  qtyOf: (id: string) => number;
  cartCount: () => number;
  cartTotals: () => { club: number; rrp: number; saved: number };
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
  /* клуб */
  join: () => void;
  cancelRenew: () => void;
  /* купоны */
  couponFor: (offerId: string) => Coupon | undefined;
  issueCoupon: (offerId: string) => Coupon;
  /* заказы */
  placeOrder: (shipping: number) => Order;
  /* прочее */
  setProfile: (p: Partial<Profile>) => void;
  markViewed: (id: string) => void;
  toggleFav: (id: string) => void;
  say: (m: string) => void;
  hydrate: () => Promise<void>;
}

const emptyProfile: Profile = {
  name: tgUser()?.name || '', phone: '', email: '', address: '', delivery: 'courier',
};

const defaults: Persisted = {
  memberUntil: null, autoRenew: true, cart: [], profile: emptyProfile,
  coupons: [], orders: [], viewed: [], favs: [], savedTotal: 0,
};

let saveTimer: number | undefined;

export const useApp = create<AppState>((set, get) => {
  /** Пишем состояние в CloudStorage с дебаунсом. */
  const persist = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const s = get();
      const data: Persisted = {
        memberUntil: s.memberUntil, autoRenew: s.autoRenew, cart: s.cart, profile: s.profile,
        coupons: s.coupons, orders: s.orders, viewed: s.viewed, favs: s.favs, savedTotal: s.savedTotal,
      };
      storage.set(KEY, JSON.stringify(data));
    }, 400) as unknown as number;
  };
  const patch = (p: Partial<AppState>) => { set(p); persist(); };

  return {
    ...defaults,
    hydrated: false,
    toast: null,

    isMember: () => {
      const u = get().memberUntil;
      return !!u && u > Date.now();
    },

    qtyOf: (id) => get().cart.find((l) => l.id === id)?.qty ?? 0,
    cartCount: () => get().cart.reduce((s, l) => s + l.qty, 0),

    cartTotals: () => {
      let club = 0, rrp = 0;
      for (const l of get().cart) {
        const p = PRODUCT_MAP.get(l.id);
        if (!p) continue;
        club += p.club * l.qty;
        rrp += p.rrp * l.qty;
      }
      return { club, rrp, saved: rrp - club };
    },

    add: (id, qty = 1) => {
      const cart = [...get().cart];
      const i = cart.findIndex((l) => l.id === id);
      if (i >= 0) cart[i] = { ...cart[i], qty: Math.min(99, cart[i].qty + qty) };
      else cart.push({ id, qty });
      haptic.ok();
      patch({ cart, toast: 'Добавлено в корзину' });
      setTimeout(() => set({ toast: null }), 1900);
    },

    setQty: (id, qty) => {
      haptic.select();
      if (qty <= 0) { get().removeLine(id); return; }
      patch({ cart: get().cart.map((l) => (l.id === id ? { ...l, qty: Math.min(99, qty) } : l)) });
    },

    removeLine: (id) => { haptic.tap(); patch({ cart: get().cart.filter((l) => l.id !== id) }); },
    clearCart: () => patch({ cart: [] }),

    join: () => {
      haptic.ok();
      const base = get().isMember() ? get().memberUntil! : Date.now();
      patch({ memberUntil: base + MONTH, autoRenew: true, toast: 'Добро пожаловать в CULT' });
      setTimeout(() => set({ toast: null }), 2200);
    },

    cancelRenew: () => patch({ autoRenew: false, toast: 'Автопродление отключено' }),

    couponFor: (offerId) => get().coupons.find((c) => c.offerId === offerId && c.expires > Date.now()),

    issueCoupon: (offerId) => {
      const existing = get().couponFor(offerId);
      if (existing) return existing;
      const o = OFFER_MAP.get(offerId)!;
      const code = 'CULT-' + Math.random().toString(36).slice(2, 7).toUpperCase() + '-' + String(Date.now()).slice(-3);
      const c: Coupon = {
        code, offerId, brand: o.brand, title: o.title, deal: o.deal,
        issued: Date.now(), expires: Date.now() + 14 * 24 * 3600 * 1000,
      };
      haptic.ok();
      patch({ coupons: [c, ...get().coupons] });
      return c;
    },

    placeOrder: (shipping) => {
      const s = get();
      const t = s.cartTotals();
      const order: Order = {
        id: 'C' + String(Date.now()).slice(-7),
        ts: Date.now(),
        lines: s.cart.map((l) => {
          const p = PRODUCT_MAP.get(l.id)!;
          return { title: p.title, qty: l.qty, price: p.club };
        }),
        shipping, total: t.club + shipping, saved: t.saved, status: 'Оплачен',
      };
      haptic.ok();
      patch({ orders: [order, ...s.orders], cart: [], savedTotal: s.savedTotal + t.saved });
      return order;
    },

    setProfile: (p) => patch({ profile: { ...get().profile, ...p } }),

    markViewed: (id) => {
      if (get().viewed.includes(id)) return;
      patch({ viewed: [...get().viewed, id] });
    },

    toggleFav: (id) => {
      haptic.tap();
      const favs = get().favs;
      patch({ favs: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id] });
    },

    say: (m) => { set({ toast: m }); setTimeout(() => set({ toast: null }), 1900); },

    hydrate: async () => {
      const txt = await Promise.race([storage.get(KEY), new Promise<null>((r) => setTimeout(() => r(null), 2000))]);
      if (txt) {
        try {
          const d = JSON.parse(txt) as Partial<Persisted>;
          set({
            ...defaults, ...d,
            profile: { ...emptyProfile, ...(d.profile || {}) },
            hydrated: true,
          });
          return;
        } catch { /* битое состояние — стартуем чисто */ }
      }
      set({ hydrated: true });
    },
  };
});

export const MEMBERSHIP = MEMBERSHIP_PRICE;

/**
 * Итоги корзины. Отдельным хуком, а не селектором: селектор, который
 * возвращает новый объект на каждый вызов, вводит zustand в бесконечный рендер.
 */
export function useCartTotals() {
  const cart = useApp((s) => s.cart);
  return useMemo(() => {
    let club = 0, rrp = 0;
    for (const l of cart) {
      const p = PRODUCT_MAP.get(l.id);
      if (!p) continue;
      club += p.club * l.qty;
      rrp += p.rrp * l.qty;
    }
    return { club, rrp, saved: rrp - club };
  }, [cart]);
}
