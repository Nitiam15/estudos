/* Service worker — deixa o app abrir sem internet e controla as atualizações.
   Para publicar uma nova versão: altere VERSAO aqui e em version.json (e APP_VERSION no app). */
const VERSAO = "1.2.0";
const CACHE = "estudos-" + VERSAO;
const FB = "https://www.gstatic.com/firebasejs/10.14.1/";
const ESSENCIAIS = [
  "./", "./index.html", "./app.js", "./vendor/react.js", "./firebase-config.js", "./manifest.webmanifest",
  "./icons/icone-192.png", "./icons/icone-512.png", "./icons/icone-maskable-512.png", "./icons/icone-180.png",
];
const FIREBASE = ["firebase-app.js", "firebase-auth.js", "firebase-firestore.js"].map((f) => FB + f);

self.addEventListener("install", (ev) => {
  ev.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ESSENCIAIS.map((u) => new Request(u, { cache: "reload" })));
    // Firebase: melhor esforço (se falhar, é baixado no primeiro uso online)
    await Promise.all(FIREBASE.map((u) => c.add(new Request(u, { mode: "cors" })).catch(() => {})));
  })());
  // não ativa sozinho: o app mostra o aviso "Nova versão disponível"
});

self.addEventListener("message", (ev) => { if (ev.data === "PULAR_ESPERA") self.skipWaiting(); });

self.addEventListener("activate", (ev) => {
  ev.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.filter((n) => n.startsWith("estudos-") && n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // version.json sempre da rede (é como o app descobre versões novas)
  if (url.origin === location.origin && url.pathname.endsWith("/version.json")) return;

  // configuração do Firebase: rede primeiro, cache se offline
  if (url.origin === location.origin && url.pathname.endsWith("/firebase-config.js")) {
    ev.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; })
      .catch(() => caches.match(req)));
    return;
  }

  // arquivos do app e bibliotecas do Firebase: cache primeiro
  if (url.origin === location.origin || req.url.startsWith(FB)) {
    ev.respondWith((async () => {
      const achado = await caches.match(req, { ignoreSearch: url.origin === location.origin });
      if (achado) return achado;
      try {
        const r = await fetch(req);
        if (r.ok) { const cp = r.clone(); (await caches.open(CACHE)).put(req, cp); }
        return r;
      } catch (e) {
        if (req.mode === "navigate") return caches.match("./index.html");
        throw e;
      }
    })());
  }
  // demais endereços (login, Firestore) passam direto
});
