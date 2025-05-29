'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AssinantesAdmin() {
  const [assinantes, setAssinantes] = useState<any[]>([]);

  useEffect(() => {
    async function carregarAssinantes() {
      const { data, error } = await supabase
        .from('assinantes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setAssinantes(data);
    }

    carregarAssinantes();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📋 Lista de Assinantes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {assinantes.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{a.nome}</td>
                <td className="p-2">{a.email}</td>
                <td className="p-2 text-green-600 font-semibold">✅ Ativo</td>
                <td className="p-2">{new Date(a.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {assinantes.length === 0 && <p className="text-gray-600 mt-4">Nenhum assinante encontrado.</p>}
      </div>
    </div>
  );
}