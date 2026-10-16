import { BRANDS } from '../data/brands';
import { useNav } from '../router';

/** Переключатель брендов в разделе «Косметика». */
export function BrandRow({ active }: { active?: string }) {
  const go = useNav((n) => n.go);
  return (
    <div className="hscroll">
      {BRANDS.map((b) => (
        <button key={b.id} className={`brand-pill${active === b.id ? ' brand-pill--on' : ''}`}
                onClick={() => go({ k: 'brand', id: b.id })}>
          <span className="brand-pill__name">{b.title}</span>
          <span>
            <span className="brand-pill__off">−{Math.round(b.discount * 100)}%</span>{' '}
            <span className="brand-pill__count">· {b.count}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
