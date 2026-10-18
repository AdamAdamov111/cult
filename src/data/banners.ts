import type { Banner } from '../types';
import { PRODUCTS } from './products';

const img = (slug: string, i = 0) => PRODUCTS.find((p) => p.slug === slug)?.images[i] || '';
const pid = (slug: string) => PRODUCTS.find((p) => p.slug === slug)?.id || '';

/**
 * Карусель на главной. Места продаются партнёрам, поэтому цель баннера —
 * любой объект: товар, бренд, раздел, предложение, внешняя ссылка.
 */
export const BANNERS: Banner[] = [
  {
    id: 'bn-join', eyebrow: 'Членство 3 000 ₽ / месяц',
    title: 'Вся косметика BYRAIN\nпо половине цены',
    sub: 'Крем за 13 500 ₽ вместо 27 000 ₽ — членство окупается первой покупкой',
    cta: 'Вступить в CULT', image: img('cream-absolute-youth', 1), tone: 'dark',
    target: { t: 'join' }, fit: 'contain',
  },
  {
    id: 'bn-maldives', eyebrow: 'Travel Times · закрытый тариф',
    title: 'Мальдивы, вилла\nна воде, −32%',
    sub: 'Семь ночей над лагуной и гидросамолёт. Только для членов клуба',
    cta: 'Оставить заявку', image: 'img/tt-beach.jpg', tone: 'dark',
    target: { t: 'offer', id: 'tr-maldives' }, sponsored: true,
  },
  {
    id: 'bn-mayrveda', eyebrow: 'MAYRVEDA 5★ · Кисловодск',
    title: 'Детокс по Майеру\nминус 25%',
    sub: 'Семь дней врачебной программы в санатории мирового уровня',
    cta: 'Получить предложение', image: 'img/mayr-building.jpg', tone: 'dark',
    target: { t: 'offer', id: 'hl-mayr-detox' }, sponsored: true,
  },
  {
    id: 'bn-padel', eyebrow: 'First Padel Club',
    title: 'Падел: абонемент\nна 10 игр, −30%',
    sub: 'Крупнейший крытый падел-центр в мире — 26 кортов',
    cta: 'Смотреть', image: 'img/padel-court.jpg', tone: 'dark',
    target: { t: 'offer', id: 'sp-padel-court' }, sponsored: true,
  },
  {
    id: 'bn-omny', eyebrow: 'Omny Beauty Clinic',
    title: 'SMAS-лифтинг\nминус 45%',
    sub: 'Ultraformer MPT: безоперационный лифтинг с эффектом до двух лет',
    cta: 'Записаться', image: 'img/omny-proc5.jpg', tone: 'dark',
    target: { t: 'offer', id: 'bt-omny-smas' }, sponsored: true,
  },
  {
    id: 'bn-brands', eyebrow: 'Новое в клубе',
    title: 'GREYMY, ORIBE\nи KEVIN MURPHY',
    sub: 'Салонный уход за волосами по клубным ценам — до −35%',
    cta: 'Смотреть бренды', image: 'img/brand-greymy.jpg', tone: 'dark',
    target: { t: 'brand', id: 'greymy' },
  },
  {
    id: 'bn-mask', eyebrow: 'Бестселлер клуба',
    title: 'Филлер-маска\nза 14 000 ₽',
    sub: 'Самый покупаемый продукт BYRAIN. С полки — 28 000 ₽',
    cta: 'Смотреть товар', image: img('maska-filler'), tone: 'dark',
    target: { t: 'product', id: pid('maska-filler') }, fit: 'contain',
  },
];
