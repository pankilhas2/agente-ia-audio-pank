import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Aqui você usaria a API do Replicate com modelo `lama-cleaner` ou `segment-anything`

  return NextResponse.json({
    url: 'https://via.placeholder.com/600x400.png?text=Imagem+Sem+Objeto',
  });
}