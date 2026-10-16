/* Обёртка над Telegram WebApp SDK с безопасными заглушками для разработки в браузере. */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotifType = 'error' | 'success' | 'warning';

interface TgWebApp {
  initData: string;
  initDataUnsafe: { user?: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string; language_code?: string } };
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportStableHeight: number;
  ready(): void;
  expand(): void;
  close(): void;
  setHeaderColor(c: string): void;
  setBackgroundColor(c: string): void;
  disableVerticalSwipes?(): void;
  enableClosingConfirmation?(): void;
  onEvent(e: string, cb: () => void): void;
  offEvent(e: string, cb: () => void): void;
  openLink(url: string, opts?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  showAlert(msg: string, cb?: () => void): void;
  showConfirm(msg: string, cb?: (ok: boolean) => void): void;
  openInvoice?(url: string, cb?: (status: string) => void): void;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  MainButton: {
    text: string; isVisible: boolean;
    show(): void; hide(): void; setText(t: string): void; onClick(cb: () => void): void;
    offClick(cb: () => void): void; enable(): void; disable(): void;
    showProgress(leave?: boolean): void; hideProgress(): void;
    setParams(p: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): void;
  };
  HapticFeedback: {
    impactOccurred(s: HapticStyle): void;
    notificationOccurred(t: NotifType): void;
    selectionChanged(): void;
  };
  CloudStorage?: {
    setItem(k: string, v: string, cb?: (e: Error | null, ok?: boolean) => void): void;
    getItem(k: string, cb: (e: Error | null, v?: string) => void): void;
  };
}

export const tg: TgWebApp | undefined = (window as any).Telegram?.WebApp;
export const inTelegram = !!tg && !!tg.initData;

/* ---------- Инициализация ---------- */
export function initTelegram(onThemeChange: (scheme: 'light' | 'dark') => void) {
  const apply = () => {
    const scheme = tg?.colorScheme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = scheme;
    const bg = scheme === 'dark' ? '#0d0d0d' : '#ffffff';
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', bg);
    try { tg?.setHeaderColor(bg); tg?.setBackgroundColor(bg); } catch { /* старые версии */ }
    onThemeChange(scheme);
  };

  if (!tg) {
    apply();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply);
    return;
  }
  tg.ready();
  tg.expand();
  tg.disableVerticalSwipes?.();
  tg.onEvent('themeChanged', apply);
  apply();
}

/* ---------- Haptics ---------- */
export const haptic = {
  tap: () => tg?.HapticFeedback.impactOccurred('light'),
  press: () => tg?.HapticFeedback.impactOccurred('medium'),
  heavy: () => tg?.HapticFeedback.impactOccurred('heavy'),
  select: () => tg?.HapticFeedback.selectionChanged(),
  ok: () => tg?.HapticFeedback.notificationOccurred('success'),
  err: () => tg?.HapticFeedback.notificationOccurred('error'),
  warn: () => tg?.HapticFeedback.notificationOccurred('warning'),
};

/* ---------- Кнопка «назад» ---------- */
export function setBackButton(visible: boolean, handler?: () => void) {
  if (!tg) return;
  const bb = tg.BackButton;
  (bb as any)._cult?.();                       // снять прежний обработчик
  if (visible && handler) {
    bb.onClick(handler);
    (bb as any)._cult = () => bb.offClick(handler);
    bb.show();
  } else {
    bb.hide();
  }
}

/* ---------- Главная кнопка ---------- */
let mbHandler: (() => void) | null = null;
export function setMainButton(cfg: { text: string; active?: boolean; onClick: () => void } | null) {
  if (!tg) return;
  const mb = tg.MainButton;
  if (mbHandler) { mb.offClick(mbHandler); mbHandler = null; }
  if (!cfg) { mb.hide(); return; }
  mbHandler = cfg.onClick;
  mb.onClick(mbHandler);
  mb.setParams({ text: cfg.text, is_active: cfg.active !== false, is_visible: true });
}

/* ---------- Пользователь ---------- */
export function tgUser() {
  const u = tg?.initDataUnsafe?.user;
  if (!u) return null;
  return {
    id: u.id,
    name: [u.first_name, u.last_name].filter(Boolean).join(' '),
    username: u.username,
    photo: u.photo_url,
  };
}

/* ---------- Хранилище: CloudStorage в Telegram, localStorage в браузере ---------- */

/** CloudStorage появился в Bot API 6.9 — на старых клиентах вызовы просто не отвечают. */
function cloudReady(): boolean {
  if (!inTelegram || !tg?.CloudStorage) return false;
  const [maj, min] = (tg.version || '6.0').split('.').map(Number);
  return maj > 6 || (maj === 6 && min >= 9);
}

const local = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* приват-режим */ } },
};

export const storage = {
  async get(key: string): Promise<string | null> {
    if (!cloudReady()) return local.get(key);
    // CloudStorage может не ответить вовсе — страхуемся таймаутом и локальной копией
    const fromCloud = new Promise<string | null>((res) => {
      try { tg!.CloudStorage!.getItem(key, (e, v) => res(e ? null : (v || null))); }
      catch { res(null); }
    });
    const timeout = new Promise<null>((res) => setTimeout(() => res(null), 1500));
    return (await Promise.race([fromCloud, timeout])) ?? local.get(key);
  },
  async set(key: string, val: string) {
    local.set(key, val);                       // локальная копия всегда
    if (!cloudReady()) return;
    try { tg!.CloudStorage!.setItem(key, val); } catch { /* клиент не умеет */ }
  },
};

export function openExternal(url: string) {
  if (tg) tg.openLink(url, { try_instant_view: true });
  else window.open(url, '_blank', 'noopener');
}

export function alertMsg(msg: string) {
  if (tg?.showAlert) tg.showAlert(msg);
  else alert(msg);
}

export function confirmMsg(msg: string): Promise<boolean> {
  return new Promise((res) => {
    if (tg?.showConfirm) tg.showConfirm(msg, (ok) => res(!!ok));
    else res(confirm(msg));
  });
}
