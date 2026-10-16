import type { Story } from '../types';
import { PRODUCTS } from './products';

const img = (slug: string, i = 0) => PRODUCTS.find((p) => p.slug === slug)?.images[i] || '';
const pid = (slug: string) => PRODUCTS.find((p) => p.slug === slug)?.id || '';

/** Сторис по сегментам клуба — вход в каждое направление. */
export const STORIES: Story[] = [
  {
    id: 'st-cosmetics', section: 'cosmetics', label: 'Косметика', cover: img('cream-absolute-youth'),
    slides: [
      {
        image: img('cream-absolute-youth'), eyebrow: 'Клубная цена',
        title: 'Минус 50% на всю линию BYRAIN',
        text: 'Крем «Абсолютная Молодость» — 13 500 ₽ вместо 27 000 ₽. Одна покупка окупает членство в четыре раза.',
        cta: 'Смотреть крем', target: { t: 'product', id: pid('cream-absolute-youth') },
      },
      {
        image: 'img/brand-greymy.jpg', eyebrow: 'Новый бренд в клубе',
        title: 'GREYMY — уход за волосами, −35%',
        text: 'Профессиональная линия: маски, шампуни, несмываемый уход и стайлинг по клубным ценам.',
        cta: 'Открыть бренд', target: { t: 'brand', id: 'greymy' },
      },
      {
        image: 'img/brand-oribe.jpg', eyebrow: 'ORIBE и KEVIN MURPHY',
        title: 'Салонные бренды −30%',
        text: 'Культовые линии из authentica.love теперь доступны членам клуба по закрытым ценам.',
        cta: 'Смотреть', target: { t: 'brand', id: 'oribe' },
      },
    ],
  },
  {
    id: 'st-sport', section: 'sport', label: 'Спорт', cover: 'img/padel-court.jpg',
    slides: [
      {
        image: 'img/padel-court.jpg', eyebrow: 'First Padel Club',
        title: 'Абонемент на 10 игр, −30%',
        text: 'Крупнейший крытый падел-центр в мире: 26 кортов, ракетки и мячи включены.',
        cta: 'Открыть предложение', target: { t: 'offer', id: 'sp-padel-court' },
      },
      {
        image: 'img/wc-club.jpg', eyebrow: 'World Class Романов',
        title: 'Годовой контракт −35%',
        text: 'Клуб у метро Арбатская: бассейн, SPA и групповые программы. Выгода до 115 000 ₽ за год.',
        cta: 'Забрать', target: { t: 'offer', id: 'sp-wc-year' },
      },
    ],
  },
  {
    id: 'st-travel', section: 'travel', label: 'Travel', cover: 'img/tt-beach.jpg',
    slides: [
      {
        image: 'img/tt-beach.jpg', eyebrow: 'Travel Times · закрытый тариф',
        title: 'Мальдивы, вилла на воде, −32%',
        text: 'Семь ночей над лагуной, полупансион и гидросамолёт. Только по заявке члена клуба.',
        cta: 'Оставить заявку', target: { t: 'offer', id: 'tr-maldives' },
      },
      {
        image: 'img/tt-aurora.jpg', eyebrow: 'Норвегия',
        title: 'Северное сияние, −25%',
        text: 'Тромсё и фьорды: стеклянный лодж, выезды с гидом-фотографом, китовое сафари.',
        cta: 'Подробности', target: { t: 'offer', id: 'tr-aurora' },
      },
      {
        image: 'img/sen-lake.jpg', eyebrow: 'Подмосковье',
        title: 'Уикенд в Seneshal, −35%',
        text: 'Дизайнерский спа-отель на берегу озера в часе езды от Москвы.',
        cta: 'Смотреть', target: { t: 'offer', id: 'tr-seneshal' },
      },
    ],
  },
  {
    id: 'st-beauty', section: 'beauty', label: 'Красота', cover: 'img/omny-face.jpg',
    slides: [
      {
        image: 'img/omny-face.jpg', eyebrow: 'Omny Beauty',
        title: 'SMAS-лифтинг Ultraformer, −45%',
        text: 'Безоперационный лифтинг на глубине SMAS. Эффект держится до двух лет.',
        cta: 'Записаться', target: { t: 'offer', id: 'bt-omny-smas' },
      },
      {
        image: 'img/omny-proc.jpg', eyebrow: 'Аппаратная косметология',
        title: 'Morpheus8 курсом, −35%',
        text: 'Три процедуры микроигольчатого RF-лифтинга лица и шеи с постуходом.',
        cta: 'Смотреть', target: { t: 'offer', id: 'bt-omny-morpheus' },
      },
    ],
  },
  {
    id: 'st-health', section: 'health', label: 'Здоровье', cover: 'img/jar-parilka.jpg',
    slides: [
      {
        image: 'img/mayr-building.jpg', eyebrow: 'MAYRVEDA 5★ · Кисловодск',
        title: 'Детокс по Майеру, −25%',
        text: 'Семь дней врачебной программы в санатории из списка Healing Hotels of the World.',
        cta: 'Оставить заявку', target: { t: 'offer', id: 'hl-mayr-detox' },
      },
      {
        image: 'img/jar-parilka.jpg', eyebrow: 'Жар-Птица',
        title: 'Индивидуальное парение, −50%',
        text: 'Авторское парение с банным мастером: 90 минут, купели и травяной чай.',
        cta: 'Получить', target: { t: 'offer', id: 'hl-jar-parenie' },
      },
      {
        image: 'img/medsi-doctor.jpg', eyebrow: 'МЕДСИ',
        title: 'Чекап «Премиум» за день, −30%',
        text: 'Полное обследование за одно посещение и заключение терапевта.',
        cta: 'Открыть', target: { t: 'offer', id: 'hl-medsi-checkup' },
      },
    ],
  },
];
