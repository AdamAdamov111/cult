import type { Story } from '../types';
import { PRODUCTS } from './products';

const img = (slug: string, i = 0) => PRODUCTS.find((p) => p.slug === slug)?.images[i] || '';

/** Сторис как у Золотого Яблока: кружок на сегмент, внутри — полноэкранные карточки. */
export const STORIES: Story[] = [
  {
    id: 'st-cosmetics', section: 'cosmetics', label: 'Косметика', cover: img('cream-absolute-youth'),
    slides: [
      {
        image: img('cream-absolute-youth'), eyebrow: 'Клубная цена',
        title: 'Минус 50% на всю линию BYRAIN',
        text: 'Крем «Абсолютная Молодость» — 13 500 ₽ вместо 27 000 ₽. Одна покупка окупает членство в четыре раза.',
        cta: 'Смотреть крем', target: { t: 'product', id: PRODUCTS.find((p) => p.slug === 'cream-absolute-youth')!.id },
      },
      {
        image: img('maska-filler'), eyebrow: 'Бестселлер',
        title: 'Филлер-маска за 14 000 ₽',
        text: 'Самый покупаемый продукт бренда. В клубе — ровно половина цены с полки.',
        cta: 'В каталог', target: { t: 'section', id: 'cosmetics' },
      },
      {
        image: img('finegold'), eyebrow: 'Ампульные концентраты',
        title: 'Семь ампул, семь протоколов',
        text: 'FINE GOLD, LIQUID PLATINUM, ETERNITY PEARL и другие — от 3 875 ₽ по клубной цене.',
        cta: 'Выбрать ампулу', target: { t: 'section', id: 'cosmetics' },
      },
    ],
  },
  {
    id: 'st-sport', section: 'sport', label: 'Спорт', cover: '',
    slides: [
      {
        image: '', eyebrow: 'Спорт',
        title: 'Годовой контракт −40%',
        text: 'ENCORE FITNESS: все клубы сети, бассейн и SPA. Экономия до 68 000 ₽ за год.',
        cta: 'Открыть предложение', target: { t: 'offer', id: 'sp-encore' },
      },
      {
        image: '', eyebrow: 'Восстановление',
        title: 'Криосауна и прессотерапия вдвое дешевле',
        text: 'Шесть сессий в OXY LAB. Работает в связке с антивозрастным уходом.',
        cta: 'Забрать', target: { t: 'offer', id: 'sp-recovery' },
      },
    ],
  },
  {
    id: 'st-travel', section: 'travel', label: 'Travel', cover: '',
    slides: [
      {
        image: '', eyebrow: 'Закрытый тариф',
        title: 'Мальдивы, вилла на воде, −32%',
        text: 'Семь ночей над лагуной, полупансион и гидросамолёт. Только по заявке члена клуба.',
        cta: 'Оставить заявку', target: { t: 'offer', id: 'tr-maldives' },
      },
      {
        image: '', eyebrow: 'Швейцария',
        title: 'Лонжевити-ретрит на родине BYRAIN',
        text: 'Пять дней в клинике долголетия на Женевском озере. Для клуба — минус 25%.',
        cta: 'Подробности', target: { t: 'offer', id: 'tr-swiss' },
      },
    ],
  },
  {
    id: 'st-beauty', section: 'beauty', label: 'Красота', cover: '',
    slides: [
      {
        image: '', eyebrow: 'Красота',
        title: 'Уход на косметике BYRAIN −45%',
        text: 'MONO ATELIER: авторский 90-минутный протокол на пептидной линии бренда.',
        cta: 'Записаться', target: { t: 'offer', id: 'bt-mono' },
      },
      {
        image: '', eyebrow: 'Аппаратная косметология',
        title: 'Fotona 4D курсом, −40%',
        text: 'Лифтинг без инъекций: три процедуры и домашний уход BYRAIN в подарок.',
        cta: 'Смотреть', target: { t: 'offer', id: 'bt-laser' },
      },
    ],
  },
  {
    id: 'st-health', section: 'health', label: 'Здоровье', cover: '',
    slides: [
      {
        image: '', eyebrow: 'Здоровье',
        title: 'Чекап «Долголетие» за половину цены',
        text: 'Более 80 показателей, биологический возраст и протокол от врача. ATLAS CLINIC, −45%.',
        cta: 'Получить', target: { t: 'offer', id: 'hl-checkup' },
      },
      {
        image: '', eyebrow: 'Диагностика',
        title: 'МРТ всего тела, 3 Тесла',
        text: 'Онкоскрининг за одно посещение со скидкой 38% и вторым мнением радиолога.',
        cta: 'Открыть', target: { t: 'offer', id: 'hl-mri' },
      },
    ],
  },
];
