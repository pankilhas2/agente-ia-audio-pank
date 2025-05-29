import Image from "next/image"
import ClientWrapper from "@/components/client-wrapper"

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <header className="py-6 px-4 border-b border-zinc-800 flex items-center justify-center gap-3">
        <div className="relative w-10 h-10">
          <Image src="/logo-agente-ia.svg" alt="Logo Agente IA - Áudio Pank" width={40} height={40} className="rounded-full" />
        </div>
        <h1 className="text-3xl font-bold text-center text-purple-500">AGENTE IA - ÁUDIO PANK</h1>
      </header>
      <main className="container mx-auto px-4 py-8">
        <ClientWrapper />
      </main>
    </div>
  )
}
