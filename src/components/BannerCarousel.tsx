import { useEffect, useMemo, useRef, useState } from 'react';
import { BANNERS } from '../data/banners';
import { useApp } from '../store';
import { Cover } from './Cover';
import type { Target } from '../types';

const SECTION_OF: Record<string, any> = {
  'bn-maldives': 'travel', 'bn-checkup': 'health', 'bn-join': 'cosmetics', 'bn-mask': 'cosmetics',
};

export function BannerCarousel({ onGo }: { onGo: (t: Target) => void }) {
  const member = useApp((s) => s.isMember());
  // члену клуба не показываем приглашение вступить
  const banners = useMemo(() => BANNERS.filter((b) => !(member && b.target.t === 'join')), [member]);
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const touched = useRef(false);

  /* Индекс по позиции скролла */
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth;
      setI(Math.round(el.scrollLeft / w));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /* Автопрокрутка, останавливается после первого касания */
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const stop = () => { touched.current = true; };
    el.addEventListener('pointerdown', stop, { once: true, passive: true });
    const t = setInterval(() => {
      if (touched.current || !el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    }, 5200);
    return () => { clearInterval(t); el.removeEventListener('pointerdown', stop); };
  }, []);

  return (
    <div className="carousel">
      <div className="carousel__track" ref={track}>
        {banners.map((b) => (
          <div className="carousel__slide" key={b.id}>
            <button className="cbanner" onClick={() => onGo(b.target)}
                    style={b.image ? { background: 'linear-gradient(118deg, #0a0a0a 0%, #26211b 100%)' } : undefined}>
              {b.image
                ? <img className="cbanner__img" src={b.image} alt="" loading="lazy" decoding="async" />
                : <Cover section={SECTION_OF[b.id] || "cosmetics"} big />}
              <div className="cbanner__scrim" style={{
                background: b.image
                  ? 'linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,.88) 44%, rgba(10,10,10,0) 86%)'
                  : 'linear-gradient(0deg, rgba(8,8,8,.74), rgba(8,8,8,.12))',
              }} />
              {b.sponsored && <span className="cbanner__ad">Партнёр</span>}
              <div className="cbanner__content">
                <span className="cbanner__eyebrow">{b.eyebrow}</span>
                <span className="cbanner__title" style={{ whiteSpace: 'pre-line' }}>{b.title}</span>
                <span className="cbanner__sub clamp2">{b.sub}</span>
                <span className="cbanner__pill">{b.cta}</span>
              </div>
            </button>
          </div>
        ))}
      </div>
      <div className="dots">
        {banners.map((b, k) => <span key={b.id} className={`dots__d${k === i ? ' dots__d--on' : ''}`} />)}
      </div>
    </div>
  );
}
