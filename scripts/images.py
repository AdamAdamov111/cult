#!/usr/bin/env python3
"""Скачивание и сжатие изображений: webp/png -> jpg нужного размера."""
import os, re, sys, json, pathlib, subprocess, urllib.request, urllib.parse, hashlib

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
ROOT = pathlib.Path(__file__).resolve().parent.parent

def download(url, dest: pathlib.Path, max_px=700):
    """Скачать и привести к jpg шириной не больше max_px. Возвращает путь или None."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1000:
        return dest
    tmp = dest.with_suffix('.src')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA, 'Referer': urllib.parse.urlparse(url)._replace(path='/').geturl()})
        data = urllib.request.urlopen(req, timeout=45).read()
        if len(data) < 1200:
            return None
        tmp.write_bytes(data)
        r = subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '72',
                            '-Z', str(max_px), str(tmp), '--out', str(dest)],
                           capture_output=True)
        tmp.unlink(missing_ok=True)
        return dest if dest.exists() and dest.stat().st_size > 800 else None
    except Exception as e:
        tmp.unlink(missing_ok=True)
        print(f'   ! {url[:70]}: {e}')
        return None

def slug_of(url):
    return hashlib.md5(url.encode()).hexdigest()[:10]
