'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ProdutoVip {
  id: number;
  nome: string;
  tipo: string;
  link: string;
  created_at?: string;
}

export default function VitrineVipProtegida() {
  const [produtos, setProdutos] = useState<ProdutoVip[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [busca, setBusca] = useState('');
  const [usuario, setUsuario] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function verificarLogin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      setUsuario(session.user);
    }

    async function carregarProdutos() {
      const { data, error } = await supabase
        .from('produtos_vip')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProdutos(data);
      }
    }

    async function carregarFavoritos() {
      if (!usuario) return;
      const { data } = await supabase
        .from('favoritos')
        .select('produto_id')
        .eq('user_id', usuario?.id);
      if (data) {
        setFavoritos(data.map((f) => f.produto_id));
      }
    }

    verificarLogin();
    carregarProdutos();
    if (usuario) carregarFavoritos();
  }, [usuario]);

  const alternarFavorito = async (produtoId: number) => {
    const jaFavorito = favoritos.includes(produtoId);

    if (jaFavorito) {
      await supabase.from('favoritos').delete().match({
        user_id: usuario.id,
        produto_id: produtoId,
      });
      setFavoritos(favoritos.filter((id) => id !== produtoId));
    } else {
      await supabase.from('favoritos').insert({
        user_id: usuario.id,
        produto_id: produtoId,
      });
      setFavoritos([...favoritos, produtoId]);
    }
  };

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.tipo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔐 VIP - Conteúdos Exclusivos</h1>
      <input
        type="text"
        placeholder="🔍 Buscar conteúdo..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="mb-4 w-full border p-2 rounded"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {produtosFiltrados.map((produto) => (
          <div key={produto.id} className="border rounded-lg p-4 bg-white shadow-sm relative">
            <h2 className="text-lg font-semibold">{produto.nome}</h2>
            <p className="text-sm text-gray-500 mb-2">Tipo: {produto.tipo}</p>
            <a
              href={produto.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-700 text-white px-4 py-2 mt-2 rounded hover:bg-purple-800 transition"
            >
              📥 Baixar
            </a>
            <button
              onClick={() => alternarFavorito(produto.id)}
              className={`absolute top-2 right-2 text-xl ${
                favoritos.includes(produto.id) ? 'text-yellow-400' : 'text-gray-400'
              }`}
              title="Favoritar"
            >
              ⭐
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
