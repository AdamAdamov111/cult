import type { SectionId } from '../types';

export interface SectionDef {
  id: SectionId;
  title: string;
  kicker: string;
  sub: string;
  from: string;   // градиент обложки
  to: string;
}

export const SECTIONS: SectionDef[] = [
  { id: 'cosmetics', title: 'КОСМЕТИКА', kicker: 'BYRAIN & топ-бренды', sub: 'Вся продукция −50% от РРЦ',       from: '#0a0a0a', to: '#3a322a' },
  { id: 'sport',     title: 'СПОРТ',     kicker: 'Клубные условия',     sub: 'Абонементы и тренировки',          from: '#0e1418', to: '#27343a' },
  { id: 'travel',    title: 'TRAVEL',    kicker: 'Только для членов',   sub: 'Путёвки по закрытым ценам',        from: '#0a1520', to: '#1c3b4a' },
  { id: 'beauty',    title: 'КРАСОТА',   kicker: 'Топ-салоны Москвы',   sub: 'Процедуры и услуги со скидкой',    from: '#1a0f14', to: '#3e2630' },
  { id: 'health',    title: 'ЗДОРОВЬЕ',  kicker: 'Лучшие клиники',      sub: 'Чекапы и анализы для клуба',       from: '#0a1512', to: '#1d342c' },
];

export const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<SectionId, SectionDef>;

/** Подразделы раздела «Косметика». */
export const COSMETICS_CATS = [
  { id: 'all',     title: 'Всё' },
  { id: 'face',    title: 'Лицо' },
  { id: 'eyes',    title: 'Глаза' },
  { id: 'serum',   title: 'Сыворотки' },
  { id: 'mask',    title: 'Маски' },
  { id: 'ampoule', title: 'Ампулы' },
  { id: 'set',     title: 'Наборы' },
  { id: 'home',    title: 'Дом' },
] as const;

export const MEMBERSHIP_PRICE = 3000;
export const CLUB_DISCOUNT = 0.5;
