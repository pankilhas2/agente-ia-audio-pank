import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { nome, url, favorito, user_email } = req.body;

  const { error } = await supabase.from('audios').insert({
    nome,
    url,
    favorito,
    user_email,
  });

  if (error) return res.status(500).json({ error });

  return res.status(200).json({ success: true });
}