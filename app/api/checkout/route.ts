import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { produtoId } = await request.json();

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: [
        {
          title: "Assinatura VIP - ÁUDIO PANK",
          unit_price: 9.90,
          quantity: 1
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento?status=approved`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento?status=failed`
      },
      auto_return: "approved"
    })
  });

  const data = await response.json();
  return Response.json({ init_point: data.init_point });
}
