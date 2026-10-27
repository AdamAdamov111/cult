import { IcCrown, IcRight, IcShield, IcTruck, IcReturn } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { SectionHead } from '../components/ui';
import { asset } from '../lib/assets';
import { money, plural, useShop } from '../store';
import { useNav } from '../router';
import {
  BRANDS, CATEGORIES, COMING, ON_SALE, hits,
  MEMBERSHIP_PRICE, countFor,
} from '../data/catalog';

export function Home() {
  const member = useShop((s) => s.isMember());
  const savedTotal = useShop((s) => s.savedTotal);
  const { go, openCatalog } = useNav();

  const flagship = [...ON_SALE].filter((p) => p.cat !== 'set').sort((a, b) => b.rrp - a.rrp)[0];

  return (
    <div className="screen">
      {/* 1. Герой */}
      <section className="hero">
        <img className="hero__img" src={asset('img/hero-glass.jpg')} alt="" />
        <div className="hero__scrim" />
        <div className="hero__body">
          <span className="t-label" style={{ color: 'var(--gold)' }}>Швейцарская лаборатория</span>
          <h1 className="hero__title">Премиальный уход<br />по клубной цене</h1>
          <p className="hero__sub">
            BYRAIN −50%, GREYMY −35%. Членство {money(MEMBERSHIP_PRICE)} в месяц
            окупается первой покупкой.
          </p>
          <button className="hero__cta" onClick={() => openCatalog({ cat: 'all', brandId: 'all' })}>
            Смотреть каталог
          </button>
        </div>
      </section>

      {/* 2. Клубная полоса */}
      <div className="pad" style={{ marginTop: 18 }}>
        {member ? (
          <div className="save">
            <IcCrown size={19} className="gold" />
            <div className="grow">
              {savedTotal > 0 ? (
                <>
                  <div className="t-micro gold">Сэкономлено в клубе</div>
                  <div className="save__v">{money(savedTotal)}</div>
                </>
              ) : (
                <>
                  <div className="t-h3 gold">Клубные цены открыты</div>
                  <div className="t-micro">Минус 50% на BYRAIN и минус 35% на GREYMY</div>
                </>
              )}
            </div>
          </div>
        ) : (
          <button className="save" style={{ width: '100%', textAlign: 'left' }} onClick={() => go({ k: 'join' })}>
            <IcCrown size={19} className="gold" />
            <div className="grow">
              <div className="t-h3 gold">Членство {money(MEMBERSHIP_PRICE)} в месяц</div>
              <div className="t-micro">
                {flagship && `${flagship.title} — ${money(flagship.club)} вместо ${money(flagship.rrp)}`}
              </div>
            </div>
            <IcRight size={17} className="gold" />
          </button>
        )}
      </div>

      {/* 3. Бестселлеры */}
      <section className="sec">
        <SectionHead title="Бестселлеры" more="Весь каталог"
                     onMore={() => openCatalog({ cat: 'all', brandId: 'all' })} />
        <div className="rail">
          {hits.map((p) => <div key={p.id} style={{ width: 164 }}><ProductCard p={p} /></div>)}
        </div>
      </section>

      {/* 4. Бренды */}
      <section className="sec">
        <SectionHead title="Два бренда клуба" />
        <div className="tiles">
          {BRANDS.map((b) => (
            <button key={b.id} className="tile" onClick={() => go({ k: 'brand', id: b.id })}>
              <img className="tile__img" src={asset(b.tile)} alt={b.title} loading="lazy" />
              <span className="tile__scrim" />
              <span className="tile__body">
                <span className="tile__name">{b.title}</span>
                <span className="tile__meta">{countFor('all', b.id)} {plural(countFor('all', b.id), 'позиция', 'позиции', 'позиций')} · −{Math.round(b.discount * 100)}%</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. Категории */}
      <section className="sec">
        <SectionHead title="Категории" />
        <div className="chips">
          {CATEGORIES.filter((c) => c.id !== 'all')
            .map((c) => ({ ...c, n: countFor(c.id, 'all') }))
            .filter((c) => c.n > 0)
            .sort((a, b) => b.n - a.n)
            .map((c) => {
            const n = c.n;
            return (
              <button key={c.id} className="chip" onClick={() => openCatalog({ cat: c.id, brandId: 'all' })}>
                {c.title}<span className="chip__n">{n}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Редакционный блок */}
      <section className="sec">
        <div className="ed" onClick={() => go({ k: 'brand', id: 'byrain' })}>
          <img className="ed__img" src={asset('img/ed-lab.jpg')} alt="" loading="lazy" />
          <span className="ed__scrim" />
          <div className="ed__body">
            <span className="t-label" style={{ color: 'var(--gold)' }}>BYRAIN Switzerland</span>
            <h3 className="ed__title">Пептиды, факторы роста<br />и фитоэстрогены</h3>
            <p className="ed__text">
              Формулы, разработанные для кожи в период гормонального старения.
              Клинически подтверждённые активы в концентрациях, которые работают.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Гарантии */}
      <section className="sec--tight">
        <div className="trust">
          <div className="trust__i"><IcShield size={19} className="muted" /><span className="trust__t">Оригинал<br />от бренда</span></div>
          <div className="trust__i"><IcTruck size={19} className="muted" /><span className="trust__t">Доставка<br />по России</span></div>
          <div className="trust__i"><IcReturn size={19} className="muted" /><span className="trust__t">Возврат<br />14 дней</span></div>
        </div>
      </section>

      {/* 8. Каталог */}
      <section className="sec">
        <SectionHead title="Весь каталог" more={`${ON_SALE.length} ${plural(ON_SALE.length, 'товар', 'товара', 'товаров')}`}
                     onMore={() => openCatalog({ cat: 'all', brandId: 'all' })} />
        <div className="grid">
          {ON_SALE.slice(0, 6).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <div className="pad" style={{ marginTop: 22 }}>
          <button className="btn btn--line btn--block" onClick={() => openCatalog({ cat: 'all', brandId: 'all' })}>
            Показать все {ON_SALE.length} {plural(ON_SALE.length, 'товар', 'товара', 'товаров')}
          </button>
        </div>
      </section>

      {/* 9. Скоро */}
      {COMING.length > 0 && (
        <section className="sec">
          <SectionHead title="Скоро в клубе" />
          <div className="rail">
            {COMING.map((p) => <div key={p.id} style={{ width: 164 }}><ProductCard p={p} /></div>)}
          </div>
        </section>
      )}

      <footer className="pad" style={{ margin: '48px 0 16px', textAlign: 'center' }}>
        <div className="wordmark" style={{ fontSize: 13, color: 'var(--faint)' }}>Cult</div>
        <div className="t-micro" style={{ marginTop: 8 }}>Закрытый клуб BYRAIN · Швейцария</div>
      </footer>
    </div>
  );
}
