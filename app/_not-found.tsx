import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "Página não encontrada",
}

export const viewport: Viewport = {
  themeColor: "#A855F7"
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Página não encontrada</p>
      <a
        href="/"
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Voltar para a home
      </a>
    </div>
  );
}
