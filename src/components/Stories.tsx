import { useEffect, useRef, useState } from 'react';
import { STORIES } from '../data/stories';
import { useApp } from '../store';
import { haptic } from '../lib/telegram';
import { Cover } from './Cover';
import { IcRight, IcX } from './Icons';
import type { Target } from '../types';
import { asset } from '../lib/assets';

const SLIDE_MS = 5200;

/* ======================= Ряд кружков ======================= */
export function StoriesRow({ onOpen }: { onOpen: (i: number) => void }) {
  const viewed = useApp((s) => s.viewed);
  return (
    <div className="hscroll">
      {STORIES.map((st, i) => {
        const isNew = !st.slides.every((_, k) => viewed.includes(`${st.id}:${k}`));
        return (
          <button className="story-bubble" key={st.id} onClick={() => onOpen(i)}>
            <span className={`story-bubble__ring${isNew ? ' story-bubble__ring--new' : ''}`}>
              <span className="story-bubble__inner">
                {st.cover
                  ? <img className="story-bubble__img" src={asset(st.cover)} alt="" loading="lazy" />
                  : <span style={{ position: 'relative', display: 'block', width: '100%', height: '100%' }}>
                      <Cover section={st.section} label={st.label} />
                    </span>}
              </span>
            </span>
            <span className="story-bubble__label">{st.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ======================= Полноэкранный просмотрщик ======================= */
export function StoriesViewer({
  startIndex, onClose, onGo,
}: { startIndex: number; onClose: () => void; onGo: (t: Target) => void }) {
  const [si, setSi] = useState(startIndex);   // индекс сторис
  const [ki, setKi] = useState(0);            // индекс кадра
  const [paused, setPaused] = useState(false);
  const [dragY, setDragY] = useState(0);
  const markViewed = useApp((s) => s.markViewed);
  const startY = useRef(0);
  const moved = useRef(false);

  const story = STORIES[si];
  const slide = story.slides[ki];

  useEffect(() => { markViewed(`${story.id}:${ki}`); }, [si, ki]);

  const next = () => {
    if (ki + 1 < story.slides.length) { setKi(ki + 1); return; }
    if (si + 1 < STORIES.length) { setSi(si + 1); setKi(0); return; }
    onClose();
  };
  const prev = () => {
    if (ki > 0) { setKi(ki - 1); return; }
    if (si > 0) { setSi(si - 1); setKi(0); return; }
  };

  /* Свайп вниз — закрыть, долгое нажатие — пауза */
  const onDown = (e: React.PointerEvent) => {
    startY.current = e.clientY; moved.current = false;
    setPaused(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const dy = e.clientY - startY.current;
    if (dy > 4) { moved.current = true; setDragY(Math.min(dy, 260)); }
  };
  const onUp = () => {
    setPaused(false);
    if (dragY > 90) { haptic.tap(); onClose(); return; }
    setDragY(0);
  };

  return (
    <div className="viewer"
         style={{ transform: dragY ? `translateY(${dragY}px) scale(${1 - dragY / 2400})` : undefined,
                  borderRadius: dragY ? 18 : 0, transition: dragY ? 'none' : 'transform .2s' }}
         onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>

      <div className="viewer__media">
        {slide.image
          ? <img className="viewer__img" src={asset(slide.image)} alt="" />
          : <Cover section={story.section} label={story.label} big />}
        <div className="viewer__grad-top" />
        <div className="viewer__grad-bot" />
      </div>

      {/* Зоны перелистывания */}
      <div className="viewer__zones">
        <div className="viewer__zone" onClick={(e) => { e.stopPropagation(); if (!moved.current) { haptic.tap(); prev(); } }} />
        <div className="viewer__zone" style={{ flex: 2 }} />
        <div className="viewer__zone" onClick={(e) => { e.stopPropagation(); if (!moved.current) { haptic.tap(); next(); } }} />
      </div>

      <div className="viewer__top">
        <div className="viewer__bars">
          {story.slides.map((_, k) => (
            <span className="viewer__bar" key={k}>
              <span
                key={`${si}-${ki}-${k}`}
                className={`viewer__bar-fill${k === ki ? ' viewer__bar-fill--run' : ''}`}
                style={{
                  width: k < ki ? '100%' : undefined,
                  animationDuration: k === ki ? `${SLIDE_MS}ms` : undefined,
                  animationPlayState: paused ? 'paused' : 'running',
                }}
                onAnimationEnd={() => { if (k === ki) next(); }}
              />
            </span>
          ))}
        </div>
        <div className="viewer__meta">
          <span className="viewer__ava" style={{ display: 'grid', placeItems: 'center', background: '#1a1a1a', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: '#c6a664' }}>CU</span>
          <span className="viewer__name">CULT · {story.label}</span>
          <span className="viewer__time">{ki + 1}/{story.slides.length}</span>
          <button className="viewer__close" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Закрыть">
            <IcX size={21} />
          </button>
        </div>
      </div>

      <div className="viewer__body">
        <span className="viewer__eyebrow">{slide.eyebrow}</span>
        <span className="viewer__title">{slide.title}</span>
        <span className="viewer__text">{slide.text}</span>
        <button className="viewer__cta" onClick={(e) => { e.stopPropagation(); haptic.press(); onGo(slide.target); onClose(); }}>
          {slide.cta}<IcRight size={17} />
        </button>
      </div>
    </div>
  );
}
