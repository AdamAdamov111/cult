/**
 * Приёмник картинок: перетащи файл или вставь из буфера — он ляжет в cult/incoming.
 * Запуск: node scripts/drop.mjs   →   http://localhost:5191
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'incoming');
fs.mkdirSync(DIR, { recursive: true });

const PAGE = `<!doctype html><meta charset=utf-8><title>CULT · приём картинок</title>
<style>
 body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0e0e0e;color:#eee;
      font:15px -apple-system,system-ui,sans-serif}
 .z{width:min(560px,86vw);aspect-ratio:3/2;border:2px dashed #3a3a3a;border-radius:18px;
    display:grid;place-items:center;text-align:center;padding:28px;transition:.15s;cursor:pointer}
 .z.on{border-color:#c6a664;background:#17150f}
 h1{font-size:19px;margin:0 0 10px;letter-spacing:.02em}
 p{margin:4px 0;color:#9a9a9a;font-size:13.5px}
 .ok{color:#c6a664;font-weight:600;margin-top:14px;font-size:14px}
 input{display:none}
</style>
<div class=z id=z tabindex=0>
  <div>
    <h1>Перетащи картинку сюда</h1>
    <p>или нажми, чтобы выбрать файл</p>
    <p>или скопируй картинку и нажми ⌘V</p>
    <div class=ok id=ok></div>
  </div>
</div>
<input type=file id=f accept="image/*">
<script>
const z=document.getElementById('z'),ok=document.getElementById('ok'),f=document.getElementById('f');
async function send(file){
  if(!file) return;
  ok.textContent='Загружаю…';
  const r=await fetch('/upload?name='+encodeURIComponent(file.name||'pasted.png'),
    {method:'POST',body:file});
  const j=await r.json();
  ok.textContent = r.ok ? 'Готово: '+j.saved+'  ('+j.size+' КБ)' : 'Ошибка: '+(j.error||r.status);
}
z.addEventListener('click',()=>f.click());
f.addEventListener('change',e=>send(e.target.files[0]));
['dragenter','dragover'].forEach(n=>z.addEventListener(n,e=>{e.preventDefault();z.classList.add('on')}));
['dragleave','drop'].forEach(n=>z.addEventListener(n,e=>{e.preventDefault();z.classList.remove('on')}));
z.addEventListener('drop',e=>send(e.dataTransfer.files[0]));
window.addEventListener('paste',e=>{
  const it=[...e.clipboardData.items].find(i=>i.type.startsWith('image/'));
  if(it) send(it.getAsFile());
});
z.focus();
</script>`;

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(PAGE);
  }
  if (req.method === 'POST' && url.pathname === '/upload') {
    const raw = (url.searchParams.get('name') || 'image.png').replace(/[^\w.\-]+/g, '_');
    const name = `${Date.now()}-${raw}`;
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      fs.writeFileSync(path.join(DIR, name), buf);
      console.log(`принято: ${name} (${Math.round(buf.length / 1024)} КБ)`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ saved: name, size: Math.round(buf.length / 1024) }));
    });
    return;
  }
  res.writeHead(404).end();
}).listen(5191, () => console.log('Приём картинок: http://localhost:5191  →  cult/incoming'));
