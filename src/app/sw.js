import { defaultCache } from "@serwist/next/worker";
import { Serwist, StaleWhileRevalidate, CacheFirst } from "serwist";

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
    if (!event.data) return;

    let payload = {};
    try {
        payload = event.data.json();
    } catch {
        payload = { title: "Plant Care", body: event.data.text() };
    }

    const title = payload.title || "Plant Care";
    const options = {
        body: payload.body || "",
        icon: payload.icon || "/icons/logo-192.png",
        badge: payload.badge || "/icons/logo-192.png",
        tag: payload.tag || "plant-care-due",
        data: { url: payload.url || "/plants" },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/plants";

    event.waitUntil(
        self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clients) => {
                for (const client of clients) {
                    if ("focus" in client) {
                        client.navigate(url);
                        return client.focus();
                    }
                }
                return self.clients.openWindow(url);
            }),
    );
});