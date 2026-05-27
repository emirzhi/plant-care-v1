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