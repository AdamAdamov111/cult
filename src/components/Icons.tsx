/* Единый набор иконок: штрих 1.6, скруглённые концы — под брендбук BYRAIN. */
interface P { size?: number; className?: string }
const S = ({ size = 22, className, d, fill }: P & { d: string; fill?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'}
       stroke={fill ? 'none' : 'currentColor'} strokeWidth={1.6} strokeLinecap="round"
       strokeLinejoin="round" className={className} aria-hidden>
    <path d={d} />
  </svg>
);

export const IcHome    = (p: P) => <S {...p} d="M3 10.6 12 3.5l9 7.1V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />;
export const IcGrid    = (p: P) => <S {...p} d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />;
export const IcBag     = (p: P) => <S {...p} d="M6 8h12l1 12.5a.8.8 0 0 1-.8.9H5.8a.8.8 0 0 1-.8-.9zM9 8V6a3 3 0 0 1 6 0v2" />;
export const IcUser    = (p: P) => <S {...p} d="M12 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4.5 21c.6-3.9 3.8-6.3 7.5-6.3s6.9 2.4 7.5 6.3" />;
export const IcRight   = (p: P) => <S {...p} d="M9 5l7 7-7 7" />;
export const IcLeft    = (p: P) => <S {...p} d="M15 5l-7 7 7 7" />;
export const IcDown    = (p: P) => <S {...p} d="M5 9l7 7 7-7" />;
export const IcX       = (p: P) => <S {...p} d="M6 6l12 12M18 6L6 18" />;
export const IcPlus    = (p: P) => <S {...p} d="M12 5v14M5 12h14" />;
export const IcMinus   = (p: P) => <S {...p} d="M5 12h14" />;
export const IcTrash   = (p: P) => <S {...p} d="M4 7h16M9 7V5h6v2M6.5 7l.8 13h9.4l.8-13M10 11v6M14 11v6" />;
export const IcHeart   = (p: P) => <S {...p} d="M12 20S3.5 14.9 3.5 9.4A4.9 4.9 0 0 1 12 6.3a4.9 4.9 0 0 1 8.5 3.1C20.5 14.9 12 20 12 20" />;
export const IcHeartOn = (p: P) => <S {...p} fill d="M12 20.3S3 15 3 9.2A5.4 5.4 0 0 1 12 5.8a5.4 5.4 0 0 1 9 3.4c0 5.8-9 11.1-9 11.1" />;
export const IcLock    = (p: P) => <S {...p} d="M6 11h12v9.2a.8.8 0 0 1-.8.8H6.8a.8.8 0 0 1-.8-.8zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11" />;
export const IcCheck   = (p: P) => <S {...p} d="M4.5 12.8 9.3 17.5 19.5 7" />;
export const IcSearch  = (p: P) => <S {...p} d="M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4M16.2 16.2 21 21" />;
export const IcQr      = (p: P) => <S {...p} d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 20v-1M20 14h-1" />;
export const IcTicket  = (p: P) => <S {...p} d="M3 9.2V6.8c0-.4.4-.8.8-.8h16.4c.4 0 .8.4.8.8v2.4a2.8 2.8 0 0 0 0 5.6v2.4c0 .4-.4.8-.8.8H3.8a.8.8 0 0 1-.8-.8v-2.4a2.8 2.8 0 0 0 0-5.6M12 7v10" />;
export const IcShield  = (p: P) => <S {...p} d="M12 3 5 5.6v6c0 4.3 3 7.7 7 9.4 4-1.7 7-5.1 7-9.4v-6z" />;
export const IcSpark   = (p: P) => <S {...p} d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4zM18.5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />;
export const IcTruck   = (p: P) => <S {...p} d="M3 7h10v9H3zM13 10h4.2l2.8 3v3h-7M6.5 19.5a1.8 1.8 0 1 0 0-3.5 1.8 1.8 0 0 0 0 3.5M16.5 19.5a1.8 1.8 0 1 0 0-3.5 1.8 1.8 0 0 0 0 3.5" />;
export const IcUpRight = (p: P) => <S {...p} d="M7 17 17 7M9 7h8v8" />;
export const IcInfo    = (p: P) => <S {...p} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 11v5M12 8h.01" />;
export const IcCopy    = (p: P) => <S {...p} d="M9 9h10v11H9zM15 9V5H5v10h4" />;
export const IcPin     = (p: P) => <S {...p} d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />;
export const IcClock   = (p: P) => <S {...p} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7.5V12l3 2" />;
export const IcSupport = (p: P) => <S {...p} d="M4 13a8 8 0 0 1 16 0M4 13v3.5a1.5 1.5 0 0 0 1.5 1.5H7v-6H5.5A1.5 1.5 0 0 0 4 13.5zM20 13v3.5a1.5 1.5 0 0 1-1.5 1.5H17v-6h1.5A1.5 1.5 0 0 1 20 13.5zM17 18v1a2 2 0 0 1-2 2h-3" />;
export const IcCrown   = (p: P) => <S {...p} d="M3 8l3.5 3L12 4.5 17.5 11 21 8l-1.8 11H4.8z" />;
export const IcDumbbell= (p: P) => <S {...p} d="M4 9v6M7 7.5v9M17 7.5v9M20 9v6M7 12h10" />;
export const IcPlane   = (p: P) => <S {...p} d="M3.5 13.2 21 4l-7.3 16.5-2.2-6.3z" />;
export const IcFlask   = (p: P) => <S {...p} d="M9 3h6M10.5 3v6.5L5.8 18a1.4 1.4 0 0 0 1.2 2.1h10a1.4 1.4 0 0 0 1.2-2.1l-4.7-8.5V3M7.5 14h9" />;
export const IcDrop    = (p: P) => <S {...p} d="M12 3.5c3 3.8 5.5 6.6 5.5 10a5.5 5.5 0 1 1-11 0c0-3.4 2.5-6.2 5.5-10" />;
