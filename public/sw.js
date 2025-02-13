const CACHE_NAME = "my-next-pwa-cache-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(clients.openWindow("<https://your-website.com>"));
});

// public/sw.js

// 오프라인 fallback 페이지를 만들고 싶다면, public/offline.html을 준비해두세요.

// 설치 단계(서비스 워커가 처음 등록될 때)
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 오프라인에서 미리 캐싱해둘 리소스 (예: offline.html, CSS, JS...)
      return cache.addAll([OFFLINE_URL]);
    })
  );
});

// 활성화 단계(오래된 캐시 정리)
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated.");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// fetch 이벤트(네트워크 요청 가로채기)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // 네트워크 실패 시 캐시된 offline.html 반환
      return caches.match(OFFLINE_URL);
    })
  );
});
