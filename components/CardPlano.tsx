'use client';

interface Props {
  tipo: string;
  preco: string;
  recursos: string[];
  vip?: boolean;
}

export default function CardPlano({ tipo, preco, recursos, vip }: Props) {
  const handleAssinar = () => {
    if (vip) {
      window.open('https://www.mercadopago.com.br/subscriptions', '_blank');
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-md bg-white flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold">{tipo}</h2>
        <p className="text-gray-600 mb-4">{preco}</p>
        <ul className="text-sm text-gray-700 mb-4 list-disc pl-4">
          {recursos.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>
      {vip && (
        <button onClick={handleAssinar} className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition">
          Assinar agora
        </button>
      )}
    </div>
  );
}
