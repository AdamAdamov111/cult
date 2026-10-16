import { useState } from 'react';
import { ProductCard } from '../components/Cards';
import { BrandRow } from '../components/BrandRow';
import { Chips, Empty, money } from '../components/Primitives';
import { IcCrown, IcUpRight } from '../components/Icons';
import { BRAND_MAP } from '../data/brands';
import { byBrand } from '../data/products';
import { useApp } from '../store';
import { useNav } from '../router';
import { haptic, openExternal } from '../lib/telegram';

type Sort = 'pop' | 'cheap' | 'rich';
const SORTS = [
  { id: 'pop' as Sort, title: 'По умолчанию' },
  { id: 'cheap' as Sort, title: 'Сначала дешевле' },
  { id: 'rich' as Sort, title: 'Сначала дороже' },
];

export function Brand({ id }: { id: string }) {
  const b = BRAND_MAP.get(id);
  const member = useApp((s) => s.isMember());
  const go = useNav((n) => n.go);
  const [sort, setSort] = useState<Sort>('pop');

  if (!b) return <Empty title="Бренд не найден" />;

  const items = byBrand(b.title);
  const sorted = sort === 'pop' ? items
    : [...items].sort((x, y) => (sort === 'cheap' ? x.club - y.club : y.club - x.club));
  const maxSave = items.reduce((m, p) => Math.max(m, p.rrp - p.club), 0);

  return (
    <div className="screen">
      <div className="brand-hero">
        <div className="brand-hero__glow" />
        <div className="brand-hero__name">{b.title}</div>
        <div className="brand-hero__meta">{b.country} · {items.length} позиций</div>
        <div className="brand-hero__about">{b.about}</div>
        <span className="brand-hero__badge">−{Math.round(b.discount * 100)}% для членов клуба</span>
      </div>

      <div className="block--tight"><BrandRow active={b.id} /></div>

      <div className="pad block--tight">
        <div className="note">
          Клубная цена бренда — минус {Math.round(b.discount * 100)}% от розницы.
          Максимальная выгода на одной позиции — {money(maxSave)}.
        </div>
      </div>

      <div className="block--tight"><Chips items={SORTS} value={sort} onChange={setSort} /></div>

      <div className="block--tight">
        {sorted.length
          ? <div className="grid2">{sorted.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          : <Empty title="Товары появятся скоро" />}
      </div>

      {!member && (
        <div className="pad block--tight">
          <button className="btn btn--gold btn--block btn--lg" onClick={() => go({ k: 'join' })}>
            <IcCrown size={18} />Открыть цены {b.title}
          </button>
        </div>
      )}

      <div className="pad block--tight">
        <button className="btn btn--ghost btn--block btn--sm"
                onClick={() => { haptic.tap(); openExternal(b.site); }}>
          Сайт бренда<IcUpRight size={15} />
        </button>
      </div>
      <div style={{ height: 30 }} />
    </div>
  );
}
