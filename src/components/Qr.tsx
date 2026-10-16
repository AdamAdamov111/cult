import qrcode from 'qrcode-generator';

/** QR в виде SVG — без растра и внешних запросов. */
export function Qr({ value, size = 150 }: { value: string; size?: number }) {
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();
  const n = qr.getModuleCount();
  const cells: string[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) cells.push(`M${c} ${r}h1v1h-1z`);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" aria-label="QR-код">
      <rect width={n} height={n} fill="#fff" />
      <path d={cells.join('')} fill="#0a0a0a" />
    </svg>
  );
}
