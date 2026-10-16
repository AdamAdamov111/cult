import raw from '../../data/brands.json';
import type { Product } from '../types';

export interface Brand {
  id: string;
  title: string;
  country: string;
  about: string;
  discount: number;      // доля скидки для членов клуба
  site: string;
  count: number;
}

interface RawBrand {
  id: string; title: string; country: string; about: string; discount: number; site: string;
  products: { title: string; subtitle: string; rrp: number; club: number; image: string; url: string }[];
}

const isSet = (t: string) => /набор|kit|set\b|дорожн/i.test(t);

/** Товары брендов-партнёров приводим к той же модели, что и каталог BYRAIN. */
export const PARTNER_PRODUCTS: Product[] = (raw as RawBrand[]).flatMap((b) =>
  b.products.map((p, i) => ({
    id: `${b.id}-${i}`,
    slug: `${b.id}-${i}`,
    title: p.title,
    tagline: p.subtitle,
    rrp: p.rrp,
    club: p.club,
    volume: '',
    short: p.subtitle,
    images: [p.image],
    collections: [b.title],
    desc: '',
    inci: '',
    effects: [],
    indications: [],
    usage: '',
    url: p.url,
    brand: b.title,
    cat: isSet(p.title) ? 'set' : 'hair',
  })),
);

export const BRANDS: Brand[] = [
  {
    id: 'byrain', title: 'BYRAIN', country: 'Швейцария',
    about: 'Пептидный антивозрастной уход за кожей лица, век и шеи. Ядро клуба.',
    discount: 0.5, site: 'https://byrain.ru', count: 0,
  },
  ...(raw as RawBrand[]).map((b) => ({
    id: b.id, title: b.title, country: b.country, about: b.about,
    discount: b.discount, site: b.site, count: b.products.length,
  })),
];

export const BRAND_MAP = new Map(BRANDS.map((b) => [b.id, b]));
export const brandIdOf = (title: string) =>
  BRANDS.find((b) => b.title === title)?.id ?? 'byrain';
