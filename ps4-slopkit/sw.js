"use strict";

const CACHE = 'slopkit-v1';

const ASSETS = [
  'index.html',
  'includes/style.css',
  'includes/script.js',
  'includes/image.jpg',
  'src/core.js',
  'src/mem.js',
  'src/int64.js',
  'src/offsets.js',
  'src/main.js',
  'src/lapse.js',
  'src/netctrl.js',
  'src/worker.js',
  'src/kpatch/1100.bin',
  'src/kpatch/1102.bin',
  'src/kpatch/1150.bin',
  'src/kpatch/1200.bin',
  'src/kpatch/1250.bin',
  'src/kpatch/1300.bin',
  'src/payload.bin'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const noQuery = new Request(request.url.replace(/\?.*$/, ''));
  const cached = await cache.match(request, { ignoreVary: true })
    || await cache.match(noQuery, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    cache.put(noQuery, response.clone());
  }
  return response;
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  event.respondWith(cacheFirst(event.request));
});