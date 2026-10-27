import { useState } from 'react';
import { IcUpRight } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { Chips, Empty } from '../components/ui';
import { asset } from '../lib/assets';
import { haptic, openExternal } from '../lib/telegram';
import { money, plural, useShop } from '../store';
import { useNav } from '../router';
import { SORTS, brand, filterProducts, savingOf, type SortId } from '../data/catalog';

export function Brand({ id }: { id: string }) {
  const b = brand(id);
  const member = useShop((s) => s.isMember());
  const go = useNav((n) => n.go);
  const [sort, setSort] = useState<SortId>('popular');

  if (!b) return <Empty title="Бренд не найден" />;

  const items = filterProducts({ cat: 'all', brandId: id, sort });
  const maxSaving = items.reduce((m, p) => Math.max(m, savingOf(p)), 0);

  return (
    <div className="screen">
      <div className="ed">
        <img className="ed__img" src={asset(b.tile)} alt={b.title} />
        <span className="ed__scrim" />
        <div className="ed__body">
          <span className="t-label" style={{ color: 'var(--gold)' }}>{items.length} {plural(items.length, 'позиция', 'позиции', 'позиций')} · −{Math.round(b.discount * 100)}%</span>
          <h1 className="ed__title" style={{ letterSpacing: '.14em', fontWeight: 700 }}>{b.title}</h1>
          <p className="ed__text">{b.about}</p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 13px',
            borderRadius: 999, background: '#fff', color: '#0a0a0a',
            fontSize: 12, fontWeight: 700, marginTop: 14,
          }}>
            −{Math.round(b.discount * 100)}% для членов клуба
          </span>
        </div>
      </div>

      <div className="pad" style={{ marginTop: 18 }}>
        <div className="note">
          Клубная цена — минус {Math.round(b.discount * 100)}% от розницы.
          Максимальная выгода на одной позиции — {money(maxSaving)}.
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Chips items={SORTS.map((s) => ({ id: s.id, title: s.title }))} value={sort} onChange={setSort} />
      </div>

      <div className="grid" style={{ marginTop: 20 }}>
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>

      {!member && (
        <div className="pad" style={{ marginTop: 26 }}>
          <button className="btn btn--gold btn--block" onClick={() => go({ k: 'join' })}>
            Открыть цены {b.title}
          </button>
        </div>
      )}

      <div className="pad" style={{ marginTop: 12 }}>
        <button className="btn btn--soft btn--block btn--sm"
                onClick={() => { haptic.tap(); openExternal(b.site); }}>
          Сайт бренда<IcUpRight size={15} />
        </button>
      </div>
      <div style={{ height: 36 }} />
    </div>
  );
}
