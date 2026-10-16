import { SECTION_MAP } from '../data/sections';
import type { SectionId } from '../types';

/**
 * Обложка без стоковых фото: брендовый градиент + монограмма партнёра.
 * Когда появятся реальные снимки — передаём `src` и фон уходит на второй план.
 */
export function Cover({
  section, src, label, big, className,
}: { section: SectionId; src?: string; label?: string; big?: boolean; className?: string }) {
  const s = SECTION_MAP[section];
  if (src) {
    return (
      <img src={src} alt="" loading="lazy" decoding="async"
           className={className}
           style={className ? undefined : { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
    );
  }

  const mono = (label || s.title).replace(/[^A-Za-zА-Яа-я0-9 ]/g, '').trim().split(/\s+/)
    .slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div className={className} style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(142deg, ${s.from} 0%, ${s.to} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: big ? 'flex-end' : 'center',
      paddingRight: big ? '7%' : 0, overflow: 'hidden',
    }}>
      {/* мягкое золотое свечение */}
      <div style={{
        position: 'absolute', width: '72%', aspectRatio: '1', borderRadius: '50%',
        right: '-18%', top: '-32%',
        background: 'radial-gradient(circle, rgba(198,166,100,.3), transparent 68%)',
      }} />
      {/* тонкая сетка-текстура */}
      <div style={{
        position: 'absolute', inset: 0, opacity: .5,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      <span style={{
        position: 'relative', color: big ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.16)', fontWeight: 700,
        fontSize: big ? 104 : 58, letterSpacing: '.04em', lineHeight: 1,
        userSelect: 'none',
      }}>{mono}</span>
    </div>
  );
}
