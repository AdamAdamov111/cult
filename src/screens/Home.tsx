import { useState } from 'react';
import { BannerCarousel } from '../components/BannerCarousel';
import { StoriesRow, StoriesViewer } from '../components/Stories';
import { OfferCard, ProductCard, SectionBanner } from '../components/Cards';
import { BrandRow } from '../components/BrandRow';
import { BlockHead, money } from '../components/Primitives';
import { IcCrown, IcRight, IcSpark } from '../components/Icons';
import { SECTIONS } from '../data/sections';
import { COMING, HIT_PRODUCTS, ON_SALE } from '../data/products';
import { OFFERS, TOTAL_OFFER_VALUE } from '../data/offers';
import { useApp } from '../store';
import { goTarget, useNav } from '../router';

export function Home() {
  const [story, setStory] = useState<number | null>(null);
  const member = useApp((s) => s.isMember());
  const savedTotal = useApp((s) => s.savedTotal);
  const go = useNav((s) => s.go);
  const setTab = useNav((s) => s.setTab);

  const onGo = goTarget;

  // по одному сильному предложению из каждой сферы
  const topOffers = ['cl-aclub-lounge', 'tr-maldives', 'sp-wc-year', 'bt-omny-smas', 'hl-mayr-detox', 'cl-atlanty', 'sp-padel-court']
    .map((id) => OFFERS.find((o) => o.id === id)!)
    .filter(Boolean);

  return (
    <div className="screen screen--root">
      {/* 1. Карусель мест под партнёров */}
      <div className="block--tight"><BannerCarousel onGo={onGo} /></div>

      {/* 2. Сторис по сегментам */}
      <div className="block--tight"><StoriesRow onOpen={setStory} /></div>

      {/* 3. Полоса членства / накопленной экономии */}
      <div className="block--tight pad">
        {member
          ? (
            <div className="saved-strip">
              <IcSpark size={20} className="gold" />
              <div style={{ lineHeight: 1.35, flex: 1 }}>
                {savedTotal > 0 ? (
                  <>
                    <div className="micro" style={{ color: 'var(--gold-ink)' }}>Сэкономлено в клубе</div>
                    <div className="saved-strip__v">{money(savedTotal)}</div>
                  </>
                ) : (
                  <>
                    <div className="h3" style={{ color: 'var(--gold-ink)' }}>Клубные цены открыты</div>
                    <div className="micro">Минус 50% на весь каталог BYRAIN и доступ ко всем предложениям партнёров</div>
                  </>
                )}
              </div>
            </div>
          )
          : (
            <button className="saved-strip" style={{ width: '100%', textAlign: 'left' }} onClick={() => go({ k: 'join' })}>
              <IcCrown size={20} className="gold" />
              <div style={{ lineHeight: 1.35, flex: 1 }}>
                <div className="h3" style={{ color: 'var(--gold-ink)' }}>Членство 3 000 ₽ в месяц</div>
                <div className="micro">Вся косметика −50%, доступ к {OFFERS.length} предложениям партнёров</div>
              </div>
              <IcRight size={18} className="gold" />
            </button>
          )}
      </div>

      {/* 4. Хиты клуба */}
      <div className="block">
        <BlockHead title="Хиты клуба" link="Весь каталог" onLink={() => setTab('catalog')} />
        <div className="hscroll">
          {HIT_PRODUCTS.map((p) => (
            <div key={p.id} style={{ width: 154 }}><ProductCard p={p} /></div>
          ))}
        </div>
      </div>

      {/* 5. Баннеры разделов */}
      <div className="block">
        <BlockHead title="Шесть сфер клуба" />
        <div className="pad col" style={{ gap: 10 }}>
          {SECTIONS.map((s) => <SectionBanner key={s.id} s={s} />)}
        </div>
        <div className="pad" style={{ marginTop: 12 }}>
          <div className="note">
            Суммарная выгода по действующим предложениям партнёров — до {money(TOTAL_OFFER_VALUE)} в год.
            Доступ открывается сразу после оплаты членства.
          </div>
        </div>
      </div>

      {/* 6. Предложения партнёров — срез */}
      <div className="block">
        <BlockHead title="Сейчас в клубе" />
        <div className="hscroll">
          {topOffers.map((o) => (
            <div key={o.id} style={{ width: 268 }}><OfferCard o={o} /></div>
          ))}
        </div>
      </div>

      {/* 7. Бренды клуба */}
      <div className="block">
        <BlockHead title="Бренды клуба" link="Все бренды" onLink={() => go({ k: 'section', id: 'cosmetics' })} />
        <BrandRow />
      </div>

      {/* 8. Выкладка косметики BYRAIN */}
      <div className="block">
        <BlockHead title="Косметика BYRAIN" link="Все товары" onLink={() => go({ k: 'section', id: 'cosmetics' })} />
        <div className="grid2">
          {ON_SALE.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <div className="pad" style={{ marginTop: 18 }}>
          <button className="btn btn--outline btn--block" onClick={() => go({ k: 'section', id: 'cosmetics' })}>
            Показать все {ON_SALE.length} товаров
          </button>
        </div>
      </div>

      {/* 8. Скоро */}
      {COMING.length > 0 && (
        <div className="block">
          <BlockHead title="Скоро в клубе" />
          <div className="hscroll">
            {COMING.map((p) => <div key={p.id} style={{ width: 154 }}><ProductCard p={p} /></div>)}
          </div>
        </div>
      )}

      <div className="pad" style={{ margin: '34px 0 10px', textAlign: 'center' }}>
        <div className="wordmark" style={{ fontSize: 13, color: 'var(--faint)' }}>Cult</div>
        <div className="micro" style={{ marginTop: 7 }}>Закрытый клуб BYRAIN · Швейцария</div>
      </div>

      {story !== null && (
        <StoriesViewer startIndex={story} onClose={() => setStory(null)} onGo={onGo} />
      )}
    </div>
  );
}
