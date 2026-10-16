import { create } from 'zustand';

/**
 * Стек открытых шторок. Нужен, чтобы телеграмная кнопка «назад»
 * закрывала сначала шторку, и только потом уходила по стеку экранов.
 */
interface SheetStack {
  stack: { id: number; close: () => void }[];
  push: (id: number, close: () => void) => void;
  pop: (id: number) => void;
  closeTop: () => boolean;
}

export const useSheets = create<SheetStack>((set, get) => ({
  stack: [],
  push: (id, close) => set({ stack: [...get().stack, { id, close }] }),
  pop: (id) => set({ stack: get().stack.filter((s) => s.id !== id) }),
  closeTop: () => {
    const s = get().stack;
    if (!s.length) return false;
    s[s.length - 1].close();
    return true;
  },
}));
