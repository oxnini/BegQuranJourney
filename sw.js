// Offline cache for the Nooraniyah Companion.
// The page is fetched network-first so updates arrive; audio, icons and fonts are cache-first.
// Bump VERSION whenever the audio files change.
const VERSION='nq-1';
const CORE=['./','./nooraniyah-companion.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
const AUDIO=["./audio/l10r00.mp3", "./audio/l10r01.mp3", "./audio/l10r02.mp3", "./audio/l10r03.mp3", "./audio/l10r04.mp3", "./audio/l10r05.mp3", "./audio/l10r06.mp3", "./audio/l10r07.mp3", "./audio/l1r00.mp3", "./audio/l1r01.mp3", "./audio/l1r02.mp3", "./audio/l1r03.mp3", "./audio/l1r04.mp3", "./audio/l1r05.mp3", "./audio/l2r00.mp3", "./audio/l2r01.mp3", "./audio/l2r02.mp3", "./audio/l2r03.mp3", "./audio/l2r04.mp3", "./audio/l2r05.mp3", "./audio/l2r06.mp3", "./audio/l2r07.mp3", "./audio/l2r08.mp3", "./audio/l2r09.mp3", "./audio/l2r10.mp3", "./audio/l2r11.mp3", "./audio/l2r12.mp3", "./audio/l2r13.mp3", "./audio/l2r14.mp3", "./audio/l2r15.mp3", "./audio/l2r16.mp3", "./audio/l2r17.mp3", "./audio/l2r18.mp3", "./audio/l2r19.mp3", "./audio/l2r20.mp3", "./audio/l2r21.mp3", "./audio/l3r00.mp3", "./audio/l3r01.mp3", "./audio/l3r02.mp3", "./audio/l3r03.mp3", "./audio/l4r00.mp3", "./audio/l4r01.mp3", "./audio/l4r02.mp3", "./audio/l4r03.mp3", "./audio/l4r04.mp3", "./audio/l4r05.mp3", "./audio/l4r06.mp3", "./audio/l4r07.mp3", "./audio/l4r08.mp3", "./audio/l4r09.mp3", "./audio/l4r10.mp3", "./audio/l5r00.mp3", "./audio/l5r01.mp3", "./audio/l5r02.mp3", "./audio/l5r03.mp3", "./audio/l5r04.mp3", "./audio/l5r05.mp3", "./audio/l5r06.mp3", "./audio/l5r07.mp3", "./audio/l5r08.mp3", "./audio/l5r09.mp3", "./audio/l5r10.mp3", "./audio/l6r00.mp3", "./audio/l6r01.mp3", "./audio/l6r02.mp3", "./audio/l6r03.mp3", "./audio/l6r04.mp3", "./audio/l6r05.mp3", "./audio/l6r06.mp3", "./audio/l6r07.mp3", "./audio/l6r08.mp3", "./audio/l7r00.mp3", "./audio/l7r01.mp3", "./audio/l7r04.mp3", "./audio/l8r00.mp3", "./audio/l8r01.mp3", "./audio/l8r02.mp3", "./audio/l8r03.mp3", "./audio/l8r04.mp3", "./audio/l8r05.mp3", "./audio/l8r06.mp3", "./audio/l8r07.mp3", "./audio/l8r08.mp3", "./audio/l8r09.mp3", "./audio/l8r10.mp3", "./audio/l8r11.mp3", "./audio/l8r12.mp3", "./audio/l8r13.mp3", "./audio/l8r14.mp3", "./audio/l8r15.mp3", "./audio/l8r16.mp3", "./audio/l8r17.mp3", "./audio/l8r18.mp3", "./audio/l8r19.mp3", "./audio/l9r00.mp3", "./audio/l9r01.mp3", "./audio/l9r02.mp3", "./audio/l9r03.mp3", "./audio/l9r04.mp3", "./audio/l9r05.mp3", "./audio/l9r06.mp3", "./audio/l9r07.mp3", "./audio/l9r08.mp3", "./audio/l9r09.mp3", "./audio/l9r10.mp3", "./audio/l9r11.mp3", "./audio/l9r12.mp3", "./audio/l9r13.mp3", "./audio/l9r14.mp3", "./audio/l9r15.mp3", "./audio/l9r16.mp3", "./audio/l9r17.mp3"];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k!==VERSION) await caches.delete(k);
    await self.clients.claim();
    // Save every lesson's audio so the whole book works offline.
    const c=await caches.open(VERSION);
    for(const f of AUDIO){ if(!(await c.match(f))){ try{ await c.add(f); }catch(err){} } }
  })());
});

self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  const isPage=req.mode==='navigate'||url.pathname.endsWith('.html');
  if(isPage){
    e.respondWith(fetch(req).then(r=>{ const copy=r.clone(); caches.open(VERSION).then(c=>c.put(req,copy)); return r; })
      .catch(()=>caches.match(req).then(r=>r||caches.match('./nooraniyah-companion.html'))));
    return;
  }
  const isFont=/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(url.origin===location.origin||isFont){
    e.respondWith(caches.match(req).then(hit=>{
      const net=fetch(req).then(r=>{ if(r.ok||r.type==='opaque'){ const copy=r.clone(); caches.open(VERSION).then(c=>c.put(req,copy)); } return r; });
      return hit||net;
    }));
  }
});
