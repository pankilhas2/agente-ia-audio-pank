import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Simulação de geração de vídeo
  // Aqui você pode usar APIs como Replicate, Runway, ou Firebase Functions com FFmpeg

  // Retorna um vídeo de exemplo
  return NextResponse.json({
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Simulação de geração de vídeo
  // Aqui você pode usar APIs como Replicate, Runway, ou Firebase Functions com FFmpeg

  // Retorna um vídeo de exemplo
  return NextResponse.json({
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
  });
}  });
}import { useState } from 'react';

export default function RemocaoIA() {
  const [image, setImage] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch('/api/remover-objeto', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setResultUrl(data.url);

    // Salvar no Supabase
    await fetch('/api/salvar-midia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'imagem',
        url: data.url,
        descricao: 'Imagem com objeto removido',
        user_email: localStorage.getItem('user_email') || null
      })
    });

    setLoading(false);
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧽 Remoção Inteligente de Objetos</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        {loading ? '🧠 Processando...' : '🧽 Remover Objeto com IA'}
      </button>
      {resultUrl && (
        <div className="mt-6">
          <img src={resultUrl} alt="Resultado IA" className="rounded" />
          <a href={resultUrl} download className="block mt-2 text-green-700">
            ⬇️ Baixar imagem limpa
          </a>
        </div>
      )}
    </main>
  );
}