import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IcDown, IcLock, IcMinus, IcPlus, IcX } from './Icons';
import { haptic } from '../lib/telegram';
import { money } from '../store';

/* ---------------- Цена ---------------- */

export function Price({
  club, rrp, size = 'sm', member, onLock,
}: { club: number; rrp: number; size?: 'sm' | 'md' | 'lg'; member: boolean; onLock?: () => void }) {
  if (!rrp) return <span className="off off--quiet">СКОРО</span>;
  const off = Math.round((1 - club / rrp) * 100);
  return (
    <div className={`price price--${size}`}>
      <span className="price__now" style={member ? undefined : { color: 'var(--gold-ink)' }}>
        {money(club)}
      </span>
      <span className="price__was">{money(rrp)}</span>
      {member
        ? <span className="off">−{off}%</span>
        : (
          <span className="lockline" onClick={(e) => { e.stopPropagation(); onLock?.(); }}>
            <IcLock size={11} />в клубе
          </span>
        )}
    </div>
  );
}

/* ---------------- Шторка ---------------- */

export function Sheet({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  const shut = () => {
    if (closing) return;
    setClosing(true);
    haptic.tap();
    setTimeout(() => { setClosing(false); setMounted(false); onClose(); }, 200);
  };

  useEffect(() => { if (open) setMounted(true); }, [open]);
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') shut(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [mounted]);

  if (!mounted) return null;
  return (
    <div className="sheet-root" role="dialog" aria-modal>
      <div className="sheet__scrim" onClick={shut} />
      <div className={`sheet${closing ? ' sheet--out' : ''}`}>
        <div className="sheet__grip" />
        {title && (
          <div className="sheet__head between">
            <h2 className="t-h2">{title}</h2>
            <button className="iconbtn" onClick={shut} aria-label="Закрыть"><IcX size={20} /></button>
          </div>
        )}
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Аккордеон ---------------- */

export function Accordion({ label, children, open: initial }: { label: string; children: ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(!!initial);
  const inner = useRef<HTMLDivElement>(null);
  return (
    <div className="acc">
      <button className="acc__btn" onClick={() => { haptic.tap(); setOpen(!open); }} aria-expanded={open}>
        <span className="acc__label">{label}</span>
        <IcDown size={17} className={`acc__chev${open ? ' acc__chev--open' : ''}`} />
      </button>
      <div style={{
        height: open ? (inner.current?.scrollHeight ?? 'auto') : 0,
        overflow: 'hidden', transition: 'height .26s cubic-bezier(.22,.61,.36,1)',
      }}>
        <div className="acc__body" ref={inner}>{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Счётчик ---------------- */

export function Qty({ value, onChange, min = 1 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="qty">
      <button className="qty__b" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Меньше"><IcMinus size={15} /></button>
      <span className="qty__v">{value}</span>
      <button className="qty__b" onClick={() => onChange(value + 1)} aria-label="Больше"><IcPlus size={15} /></button>
    </div>
  );
}

/* ---------------- Фильтр-чипсы ---------------- */

export function Chips<T extends string>({
  items, value, onChange,
}: { items: { id: T; title: string; n?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="chips">
      {items.map((c) => (
        <button key={c.id} className={`chip${c.id === value ? ' chip--on' : ''}`}
                onClick={() => { haptic.select(); onChange(c.id); }}>
          {c.title}
          {c.n != null && <span className="chip__n">{c.n}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Прочее ---------------- */

export function SectionHead({ title, more, onMore }: { title: string; more?: string; onMore?: () => void }) {
  return (
    <div className="sec__head">
      <h2 className="t-h1">{title}</h2>
      {more && onMore && <button className="sec__more" onClick={onMore}>{more}</button>}
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      {icon && <div style={{ color: 'var(--line)', display: 'flex', justifyContent: 'center', marginBottom: 18 }}>{icon}</div>}
      <div className="empty__t">{title}</div>
      {text && <div className="empty__d">{text}</div>}
      {action && <div style={{ marginTop: 22 }}>{action}</div>}
    </div>
  );
}

export const Skel = ({ h, w, r }: { h: number; w?: number | string; r?: number }) => (
  <div className="skel" style={{ height: h, width: w ?? '100%', borderRadius: r ?? 8 }} />
);
