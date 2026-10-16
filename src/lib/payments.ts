import { tg } from './telegram';

/**
 * Оплата. В боевом контуре бот создаёт инвойс и отдаёт ссылку,
 * фронт открывает её через Telegram.openInvoice.
 * Пока эндпоинт не задан — работаем в демо-режиме.
 */
const API = (import.meta as any).env?.VITE_API_URL as string | undefined;

export type PayResult = 'paid' | 'cancelled' | 'failed' | 'demo';

async function invoiceLink(path: string, body: unknown): Promise<string | null> {
  if (!API) return null;
  try {
    const r = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Init-Data': tg?.initData || '' },
      body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j.invoice_link ?? null;
  } catch { return null; }
}

function openInvoice(link: string): Promise<PayResult> {
  return new Promise((res) => {
    if (!tg?.openInvoice) { res('failed'); return; }
    tg.openInvoice(link, (status) => {
      res(status === 'paid' ? 'paid' : status === 'cancelled' ? 'cancelled' : 'failed');
    });
  });
}

export async function payMembership(): Promise<PayResult> {
  const link = await invoiceLink('/membership/invoice', {});
  if (!link) return 'demo';
  return openInvoice(link);
}

export async function payOrder(payload: { lines: { id: string; qty: number }[]; total: number }): Promise<PayResult> {
  const link = await invoiceLink('/order/invoice', payload);
  if (!link) return 'demo';
  return openInvoice(link);
}

/** Состояние пользователя со стороны сервера — источник правды о членстве. */
export interface MeState {
  member: boolean;
  until: number | null;
  autoRenew: boolean;
  orders: { id: string; total: number; ts: number; lines: unknown[] }[];
}

export async function fetchMe(): Promise<MeState | null> {
  if (!API || !tg?.initData) return null;
  try {
    const r = await fetch(`${API}/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Init-Data': tg.initData },
      body: '{}',
    });
    if (!r.ok) return null;
    return (await r.json()) as MeState;
  } catch { return null; }
}

export const DEMO_MODE = !API;
