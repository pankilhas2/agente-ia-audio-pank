/// <reference lib="webworker" />

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = "audio-pank-cache-v1"

// Add list of files to cache here.
const FILES_TO_CACHE = [
  "/",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/groq",
  "/offline.html",
  "/favicon.ico",
  "/speech",
  "/offline",
  "/recomendacoes",
  "/historico",
  "/estatisticas",
  "/speech-model/model.json",
  "/speech-model/weights.bin",
  "/speech-model/metadata.json",
]

// O resto do código permanece o mesmo
