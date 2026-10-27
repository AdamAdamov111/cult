import raw from '../../data/catalog.json';
import partnerBrands from '../../data/brands.json';

export interface Product {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  rrp: number;
  club: number;
  volume: string;
  images: string[];
  desc: string;
  inci: string;
  effects: string[];
  indications: string[];
  usage: string;
  url: string;
  brand: string;
  brandId: string;
  cat: string;
  hit: boolean;
}

export interface Brand {
  id: string;
  title: string;
  country: string;
  about: string;
  discount: number;
  tile: string;
  site: string;
}

interface RawByrain {
  id: string; slug: string; title: string; tagline: string; rrp: number; club: number;
  volume: string; images: string[]; desc: string; inci: string;
  effects: string[]; indications: string[]; usage: string; url: string;
}
interface RawPartner {
  id: string; title: string; country: string; about: string; discount: number; site: string;
  products: { title: string; subtitle: string; rrp: number; club: number; image: string; url: string }[];
}

const HITS = new Set([
  'maska-filler', 'cream-absolute-youth', 'eye-cream-absolute-youth',
  'first-transformation-antiage-cream',
]);

/** Подраздел определяется по названию и объёму — сайт отдаёт только коллекции. */
function categorize(slug: string, title: string, volume: string): string {
  const t = title.toLowerCase();
  if (/set|bundle|advent/.test(slug)) return 'set';
  if (volume === '2 мл') return 'ampoule';
  if (t.includes('маск')) return 'mask';
  if (t.includes('сыворотка')) return 'serum';
  if (t.includes('век')) return 'eyes';
  if (/свеча|svecha/.test(slug)) return 'home';
  return 'face';
}

const byrain: Product[] = (raw.products as RawByrain[])
  .filter((p) => !/svecha/.test(p.slug))
  .map((p) => ({
    id: p.id, slug: p.slug, title: p.title, tagline: p.tagline,
    rrp: p.rrp, club: p.club, volume: p.volume, images: p.images,
    desc: p.desc, inci: p.inci, effects: p.effects, indications: p.indications,
    usage: p.usage, url: p.url,
    brand: 'BYRAIN', brandId: 'byrain',
    cat: categorize(p.slug, p.title, p.volume),
    hit: HITS.has(p.slug),
  }));

const isHairSet = (t: string) => /набор|kit|set\b|дорожн/i.test(t);

const partners: Product[] = (partnerBrands as RawPartner[]).flatMap((b) =>
  b.products.map((p, i) => ({
    id: `${b.id}-${i}`, slug: `${b.id}-${i}`,
    title: p.title, tagline: p.subtitle,
    rrp: p.rrp, club: p.club, volume: '',
    images: [p.image],
    desc: '', inci: '', effects: [], indications: [], usage: '',
    url: p.url,
    brand: b.title, brandId: b.id,
    cat: isHairSet(p.title) ? 'set' : 'hair',
    hit: i < 2,
  })),
);

export const PRODUCTS: Product[] = [...byrain, ...partners];
export const ON_SALE = PRODUCTS.filter((p) => p.rrp > 0);
export const COMING = PRODUCTS.filter((p) => p.rrp === 0);

const INDEX = new Map(PRODUCTS.map((p) => [p.id, p]));
export const product = (id: string) => INDEX.get(id);

export const BRANDS: Brand[] = [
  {
    id: 'byrain', title: 'BYRAIN', country: 'Швейцария',
    about: 'Пептидный антивозрастной уход за кожей лица, век и шеи. Формулы с факторами роста и фитоэстрогенами.',
    discount: 0.5, tile: 'img/tile-byrain.jpg', site: 'https://byrain.ru',
  },
  ...(partnerBrands as RawPartner[]).map((b) => ({
    id: b.id, title: b.title, country: b.country, about: b.about,
    discount: b.discount, tile: `img/tile-${b.id}.jpg`, site: b.site,
  })),
];

export const brand = (id: string) => BRANDS.find((b) => b.id === id);

export const CATEGORIES = [
  { id: 'all', title: 'Всё' },
  { id: 'face', title: 'Лицо' },
  { id: 'eyes', title: 'Глаза' },
  { id: 'serum', title: 'Сыворотки' },
  { id: 'mask', title: 'Маски' },
  { id: 'ampoule', title: 'Ампулы' },
  { id: 'hair', title: 'Волосы' },
  { id: 'set', title: 'Наборы' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];
export type SortId = 'popular' | 'cheap' | 'rich' | 'discount';

export const SORTS: { id: SortId; title: string }[] = [
  { id: 'popular', title: 'Популярные' },
  { id: 'cheap', title: 'Сначала дешевле' },
  { id: 'rich', title: 'Сначала дороже' },
  { id: 'discount', title: 'Больше выгода' },
];

export interface Filter {
  cat: CategoryId;
  brandId: string;      // 'all' | id бренда
  sort: SortId;
}

export function filterProducts({ cat, brandId, sort }: Filter): Product[] {
  let list = ON_SALE;
  if (cat !== 'all') list = list.filter((p) => p.cat === cat);
  if (brandId !== 'all') list = list.filter((p) => p.brandId === brandId);

  const sorted = [...list];
  switch (sort) {
    case 'cheap': sorted.sort((a, b) => a.club - b.club); break;
    case 'rich': sorted.sort((a, b) => b.club - a.club); break;
    case 'discount': sorted.sort((a, b) => (b.rrp - b.club) - (a.rrp - a.club)); break;
    default: sorted.sort((a, b) => Number(b.hit) - Number(a.hit) || b.rrp - a.rrp);
  }
  return sorted;
}

export function countFor(cat: CategoryId, brandId: string): number {
  return filterProducts({ cat, brandId, sort: 'popular' }).length;
}

export function search(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return PRODUCTS.filter((p) =>
    p.title.toLowerCase().includes(q) ||
    p.tagline.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q),
  ).slice(0, 40);
}

export const hits = ON_SALE.filter((p) => p.hit);
export const discountOf = (p: Product) => Math.round((1 - p.club / p.rrp) * 100);
export const savingOf = (p: Product) => p.rrp - p.club;

export const MEMBERSHIP_PRICE = 3000;
export const FREE_SHIPPING_FROM = 15000;
export const SHIPPING_COST = 400;
