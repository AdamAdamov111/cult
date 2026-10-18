/** Выгрузка контента приложения в JSON для iOS: один источник правды с вебом. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { SECTIONS, COSMETICS_CATS, MEMBERSHIP_PRICE } from '../src/data/sections';
import { OFFERS } from '../src/data/offers';
import { STORIES } from '../src/data/stories';
import { BANNERS } from '../src/data/banners';
import { PRODUCTS } from '../src/data/products';
import { BRANDS } from '../src/data/brands';

const out = {
  generated: new Date().toISOString().slice(0, 10),
  membershipPrice: MEMBERSHIP_PRICE,
  sections: SECTIONS,
  cosmeticsCats: COSMETICS_CATS,
  brands: BRANDS,
  products: PRODUCTS,
  offers: OFFERS,
  stories: STORIES,
  banners: BANNERS,
};

mkdirSync('ios/CULT/Resources', { recursive: true });
writeFileSync('ios/CULT/Resources/content.json', JSON.stringify(out, null, 1), 'utf8');
console.log(
  `content.json: ${out.products.length} товаров, ${out.offers.length} предложений, ` +
  `${out.sections.length} разделов, ${out.brands.length} брендов, ${out.stories.length} сторис`,
);
