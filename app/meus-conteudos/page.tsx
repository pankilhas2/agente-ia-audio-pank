'use client';

import { useEffect, useState } from 'react';

export default function MeusConteudos() {
  const [itens, setItens] = useState([]);

  useEffect(() => {
    fetch('/api/get-midias')
      .then((res) => res.json())
      .then((data) => setItens(data));
  }, []);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📁 Meus Conteúdos Gerados</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {itens.map((item) => (
          <div key={item.id} className="bg-white shadow p-4 rounded">
            <p className="text-sm text-gray-600 mb-2">{item.tipo.toUpperCase()}</p>
            {item.tipo === 'vídeo' ? (
              <video controls src={item.url} className="w-full rounded" />
            ) : (
              <img src={item.url} alt="Mídia" className="w-full rounded" />
            )}
            <p className="mt-2 text-sm text-gray-700">{item.descricao}</p>
            <a href={item.url} download className="text-green-600 mt-2 inline-block">
              ⬇️ Baixar
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}