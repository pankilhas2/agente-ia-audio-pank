import { supabase } from '@/lib/supabase';
import { useSession } from '@supabase/auth-helpers-react';

export function BotaoFavorito({ produtoId }: { produtoId: string }) {
  const session = useSession();

  const favoritar = async () => {
    const user = session?.user;
    if (!user) {
      alert('Faça login para favoritar!');
      return;
    }
    await supabase.from('favoritos').insert({
      user_id: user.id,
      produto_id: produtoId
    });
    alert('⭐ Adicionado aos favoritos!');
  };

  return (
    <button onClick={favoritar} className="text-yellow-500 hover:text-yellow-600">
      ⭐ Favoritar
    </button>
  );
}
