import { useState } from 'react';
import { OfferCard, ProductCard } from '../components/Cards';
import { Chips, Empty, money } from '../components/Primitives';
import { Cover } from '../components/Cover';
import { BrandRow } from '../components/BrandRow';
import { IcCrown, IcLock } from '../components/Icons';
import { COSMETICS_CATS, SECTION_MAP } from '../data/sections';
import { byCat } from '../data/products';
import { brandsOf, offersOf } from '../data/offers';
import { useApp } from '../store';
import { useNav } from '../router';
import type { SectionId } from '../types';

export function Section({ id }: { id: SectionId }) {
  const s = SECTION_MAP[id];
  const member = useApp((a) => a.isMember());
  const go = useNav((n) => n.go);
  const [cat, setCat] = useState<typeof COSMETICS_CATS[number]['id']>('all');
  const [partner, setPartner] = useState('all');

  const isShop = id === 'cosmetics';
  const products = isShop ? byCat(cat) : [];
  const allOffers = isShop ? [] : offersOf(id);
  const partners = isShop ? [] : brandsOf(id);
  const offers = partner === 'all' ? allOffers : allOffers.filter((o) => o.brand === partner);
  const totalValue = allOffers.reduce((a, o) => a + (o.value || 0), 0);

  return (
    <div className="screen">
      {/* Шапка раздела */}
      <div style={{ position: 'relative', aspectRatio: s.ratio, margin: '0 0 2px' }}>
        <Cover section={id} src={s.image} label={s.title} big />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(8,8,8,.88) 4%, rgba(8,8,8,.48) 46%, rgba(8,8,8,.08) 84%)' }} />
        <div style={{ position: 'absolute', inset: 0, padding: 'var(--pad)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff' }}>
          <span className="sbanner__kicker">{s.kicker}</span>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '.02em', lineHeight: 1 }}>{s.title}</span>
          <span style={{ fontSize: 12.5, opacity: .9, marginTop: 5 }}>{s.sub}</span>
        </div>
      </div>

      {isShop ? (
        <>
          <div className="block--tight">
            <div className="block-head" style={{ paddingBottom: 9 }}><h2 className="h2">Бренды клуба</h2></div>
            <BrandRow />
          </div>
          <div className="block--tight"><Chips items={COSMETICS_CATS} value={cat} onChange={setCat} /></div>
          <div className="block--tight">
            {products.length
              ? <div className="grid2">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
              : <Empty title="Пока пусто" text="В этом подразделе товаров ещё нет." />}
          </div>
          {!member && (
            <div className="pad block--tight">
              <button className="btn btn--gold btn--block btn--lg" onClick={() => go({ k: 'join' })}>
                <IcCrown size={18} />Открыть клубные цены
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {partners.length > 1 && (
            <div className="block--tight">
              <Chips items={[{ id: 'all', title: 'Все партнёры' }, ...partners.map((b) => ({ id: b, title: b }))]}
                     value={partner} onChange={setPartner} />
            </div>
          )}
          <div className="pad block--tight">
            <div className="note">
              {allOffers.length} предложений в разделе · выгода до {money(totalValue)}.
              {member ? ' Промокод выдаётся внутри карточки.' : ' Доступ — после вступления в клуб.'}
            </div>
          </div>
          <div className="pad block--tight col" style={{ gap: 12 }}>
            {offers.map((o) => <OfferCard key={o.id} o={o} />)}
          </div>
          {!member && (
            <div className="pad block">
              <button className="btn btn--gold btn--block btn--lg" onClick={() => go({ k: 'join' })}>
                <IcLock size={17} />Вступить и забрать
              </button>
            </div>
          )}
        </>
      )}
      <div style={{ height: 30 }} />
    </div>
  );
}
