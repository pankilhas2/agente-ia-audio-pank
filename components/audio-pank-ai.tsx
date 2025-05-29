"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { AlertTriangle, X, Mic, Square, Send, Volume2, Sliders, Phone, Copy, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import getSupabaseClient, { isSupabaseConfigured } from "@/lib/supabase-client"
import { AudioProcessor } from "./audio-processor"

export default function AudioPankAI() {
  const router = useRouter()
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Olá! Eu sou a Áudio Pank AI. Em que posso te ajudar hoje?", criado_em: new Date() },
  ])
  const [input, setInput] = useState("")
  const [whatsInput, setWhatsInput] = useState("")
  const [showWhatsForm, setShowWhatsForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)
  const [showSupabaseAlert, setShowSupabaseAlert] = useState(true)
  const [transcribingAudio, setTranscribingAudio] = useState(false)
  const [audioProcessingEnabled, setAudioProcessingEnabled] = useState(true)
  const [noiseReduction, setNoiseReduction] = useState(true)
  const [autoEqualizer, setAutoEqualizer] = useState(true)
  const [silenceDetection, setSilenceDetection] = useState(false)
  const [language, setLanguage] = useState("pt")
  const [recordingTime, setRecordingTime] = useState(0)

  const audioProcessorRef = useRef<AudioProcessor | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const usuario = "Usuario" // Você pode personalizar ou obter de um estado de autenticação

  // Verificar se o Supabase está configurado
  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured())

    // Configurar timer para esconder o alerta após 10 segundos
    if (!isSupabaseConfigured()) {
      const timer = setTimeout(() => {
        setShowSupabaseAlert(false)
      }, 10000) // 10 segundos

      return () => clearTimeout(timer)
    }
  }, [])

  // Buscar mensagens antigas do Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Se o Supabase não estiver configurado, não tentamos buscar mensagens
        if (!isSupabaseConfigured()) return

        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from("mensagens_chat")
          .select("*")
          .eq("usuario", usuario)
          .order("criado_em", { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          const formatadas = data.flatMap((item) => [
            { role: "user", content: item.mensagem, criado_em: new Date(item.criado_em) },
            { role: "assistant", content: item.resposta, criado_em: new Date(item.criado_em) },
          ])

          setMessages(formatadas)
        }
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error)
      }
    }

    // Apenas busca mensagens no cliente
    if (typeof window !== "undefined") {
      fetchMessages()
    }

    // Toast de boas-vindas
    toast({
      title: "Olá!",
      description: "Seja bem-vindo ao Agente IA – Áudio Pank. Como posso te ajudar hoje?",
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }, [toast])

  // Scroll para o final das mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleTopicSelection = (topic: string) => {
    setInput(topic)
    sendMessage(topic)
  }

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input
    if (!messageToSend.trim()) return
    setError(null)

    const userMessage = { role: "user", content: messageToSend, criado_em: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Usando um timeout para evitar que a requisição demore muito
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 segundos de timeout para o Groq

      // Chamando a API de chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: messageToSend,
          messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Mesmo se a resposta não for ok, tentamos processar o resultado
      const data = await response.json()

      // Se temos um resultado, o usamos mesmo se houver um erro
      if (data.result) {
        // Removendo símbolos especiais do início da resposta
        const cleanResponse = data.result.replace(/^\s*[\*\+\-\>\#\@\$\%\^\&\(\)\[\]\{\}\|\=\~\`\:\;\'\"\<\>\/\\]+\s*/i, '')
        const aiResponse = { role: "assistant", content: cleanResponse, criado_em: new Date() }
        setMessages((prev) => [...prev, aiResponse])

        // Salvar no Supabase apenas se estiver configurado
        if (isSupabaseConfigured()) {
          try {
            const supabase = getSupabaseClient()
            await supabase.from("mensagens_chat").insert([
              {
                usuario,
                mensagem: messageToSend,
                resposta: data.result,
                criado_em: new Date().toISOString(),
              },
            ])
          } catch (supabaseError) {
            console.error("Erro ao salvar mensagem no Supabase:", supabaseError)
            // Não mostramos esse erro para o usuário, pois a funcionalidade principal já funcionou
          }
        }
      } else if (data.error) {
        // Se temos um erro específico, o mostramos
        throw new Error(data.error)
      } else if (!response.ok) {
        // Se a resposta não foi ok e não temos um resultado ou erro específico
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error)

      // Adicionamos uma resposta de fallback para o usuário não ficar sem resposta
      const fallbackResponse = {
        role: "assistant",
        content: "Desculpe, estou tendo problemas para responder neste momento. Por favor, tente novamente mais tarde.",
        criado_em: new Date(),
      }
      setMessages((prev) => [...prev, fallbackResponse])

      // Ainda mostramos o erro para o usuário saber o que aconteceu
      if (error.name === "AbortError") {
        setError("A resposta demorou muito. Tente novamente.")
      } else {
        setError("Não foi possível obter resposta: " + (error.message || "Erro desconhecido"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      setError(null)
      audioChunksRef.current = []
      setRecordingTime(0)

      // Iniciar o timer para mostrar o tempo de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      if (audioProcessingEnabled) {
        // Usar o processador de áudio simplificado
        audioProcessorRef.current = new AudioProcessor({
          noiseReduction,
          autoEqualizer,
          silenceDetection,
        })

        await audioProcessorRef.current.startRecording()
      } else {
        // Usar a gravação padrão
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorderRef.current.start()
      }

      setRecording(true)
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err)
      setError("Não foi possível iniciar a gravação. Verifique se o microfone está conectado.")

      // Limpar o timer se houver erro
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const stopRecording = async () => {
    // Parar o timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setRecording(false)
    setTranscribingAudio(true)

    try {
      let audioBlob: Blob

      if (audioProcessingEnabled && audioProcessorRef.current) {
        // Obter o áudio processado
        audioBlob = await audioProcessorRef.current.stopRecording()
      } else if (mediaRecorderRef.current) {
        // Parar a gravação padrão
        return new Promise<void>((resolve) => {
          if (!mediaRecorderRef.current) {
            resolve()
            return
          }

          mediaRecorderRef.current.onstop = () => {
            audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

            // Parar todas as faixas do stream
            mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop())

            // Transcrever o áudio
            transcribeAudio(audioBlob)
            resolve()
          }

          mediaRecorderRef.current.stop()
        })
      } else {
        throw new Error("Nenhum gravador disponível")
      }

      // Transcrever o áudio
      await transcribeAudio(audioBlob)
    } catch (error) {
      console.error("Erro ao parar gravação:", error)
      setError("Ocorreu um erro ao processar o áudio gravado.")
      setTranscribingAudio(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Se não temos a API key da OpenAI, usamos uma transcrição simulada
      if (!process.env.OPENAI_API_KEY) {
        // Simulação de transcrição para testes
        setTimeout(() => {
          const transcribedText = "Esta é uma transcrição simulada do áudio gravado."
          const userMessage = { role: "user", content: transcribedText, criado_em: new Date() }
          setMessages((prev) => [...prev, userMessage])
          sendMessage(transcribedText)
          setTranscribingAudio(false)
        }, 1500)
        return
      }

      // Criar um FormData para enviar o arquivo
      const formData = new FormData()
      formData.append("audio", audioBlob)
      formData.append("language", language)
      formData.append("duration", recordingTime.toString())

      // Enviar para a API de transcrição
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Erro na transcrição: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Usar o texto transcrito
      const transcribedText = data.text

      // Adicionar a mensagem do usuário com o texto transcrito
      const userMessage = { role: "user", content: transcribedText, criado_em: new Date() }
      setMessages((prev) => [...prev, userMessage])

      // Enviar para a API de chat
      await sendMessage(transcribedText)
    } catch (error) {
      console.error("Erro na transcrição:", error)
      setError("Não foi possível transcrever o áudio. Por favor, tente novamente.")
    } finally {
      setTranscribingAudio(false)
    }
  }

  const sendWhatsMessage = () => {
    const lastMessage = messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content || ""
    const msg = encodeURIComponent(`${lastMessage}\n\n(Enviado via Áudio Pank AI)`)
    const phone = whatsInput.replace(/\D/g, "")
    if (phone.length >= 10) {
      const url = `https://wa.me/55${phone}?text=${msg}`
      window.open(url, "_blank")
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!supabaseConfigured && showSupabaseAlert && (
        <Alert className="mb-4 bg-amber-900 border-amber-800 relative">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-200">
            Modo de demonstração: O Supabase não está configurado. O histórico de mensagens e gravações de áudio não
            serão salvos.
          </AlertDescription>
          <button
            onClick={() => setShowSupabaseAlert(false)}
            className="absolute top-2 right-2 text-amber-200 hover:text-white"
          >
            <X size={16} />
          </button>
        </Alert>
      )}

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat AI</TabsTrigger>
          <TabsTrigger value="audio">Gravador de Áudio</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative w-12 h-12">
              <img src="/logo-audio-pank.png" alt="Logo Áudio Pank AI" className="w-12 h-12 rounded-full" />
            </div>

            <h1 className="text-2xl font-semibold">Áudio Pank AI</h1>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 flex-grow">
            <div className="h-[calc(100vh-350px)] overflow-y-auto pr-4 border-r border-gray-800">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-1.5 rounded-md p-3 ${
                    message.role === "user" ? "bg-gray-100 dark:bg-gray-700" : "bg-blue-100 dark:bg-blue-700"
                  }`}
                >
                  <div className="text-sm font-bold">{message.role === "user" ? "Você" : "Áudio Pank AI"}</div>
                  <div className="flex justify-between items-start">
                    <div className="whitespace-pre-wrap text-base flex-1">{message.content}</div>
                    {message.role === "assistant" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(message.content)
                          toast({
                            title: "Copiado!",
                            description: "A resposta foi copiada para a área de transferência.",
                          })
                        }}
                        className="p-2 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-full transition-colors flex-shrink-0"
                      >
                        <Copy className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(message.criado_em)}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center h-12 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              className="flex-grow rounded-md border p-3 dark:bg-gray-800 dark:text-white text-base"
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <button
              className="rounded-md bg-blue-500 p-3 text-white hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center text-base"
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <span className="animate-pulse">Enviando...</span> : <Send className="h-6 w-6" />}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              className="rounded-md bg-gray-200 p-3 text-base hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 w-full"
              onClick={() => handleTopicSelection("Como funciona o plano de assinatura?")}
            >
              Como funciona o plano de assinatura?
            </button>
            <button
              className="rounded-md bg-gray-200 p-3 text-base hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 w-full"
              onClick={() => handleTopicSelection("Quais são as formas de pagamento?")}
            >
              Quais são as formas de pagamento?
            </button>
            <button
              className="rounded-md bg-gray-200 p-3 text-base hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 w-full"
              onClick={() => handleTopicSelection("Como cancelar a assinatura?")}
            >
              Como cancelar a assinatura?
            </button>
            <button
              className="rounded-md bg-gray-200 p-3 text-base hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 w-full"
              onClick={() => handleTopicSelection("Onde encontro mais informações sobre a Áudio Pank?")}
            >
              Onde encontro mais informações sobre a Áudio Pank Produtora?
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center h-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}





          <button
            className="mt-2 rounded-md bg-green-500 p-2 text-white hover:bg-green-600 disabled:bg-green-300"
            onClick={() => setShowWhatsForm(true)}
            disabled={messages.filter((m) => m.role === "assistant").length === 0}
          >
            Enviar última mensagem para o WhatsApp
          </button>

          {showWhatsForm && (
            <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
              <div className="relative bg-white rounded-md p-4 dark:bg-gray-900">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowWhatsForm(false)}
                >
                  <X size={20} />
                </button>
                <h2 className="text-lg font-semibold mb-2">Enviar mensagem para o WhatsApp</h2>
                <input
                  type="tel"
                  className="w-full rounded-md border p-2 mb-3 dark:bg-gray-800 dark:text-white"
                  placeholder="Digite o número do WhatsApp com DDD"
                  value={whatsInput}
                  onChange={(e) => setWhatsInput(e.target.value)}
                />
                <button
                  className="rounded-md bg-green-500 p-2 text-white hover:bg-green-600 disabled:bg-green-300"
                  onClick={sendWhatsMessage}
                >
                  Enviar
                </button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-zinc-800 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-purple-400" />
              <span>Configurações de Áudio</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="audio-processing"
                    checked={audioProcessingEnabled}
                    onCheckedChange={setAudioProcessingEnabled}
                  />
                  <Label htmlFor="audio-processing">Processamento avançado de áudio</Label>
                </div>
              </div>

              {audioProcessingEnabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="noise-reduction" checked={noiseReduction} onCheckedChange={setNoiseReduction} />
                      <Label htmlFor="noise-reduction">Redução de ruído</Label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="auto-equalizer" checked={autoEqualizer} onCheckedChange={setAutoEqualizer} />
                      <Label htmlFor="auto-equalizer">Equalização automática</Label>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="language">Idioma para transcrição</Label>
                <select
                  id="language"
                  className="w-full rounded-md border p-2 bg-zinc-700 text-white"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="pt">Português</option>
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                  <option value="fr">Francês</option>
                  <option value="de">Alemão</option>
                  <option value="it">Italiano</option>
                  <option value="auto">Detecção automática</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            {recording && (
              <div className="text-2xl font-mono text-white bg-zinc-800 px-4 py-2 rounded-md">
                {formatTime(recordingTime)}
              </div>
            )}

            <div className="flex justify-center">
              <button
                className={`rounded-md p-4 text-white ${
                  recording ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                } disabled:bg-gray-300 flex items-center gap-2`}
                onClick={recording ? stopRecording : startRecording}
                disabled={isLoading || transcribingAudio}
              >
                {recording ? (
                  <>
                    <Square className="h-5 w-5" />
                    <span>Parar Gravação</span>
                  </>
                ) : transcribingAudio ? (
                  <>
                    <span className="animate-pulse">Transcrevendo áudio...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    <span>Iniciar Gravação</span>
                  </>
                )}
              </button>
            </div>

            {audioProcessingEnabled && (
              <div className="flex items-center text-sm text-gray-400 gap-2">
                <Volume2 className="h-4 w-4" />
                <span>Processamento de áudio ativado</span>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <div className="relative">
        <div className="fixed bottom-2 right-2 z-50 flex gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-500 p-4 hover:bg-green-600 flex items-center justify-center transition-all duration-300 ease-in-out"
            title="Fale conosco pelo WhatsApp"
          >
            <Phone className="h-7 w-7 text-white" />
          </a>
        </div>
      </div>
    </div>
  )}
}
