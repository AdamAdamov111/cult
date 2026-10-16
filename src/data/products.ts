import raw from '../../data/catalog.json';
import type { Product } from '../types';

interface RawProduct {
  id: string; slug: string; title: string; tagline: string; rrp: number; club: number;
  volume: string; short: string; images: string[]; collections: string[];
  desc: string; inci: string; effects: string[]; indications: string[]; usage: string; url: string;
}

/** Подраздел определяется по слагу и названию — сайт отдаёт только коллекции. */
function categorize(p: RawProduct): string {
  const s = p.slug, t = p.title.toLowerCase();
  if (s.includes('svecha')) return 'home';
  if (s.includes('set') || s.includes('bundle') || s.includes('advent')) return 'set';
  if (p.volume === '2 мл') return 'ampoule';
  if (t.includes('маска') || t.includes('маск')) return 'mask';
  if (t.includes('сыворотка')) return 'serum';
  if (t.includes('век')) return 'eyes';
  return 'face';
}

const HITS = new Set(['maska-filler', 'cream-absolute-youth', 'eye-cream-absolute-youth', 'first-transformation-antiage-cream']);

export const PRODUCTS: Product[] = (raw.products as RawProduct[]).map((p) => ({
  ...p,
  brand: 'BYRAIN',
  cat: categorize(p),
  hit: HITS.has(p.slug),
}));

export const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));

/** В продаже — только то, у чего есть цена на сайте. Остальное показываем как «скоро». */
export const ON_SALE = PRODUCTS.filter((p) => p.rrp > 0);
export const COMING = PRODUCTS.filter((p) => p.rrp === 0);

export const HIT_PRODUCTS = ON_SALE.filter((p) => p.hit);

export function byCat(cat: string): Product[] {
  const list = cat === 'all' ? [...ON_SALE, ...COMING] : PRODUCTS.filter((p) => p.cat === cat);
  return [...list].sort((a, b) => (b.rrp ? 1 : 0) - (a.rrp ? 1 : 0) || b.rrp - a.rrp);
}

export function searchProducts(q: string): Product[] {
  const n = q.trim().toLowerCase();
  if (n.length < 2) return [];
  return PRODUCTS.filter((p) =>
    p.title.toLowerCase().includes(n) ||
    p.tagline.toLowerCase().includes(n) ||
    p.collections.some((c) => c.toLowerCase().includes(n)),
  ).slice(0, 24);
}

export const CATALOG_DATE: string = raw.scraped;
