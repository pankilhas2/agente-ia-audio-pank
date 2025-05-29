"use client"

import dynamic from "next/dynamic"

// Importamos o componente dinamicamente para garantir que ele só seja carregado no cliente
const AudioPankAI = dynamic(() => import("@/components/audio-pank-ai"), {
  ssr: false, // Desativa a renderização no servidor
})

export default function ClientWrapper() {
  return <AudioPankAI />
}
