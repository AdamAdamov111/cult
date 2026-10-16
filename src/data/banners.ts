import type { Banner } from '../types';
import { PRODUCTS } from './products';

const img = (slug: string, i = 0) => PRODUCTS.find((p) => p.slug === slug)?.images[i] || '';
const id = (slug: string) => PRODUCTS.find((p) => p.slug === slug)!.id;

/**
 * Карусель на главной. Места продаются партнёрам, поэтому цель баннера —
 * любой объект: товар, раздел, предложение, внешняя ссылка.
 */
export const BANNERS: Banner[] = [
  {
    id: 'bn-join', eyebrow: 'Членство 3 000 ₽ / месяц',
    title: 'Вся косметика BYRAIN\nпо половине цены',
    sub: 'Крем за 13 500 ₽ вместо 27 000 ₽ — членство окупается первой покупкой',
    cta: 'Вступить в CULT', image: img('cream-absolute-youth', 1), tone: 'dark',
    target: { t: 'join' },
  },
  {
    id: 'bn-maldives', eyebrow: 'Travel · закрытый тариф',
    title: 'Мальдивы, вилла\nна воде, −32%',
    sub: 'Семь ночей над лагуной и гидросамолёт. Только для членов клуба',
    cta: 'Оставить заявку', image: '', tone: 'dark',
    target: { t: 'offer', id: 'tr-maldives' }, sponsored: true,
  },
  {
    id: 'bn-checkup', eyebrow: 'Здоровье · ATLAS CLINIC',
    title: 'Чекап «Долголетие»\nминус 45%',
    sub: '80+ показателей, биологический возраст и протокол от врача',
    cta: 'Получить предложение', image: '', tone: 'dark',
    target: { t: 'offer', id: 'hl-checkup' }, sponsored: true,
  },
  {
    id: 'bn-mask', eyebrow: 'Бестселлер клуба',
    title: 'Филлер-маска\nза 14 000 ₽',
    sub: 'Самый покупаемый продукт BYRAIN. С полки — 28 000 ₽',
    cta: 'Смотреть товар', image: img('maska-filler'), tone: 'dark',
    target: { t: 'product', id: id('maska-filler') },
  },
];
