import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Audio Pank",
    short_name: "AudioPank",
    description: "Seu assistente de áudio inteligente com tecnologia avançada de IA",
    start_url: "/",
    display: "standalone",
    background_color: "#4c1d95",
    theme_color: "#4c1d95",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
