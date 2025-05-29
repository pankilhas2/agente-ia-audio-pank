'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProdutoVip {
  id: number;
  nome: string;
  tipo: string;
  link: string;
  created_at?: string;
}

export default function PainelAdminVip() {
  const [produtos, setProdutos] = useState<ProdutoVip[]>([]);
  const [novo, setNovo] = useState({ nome: '', tipo: '', link: '' });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    setCarregando(true);
    const { data, error } = await supabase.from('produtos_vip').select('*').order('created_at', { ascending: false });
    if (!error && data) setProdutos(data);
    setCarregando(false);
  }

  async function adicionarProduto() {
    if (!novo.nome || !novo.tipo || !novo.link) return alert("Preencha todos os campos.");
    const { error } = await supabase.from('produtos_vip').insert([novo]);
    if (!error) {
      setNovo({ nome: '', tipo: '', link: '' });
      carregarProdutos();
    } else {
      alert("Erro ao adicionar.");
    }
  }

  async function excluirProduto(id: number) {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const { error } = await supabase.from('produtos_vip').delete().eq('id', id);
    if (!error) carregarProdutos();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 Gerenciar Produtos VIP</h1>

      <div className="bg-white border p-4 rounded mb-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">➕ Adicionar Novo Produto</h2>
        <input type="text" placeholder="Nome" className="border p-2 mr-2 mb-2 w-full" value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })} />
        <input type="text" placeholder="Tipo (PDF, MP3...)" className="border p-2 mr-2 mb-2 w-full" value={novo.tipo} onChange={e => setNovo({ ...novo, tipo: e.target.value })} />
        <input type="text" placeholder="Link de Download" className="border p-2 mr-2 mb-2 w-full" value={novo.link} onChange={e => setNovo({ ...novo, link: e.target.value })} />
        <button onClick={adicionarProduto} className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800">Salvar</button>
      </div>

      {carregando ? (
        <p>Carregando produtos...</p>
      ) : (
        <table className="min-w-full bg-white border shadow-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Nome</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Link</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(prod => (
              <tr key={prod.id} className="border-t">
                <td className="p-2">{prod.nome}</td>
                <td className="p-2">{prod.tipo}</td>
                <td className="p-2 text-blue-600 underline text-sm">{prod.link}</td>
                <td className="p-2">
                  <button onClick={() => excluirProduto(prod.id)} className="text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nenhum produto cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
