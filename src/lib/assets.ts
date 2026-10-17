/**
 * Картинки проходят через сборщик: каждая получает имя с хешем содержимого.
 * Поменяли файл — поменялось имя, и браузер с Telegram больше не отдают
 * старую копию из кэша.
 */
const files = import.meta.glob('../assets/img/**/*.{jpg,jpeg,png,webp}', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

const MAP = new Map<string, string>(
  Object.entries(files).map(([path, url]) => [path.replace('../assets/', ''), url]),
);

/** 'img/sec-health.jpg' -> '/cult/assets/sec-health-a1b2c3.jpg'. Внешние ссылки проходят как есть. */
export function asset(path?: string): string {
  if (!path) return '';
  return MAP.get(path) ?? path;
}
