'use client';
import { useState } from 'react';

export default function CriadorAudio() {
  const [texto, setTexto] = useState('');
  const [voz, setVoz] = useState('pt-BR-Wavenet-A');
  const [ttsUrl, setTtsUrl] = useState('');
  const [trilha, setTrilha] = useState('/trilhas/trilha1.mp3');
  const [volVoz, setVolVoz] = useState(80);
  const [volTrilha, setVolTrilha] = useState(50);

  const gerarTTS = async () => {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ texto, voz })
    });
    const data = await res.json();
    setTtsUrl(data.url);
  };

  const mixarAudio = async () => {
    const res = await fetch('/api/mix', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        tts: ttsUrl,
        trilha,
        volumeVoz: volVoz,
        volumeTrilha: volTrilha
      })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audio-final.mp3";
    a.click();
  };

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎙️ Criador de Áudio com IA</h1>
      <textarea className="w-full border p-2 mb-2" rows={4} placeholder="Digite o texto da locução" value={texto} onChange={(e) => setTexto(e.target.value)} />
      <label className="block mb-1">🗣️ Escolha a voz:</label>
      <select className="w-full border p-2 mb-2" value={voz} onChange={(e) => setVoz(e.target.value)}>
        <option value="pt-BR-Wavenet-A">Voz A (Masculina)</option>
        <option value="pt-BR-Wavenet-B">Voz B (Feminina)</option>
      </select>
      <button onClick={gerarTTS} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">🔊 Gerar Locução</button>
      {ttsUrl && <audio controls src={ttsUrl} className="mb-4 w-full" />}
      <label className="block mb-1">🎼 Escolha a trilha:</label>
      <select className="w-full border p-2 mb-2" value={trilha} onChange={(e) => setTrilha(e.target.value)}>
        <option value="/trilhas/trilha1.mp3">Trilha 1</option>
        <option value="/trilhas/trilha2.mp3">Trilha 2</option>
      </select>
      <label className="block mb-1">🔊 Volume da Voz: {volVoz}</label>
      <input type="range" min="0" max="100" value={volVoz} onChange={(e) => setVolVoz(parseInt(e.target.value))} className="mb-4 w-full" />
      <label className="block mb-1">🎵 Volume da Trilha: {volTrilha}</label>
      <input type="range" min="0" max="100" value={volTrilha} onChange={(e) => setVolTrilha(parseInt(e.target.value))} className="mb-4 w-full" />
      <button onClick={mixarAudio} className="bg-green-600 text-white px-4 py-2 rounded">🎧 Mixar e Baixar</button>
    </main>
  );
}
