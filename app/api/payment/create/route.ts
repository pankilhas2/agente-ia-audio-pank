import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, description, userEmail } = await request.json()

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 })
    }

    const preference = {
      items: [
        {
          title: description || "ÁUDIO PANK AI - Processamento Premium",
          unit_price: amount,
          quantity: 1,
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/webhook`,
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    })

    const data = await response.json()

    if (data.id) {
      return NextResponse.json({
        success: true,
        preferenceId: data.id,
        initPoint: data.init_point,
      })
    } else {
      return NextResponse.json({ error: "Erro ao criar preferência de pagamento" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro ao criar pagamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
