import { useEffect, useMemo, useState } from 'react';
import { IcCheck, IcSearch, IcSliders, IcX } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { Chips, Empty, Sheet } from '../components/ui';
import { haptic } from '../lib/telegram';
import { useNav } from '../router';
import { plural } from '../store';
import {
  BRANDS, CATEGORIES, SORTS, countFor, filterProducts, search,
  type CategoryId, type SortId,
} from '../data/catalog';

export function Catalog() {
  const takePending = useNav((n) => n.takePending);

  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<CategoryId>('all');
  const [brandId, setBrandId] = useState('all');
  const [sort, setSort] = useState<SortId>('popular');
  const [sortOpen, setSortOpen] = useState(false);

  // фильтр, пришедший с главной
  useEffect(() => {
    const p = takePending();
    if (!p) return;
    if (p.cat) setCat(p.cat as CategoryId);
    if (p.brandId) setBrandId(p.brandId);
  }, []);

  const searching = query.trim().length >= 2;
  const found = useMemo(() => search(query), [query]);
  const list = useMemo(() => filterProducts({ cat, brandId, sort }), [cat, brandId, sort]);

  const brandChips = [
    { id: 'all', title: 'Все бренды', n: countFor(cat, 'all') },
    ...BRANDS.map((b) => ({ id: b.id, title: b.title, n: countFor(cat, b.id) })),
  ];
  const catChips = CATEGORIES
    .map((c) => ({ id: c.id, title: c.title, n: countFor(c.id, brandId) }))
    .filter((c) => c.id === 'all' || c.n > 0);

  const sortTitle = SORTS.find((s) => s.id === sort)?.title ?? '';

  return (
    <div className="screen">
      <div className="search" style={{ paddingTop: 12 }}>
        <IcSearch size={18} className="search__ico" />
        <input className="search__field" value={query} inputMode="search"
               onChange={(e) => setQuery(e.target.value)}
               placeholder="Поиск по каталогу" aria-label="Поиск" />
        {query && (
          <button className="iconbtn search__clear" onClick={() => { haptic.tap(); setQuery(''); }} aria-label="Очистить">
            <IcX size={17} />
          </button>
        )}
      </div>

      {searching ? (
        <div style={{ marginTop: 20 }}>
          {found.length === 0 ? (
            <Empty icon={<IcSearch size={44} />} title="Ничего не нашлось"
                   text="Попробуйте «крем», «сыворотка», «маска», «ампулы» или название бренда." />
          ) : (
            <>
              <div className="toolbar" style={{ paddingTop: 0, paddingBottom: 14 }}>
                <span className="toolbar__count">Найдено {found.length}</span>
              </div>
              <div className="grid">{found.map((p) => <ProductCard key={p.id} p={p} />)}</div>
            </>
          )}
        </div>
      ) : (
        <>
          <div style={{ marginTop: 16 }}>
            <Chips items={brandChips} value={brandId} onChange={setBrandId} />
          </div>
          <div style={{ marginTop: 10 }}>
            <Chips items={catChips} value={cat} onChange={setCat} />
          </div>

          <div className="toolbar">
            <span className="toolbar__count">{list.length} {plural(list.length, 'товар', 'товара', 'товаров')}</span>
            <button className="toolbar__sort" onClick={() => { haptic.tap(); setSortOpen(true); }}>
              <IcSliders size={16} />{sortTitle}
            </button>
          </div>

          <div className="grid" style={{ marginTop: 18 }}>
            {list.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>

          {list.length === 0 && (
            <Empty title="В этом разделе пока пусто"
                   text="Снимите фильтр по бренду или выберите другую категорию." />
          )}
        </>
      )}

      <div style={{ height: 36 }} />

      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title="Сортировка">
        <div className="col" style={{ gap: 8, paddingTop: 10 }}>
          {SORTS.map((s) => (
            <button key={s.id} className={`radio${sort === s.id ? ' radio--on' : ''}`}
                    onClick={() => { haptic.select(); setSort(s.id); setSortOpen(false); }}>
              <span className="radio__t grow">{s.title}</span>
              {sort === s.id && <IcCheck size={17} />}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
