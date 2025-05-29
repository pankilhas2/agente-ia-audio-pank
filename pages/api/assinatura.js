export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, nome } = req.body;

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  try {
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'Assinatura Mensal - Áudio Pank IA',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 9.9,
          currency_id: 'BRL',
        },
        back_url: 'https://seudominio.com/vip',
        payer_email: email,
        status: 'pending'
      }),
    });

    const data = await response.json();

    if (data.init_point) {
      return res.status(200).json({ url: data.init_point });
    } else {
      return res.status(400).json({ error: 'Erro ao criar assinatura', detalhes: data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno', detalhes: error.message });
  }
}