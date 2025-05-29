'use client';

import { useEffect, useState } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function MeusAudios() {
  const [audios, setAudios] = useState([]);

  useEffect(() => {
    fetch('/api/get-audios')
      .then((res) => res.json())
      .then((data) => setAudios(data));
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">⭐ Meus Áudios</h1>
        {audios.map((audio) => (
          <div key={audio.id} className="mb-6 border-b pb-4">
            <p className="font-semibold">{audio.nome}</p>
            <audio controls src={audio.url} className="my-2 w-full" />
            <div className="flex gap-4">
              <button
                className="text-yellow-500"
                onClick={() => {
                  fetch('/api/favoritar-audio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: audio.id }),
                  });
                }}
              >
                ⭐ Favoritar
              </button>
              <a
                href={`https://wa.me/?text=Olha esse áudio que criei: ${audio.url}`}
                target="_blank"
                className="text-green-600"
              >
                📤 Enviar via WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </main>
  );
}