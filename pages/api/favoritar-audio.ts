import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.body;

  const { error } = await supabase
    .from('audios')
    .update({ favorito: true })
    .eq('id', id);

  if (error) return res.status(500).json({ error });

  return res.status(200).json({ success: true });
}