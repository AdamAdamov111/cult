import { useMemo, useState } from 'react';
import { OfferCard, ProductCard, SectionBanner } from '../components/Cards';
import { Chips, Empty, money } from '../components/Primitives';
import { IcSearch, IcX } from '../components/Icons';
import { COSMETICS_CATS, SECTIONS } from '../data/sections';
import { byCat, searchProducts } from '../data/products';
import { OFFERS } from '../data/offers';
import { haptic } from '../lib/telegram';

type Mode = 'cosmetics' | 'offers';

export function Catalog() {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<Mode>('cosmetics');
  const [cat, setCat] = useState<typeof COSMETICS_CATS[number]['id']>('all');

  const found = useMemo(() => searchProducts(q), [q]);
  const foundOffers = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (n.length < 2) return [];
    return OFFERS.filter((o) => (o.title + o.brand + o.summary).toLowerCase().includes(n));
  }, [q]);
  const searching = q.trim().length >= 2;

  return (
    <div className="screen screen--root">
      {/* Поиск */}
      <div className="pad" style={{ paddingTop: 12 }}>
        <div style={{ position: 'relative' }}>
          <span className="muted" style={{ position: 'absolute', left: 12, top: 14 }}><IcSearch size={18} /></span>
          <input className="input" style={{ paddingLeft: 38, paddingRight: 38 }} value={q}
                 onChange={(e) => setQ(e.target.value)} placeholder="Поиск по клубу" />
          {q && (
            <button className="icon-btn" style={{ position: 'absolute', right: 4, top: 6 }}
                    onClick={() => { haptic.tap(); setQ(''); }} aria-label="Очистить"><IcX size={17} /></button>
          )}
        </div>
      </div>

      {searching ? (
        <div className="block--tight">
          {found.length === 0 && foundOffers.length === 0 ? (
            <Empty title="Ничего не нашлось" text="Попробуйте «крем», «сыворотка», «ампулы», «чекап» или «спорт»." />
          ) : (
            <>
              {found.length > 0 && (
                <>
                  <div className="block-head"><h2 className="h2">Товары · {found.length}</h2></div>
                  <div className="grid2">{found.map((p) => <ProductCard key={p.id} p={p} />)}</div>
                </>
              )}
              {foundOffers.length > 0 && (
                <div className="block">
                  <div className="block-head"><h2 className="h2">Предложения · {foundOffers.length}</h2></div>
                  <div className="pad col" style={{ gap: 12 }}>
                    {foundOffers.map((o) => <OfferCard key={o.id} o={o} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="block--tight">
            <Chips items={[{ id: 'cosmetics' as Mode, title: 'Косметика' }, { id: 'offers' as Mode, title: 'Партнёры' }]}
                   value={mode} onChange={setMode} />
          </div>

          {mode === 'cosmetics' ? (
            <>
              <div className="block--tight"><Chips items={COSMETICS_CATS} value={cat} onChange={setCat} /></div>
              <div className="block--tight">
                <div className="grid2">{byCat(cat).map((p) => <ProductCard key={p.id} p={p} />)}</div>
              </div>
            </>
          ) : (
            <>
              <div className="block--tight pad col" style={{ gap: 10 }}>
                {SECTIONS.filter((s) => s.id !== 'cosmetics').map((s) => (
                  <SectionBanner key={s.id} s={s} count={`${OFFERS.filter((o) => o.section === s.id).length} предложений`} />
                ))}
              </div>
              <div className="block">
                <div className="block-head">
                  <h2 className="h2">Все предложения</h2>
                  <span className="block-head__link">выгода до {money(OFFERS.reduce((a, o) => a + (o.value || 0), 0))}</span>
                </div>
                <div className="pad col" style={{ gap: 12 }}>
                  {OFFERS.map((o) => <OfferCard key={o.id} o={o} />)}
                </div>
              </div>
            </>
          )}
        </>
      )}
      <div style={{ height: 30 }} />
    </div>
  );
}
