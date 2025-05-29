'use client';

import { useState } from 'react';

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
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { tipo, url, descricao, user_email } = await req.json();

  const { error } = await supabase.from('midias_geradas').insert({
    tipo,
    url,
    descricao,
    user_email,
  });

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ success: true });
}  );
}        <div className="mt-6">
          <video src={videoUrl} controls className="w-full rounded" />
          <a href={videoUrl} download className="block mt-2 text-blue-700">
            ⬇️ Baixar vídeo
          </a>
        </div>
      )}
    </main>
  );
}
'use client';

import { useState } from 'react';

export default function CriadorDeVideo() {
  const [idea, setIdea] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const gerarVideo = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('idea', idea);
    images.forEach((img) => formData.append('images', img));

    const response = await fetch('/api/gerar-video', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setVideoUrl(data.url);

    // Salvar no Supabase
    await fetch('/api/salvar-midia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'vídeo',
        url: data.url,
        descricao: idea,
        user_email: localStorage.getItem('user_email') || null
      })
    });

    setLoading(false);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎬 Criador de Vídeos com IA</h1>
      <textarea
        placeholder="Digite sua ideia para o vídeo..."
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        className="w-full p-2 border mb-4 rounded"
      />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="mb-4"
      />
      <button
        onClick={gerarVideo}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? '🎥 Gerando...' : '🎬 Gerar Vídeo'}
      </button>
      {videoUrl && (
'use client';

import { useState } from 'react';

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
}        <div className="mt-6">
          <video src={videoUrl} controls className="w-full rounded" />
          <a href={videoUrl} download className="block mt-2 text-blue-700">
            ⬇️ Baixar vídeo
          </a>
        </div>
      )}
    </main>
  );
}