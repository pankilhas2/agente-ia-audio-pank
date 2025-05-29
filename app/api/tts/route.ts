import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Texto não fornecido" }, { status: 400 })
    }

    // Se tiver Google TTS API Key, usar Google TTS
    if (process.env.GOOGLE_TTS_API_KEY) {
      try {
        const response = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              input: {
                text: text
                  .replace(/[🎵🎧🔊🎤🤖🔧]/gu, "")
                  .replace(/\*\*/g, "")
                  .trim(),
              },
              voice: {
                languageCode: "pt-BR",
                name: "pt-BR-Wavenet-A", // Voz feminina brasileira
                ssmlGender: "FEMALE",
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: 0.9,
                pitch: 1.1,
                volumeGainDb: 0.0,
              },
            }),
          },
        )

        const data = await response.json()

        if (data.audioContent) {
          return NextResponse.json({
            success: true,
            audioContent: data.audioContent,
            provider: "google",
          })
        }
      } catch (error) {
        console.error("Erro no Google TTS:", error)
        // Fallback para browser TTS
      }
    }

    // Fallback: usar browser TTS
    return NextResponse.json({
      success: true,
      useBrowserTTS: true,
      provider: "browser",
    })
  } catch (error) {
    console.error("Erro na API TTS:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
