const CACHE_NAME = "radio-web-shell-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // 페이지 이동(HTML 네비게이션) 요청만 처리한다.
  // /api/* (방송국 목록, 메타 정보, 스트림 프록시)나 오디오는
  // 절대 캐싱하지 않는다 - 전부 실시간으로 바뀌는 데이터라 캐싱하면
  // 오히려 옛날 스트림 주소나 낡은 정보가 나오는 문제가 생긴다.
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
  }
});
