'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PagamentoPage() {
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  useEffect(() => {
    if (status === 'approved') {
      alert('✅ Pagamento aprovado! Você agora tem acesso VIP.');
    }
    setLoading(false);
  }, [status]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">💳 Processando pagamento...</h1>
      {loading ? <p>⏳ Aguarde...</p> : <p>Status do pagamento: {status}</p>}
    </div>
  );
}
