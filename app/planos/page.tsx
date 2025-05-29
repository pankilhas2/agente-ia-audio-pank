'use client';
import CardPlano from '../../components/CardPlano';

export default function Planos() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🚀 Planos do Agente IA - Áudio Pank</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardPlano 
          tipo="Gratuito" 
          preco="R$ 0,00" 
          recursos={[
            'Acesso ao chat IA',
            'Envio por WhatsApp',
            'Criação de áudio básica'
          ]} 
        />
        <CardPlano 
          tipo="VIP" 
          preco="R$ 9,90/mês" 
          recursos={[
            'Tudo do plano gratuito',
            'Biblioteca com e-books e trilhas',
            'Áudios narrados premium',
            'Templates de IA prontos',
            'Atualizações mensais exclusivas'
          ]} 
          vip 
        />
      </div>
    </div>
  );
}
