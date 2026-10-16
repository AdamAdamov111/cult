import { useEffect, useState } from 'react';
import { IcBag, IcLeft, IcUser } from './Icons';
import { useApp } from '../store';
import { useNav } from '../router';
import { inTelegram } from '../lib/telegram';

export function Header({ title }: { title?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const isMember = useApp((s) => s.isMember());
  const until = useApp((s) => s.memberUntil);
  const count = useApp((s) => s.cartCount());
  const { go, setTab, back, depth } = useNav();
  const d = depth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const untilTxt = until
    ? new Date(until).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    : '';

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="header__bar">
        {/* В браузере своей кнопки «назад» нет — рисуем, в Telegram её даёт клиент */}
        {d > 0 && !inTelegram && (
          <button className="icon-btn" onClick={back} aria-label="Назад" style={{ marginLeft: -7 }}>
            <IcLeft size={21} />
          </button>
        )}

        {title
          ? <span className="header__title clamp1">{title}</span>
          : <span className="wordmark">Cult</span>}

        <span className="spacer" />

        {!title && (isMember
          ? (
            <button className="status-chip status-chip--member" onClick={() => setTab('profile')}>
              <span className="status-chip__dot" />до {untilTxt}
            </button>
          )
          : (
            <button className="status-chip status-chip--join" onClick={() => go({ k: 'join' })}>
              Вступить
            </button>
          ))}

        <button className="icon-btn" onClick={() => setTab('cart')} aria-label="Корзина">
          <IcBag size={21} />
          {count > 0 && <span className="icon-btn__badge num">{count}</span>}
        </button>

        {!title && (
          <button className="icon-btn" onClick={() => setTab('profile')} aria-label="Профиль" style={{ marginRight: -6 }}>
            <IcUser size={21} />
          </button>
        )}
      </div>
    </header>
  );
}
