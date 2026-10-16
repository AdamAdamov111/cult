import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { IcDown, IcLock, IcMinus, IcPlus, IcX } from './Icons';
import { useSheets } from '../lib/sheets';
import { haptic } from '../lib/telegram';

/* ---------- Деньги ---------- */
export const money = (n: number) => n.toLocaleString('ru-RU') + ' ₽';
export const Money = ({ v }: { v: number }) => <span className="num">{money(v)}</span>;

/* ---------- Цена: клубная + РРЦ ---------- */
export function Price({
  club, rrp, size = 'md', member, onLockClick,
}: { club: number; rrp: number; size?: 'sm' | 'md' | 'lg'; member: boolean; onLockClick?: () => void }) {
  if (!rrp) return <span className="badge-soon">скоро</span>;
  const off = Math.round((1 - club / rrp) * 100);
  return (
    <div className={`price price--${size}`}>
      <span className="price__club" style={member ? undefined : { color: 'var(--gold-ink)' }}>
        {money(club)}
      </span>
      <span className="price__rrp">{money(rrp)}</span>
      {member
        ? <span className="badge-off">−{off}%</span>
        : (
          <span className="price-locked" onClick={(e) => { e.stopPropagation(); onLockClick?.(); }}>
            <IcLock size={11} />в клубе
          </span>
        )}
    </div>
  );
}

/* ---------- Шторка ---------- */
export function Sheet({
  open, onClose, children, title,
}: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const push = useSheets((s) => s.push);
  const pop = useSheets((s) => s.pop);
  const uid = useRef(Math.random()).current;

  const shut = () => {
    if (closing) return;
    setClosing(true);
    haptic.tap();
    setTimeout(() => { setClosing(false); setMounted(false); onClose(); }, 210);
  };

  useEffect(() => { if (open) setMounted(true); }, [open]);

  useEffect(() => {
    if (!mounted) return;
    push(uid, shut);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { pop(uid); document.body.style.overflow = prev; };
  }, [mounted]);

  if (!mounted) return null;
  return (
    <div className="sheet-root" role="dialog" aria-modal>
      <div className="sheet__scrim" onClick={shut} />
      <div className={`sheet${closing ? ' sheet--closing' : ''}`}>
        <div className="sheet__grip" />
        {title && (
          <div className="sheet__head row--between">
            <h2 className="h2">{title}</h2>
            <button className="icon-btn" onClick={shut} aria-label="Закрыть"><IcX size={20} /></button>
          </div>
        )}
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Аккордеон ---------- */
export function Accordion({ label, children, defaultOpen }: { label: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const inner = useRef<HTMLDivElement>(null);
  const id = useId();
  return (
    <div className="acc">
      <button className="acc__btn" onClick={() => { haptic.tap(); setOpen(!open); }} aria-expanded={open} aria-controls={id}>
        <span className="acc__label">{label}</span>
        <IcDown size={17} className={`acc__chev${open ? ' acc__chev--open' : ''}`} />
      </button>
      <div className="acc__panel" id={id}
           style={{ height: open ? (inner.current?.scrollHeight ?? 'auto') : 0, transition: 'height .26s cubic-bezier(.22,.61,.36,1)' }}>
        <div className="acc__inner" ref={inner}>{children}</div>
      </div>
    </div>
  );
}

/* ---------- Счётчик ---------- */
export function Qty({ value, onChange, min = 1 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="qty">
      <button className="qty__btn" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Меньше"><IcMinus size={15} /></button>
      <span className="qty__val">{value}</span>
      <button className="qty__btn" onClick={() => onChange(value + 1)} aria-label="Больше"><IcPlus size={15} /></button>
    </div>
  );
}

/* ---------- Чипсы ---------- */
export function Chips<T extends string>({
  items, value, onChange,
}: { items: readonly { id: T; title: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="chips">
      {items.map((c) => (
        <button key={c.id} className={`chip${c.id === value ? ' chip--on' : ''}`}
                onClick={() => { haptic.select(); onChange(c.id); }}>
          {c.title}
        </button>
      ))}
    </div>
  );
}

/* ---------- Заглушки ---------- */
export const Skel = ({ h, w, r }: { h: number; w?: number | string; r?: number }) => (
  <div className="skel" style={{ height: h, width: w ?? '100%', borderRadius: r ?? 8 }} />
);

export function Empty({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      {icon && <div className="empty__ic">{icon}</div>}
      <div className="empty__t">{title}</div>
      {text && <div className="empty__d">{text}</div>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

/* ---------- Заголовок блока ---------- */
export function BlockHead({ title, link, onLink }: { title: string; link?: string; onLink?: () => void }) {
  return (
    <div className="block-head">
      <h2 className="h1">{title}</h2>
      {link && <button className="block-head__link" onClick={onLink}>{link}</button>}
    </div>
  );
}
