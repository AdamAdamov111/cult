import type { SectionId } from '../types';

export interface SectionDef {
  id: SectionId;
  title: string;
  kicker: string;
  sub: string;
  image: string;  // фото обложки
  ratio: string;  // собственное соотношение кадра — чтобы он не кадрировался
  from: string;   // запасной градиент
  to: string;
}

export const SECTIONS: SectionDef[] = [
  { id: 'cosmetics', title: 'КОСМЕТИКА', kicker: 'BYRAIN и топ-бренды',   sub: 'BYRAIN −50%, партнёры до −35%',    image: 'img/sec-cosmetics.jpg', ratio: '1600/900', from: '#0a0a0a', to: '#3a322a' },
  { id: 'sport',     title: 'СПОРТ',     kicker: 'First Padel · World Class', sub: 'Корты, контракты, тренировки', image: 'img/sec-sport.jpg',     ratio: '1312/672', from: '#0e1418', to: '#27343a' },
  { id: 'travel',    title: 'TRAVEL',    kicker: 'Travel Times · Seneshal',   sub: 'Авторские туры и отели',      image: 'img/sec-travel.jpg',    ratio: '1312/672', from: '#0a1520', to: '#1c3b4a' },
  { id: 'beauty',    title: 'КРАСОТА',   kicker: 'Omny Beauty Clinic',        sub: 'Косметология и процедуры',     image: 'img/sec-beauty.jpg',    ratio: '1312/672', from: '#1a0f14', to: '#3e2630' },
  { id: 'clubs',     title: 'КЛУБЫ',     kicker: 'А-Клуб · Атланты · Club 500', sub: 'Кросс-членство и доступ',      image: 'img/sec-clubs.jpg',     ratio: '1312/672', from: '#0a0a0a', to: '#2a2420' },
  { id: 'health',    title: 'ЗДОРОВЬЕ',  kicker: 'MAYRVEDA · МЕДСИ · Жар-Птица', sub: 'Чекапы, ретриты, баня',    image: 'img/sec-health.jpg',    ratio: '1600/900', from: '#0a1512', to: '#1d342c' },
];

export const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<SectionId, SectionDef>;

/** Подразделы раздела «Косметика». */
export const COSMETICS_CATS = [
  { id: 'all',     title: 'Всё' },
  { id: 'face',    title: 'Лицо' },
  { id: 'eyes',    title: 'Глаза' },
  { id: 'serum',   title: 'Сыворотки' },
  { id: 'mask',    title: 'Маски' },
  { id: 'hair',    title: 'Волосы' },
  { id: 'ampoule', title: 'Ампулы' },
  { id: 'set',     title: 'Наборы' },
  { id: 'home',    title: 'Дом' },
] as const;

export const MEMBERSHIP_PRICE = 3000;
export const CLUB_DISCOUNT = 0.5;
