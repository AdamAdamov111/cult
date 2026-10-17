export type SectionId = 'cosmetics' | 'sport' | 'travel' | 'beauty' | 'health' | 'clubs';

export interface Product {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  rrp: number;            // РРЦ с полки
  club: number;           // клубная цена (−50%)
  volume: string;
  short: string;
  images: string[];
  collections: string[];
  desc: string;
  inci: string;
  effects: string[];
  indications: string[];
  usage: string;
  url: string;
  brand: string;
  cat: string;            // ключ подраздела косметики
  hit?: boolean;
}

export interface Offer {
  id: string;
  section: Exclude<SectionId, 'cosmetics'>;
  brand: string;
  title: string;
  deal: string;           // «−40%» / «2 по цене 1»
  summary: string;
  terms: string[];
  address?: string;
  city: string;
  valid: string;
  image: string;
  kind: 'promo' | 'request';   // промокод/QR либо заявка
  value?: number;              // примерная выгода, ₽
}

export interface Story {
  id: string;
  section: SectionId;
  label: string;
  cover: string;
  slides: StorySlide[];
}
export interface StorySlide {
  image: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  target: Target;
}

export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  image: string;
  tone: 'dark' | 'light';
  target: Target;
  sponsored?: boolean;
  fit?: 'cover' | 'contain';   // товар показываем целиком, фото — кадрируем
}

export type Target =
  | { t: 'product'; id: string }
  | { t: 'offer'; id: string }
  | { t: 'brand'; id: string }
  | { t: 'section'; id: SectionId }
  | { t: 'join' }
  | { t: 'external'; url: string };

export interface CartLine { id: string; qty: number }

export interface Coupon {
  code: string;
  offerId: string;
  brand: string;
  title: string;
  deal: string;
  issued: number;
  expires: number;
}

export interface Order {
  id: string;
  ts: number;
  lines: { title: string; qty: number; price: number }[];
  shipping: number;
  total: number;
  saved: number;
  status: 'Оплачен' | 'В сборке' | 'Доставлен';
}

export interface Profile {
  name: string;
  phone: string;
  email: string;
  address: string;
  delivery: 'courier' | 'cdek' | 'pickup';
}
