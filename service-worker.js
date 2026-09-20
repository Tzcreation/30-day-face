const CACHE='skin-routine-v5';
const ASSETS=['./','./index.html','./style.css?v=5','./app-v5.js?v=5','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./images/cleanser.png','./images/vitamin-c.png','./images/niacinamide.png','./images/azelaic.png','./images/moisturizer.png','./images/sunscreen.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r.ok){const x=r.clone();caches.open(CACHE).then(k=>k.put(e.request,x))}return r}).catch(()=>c)))});
