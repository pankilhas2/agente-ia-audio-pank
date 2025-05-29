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
                resposta: cleanResponse,
                criado_em: new Date().toISOString(),
              },
            ])
          } catch (supabaseError) {
            console.error("Erro ao salvar mensagem no Supabase:", supabaseError)
          }
        }
      } else if (data.error) {
        throw new Error(data.error)
      } else if (!response.ok) {
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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)

        // Processar o áudio
        if (audioProcessorRef.current) {
          setTranscribingAudio(true)
          const transcription = await audioProcessorRef.current.processAudio(audioBlob)
          setTranscribingAudio(false)

          if (transcription) {
            setInput(transcription)
            sendMessage(transcription)
          }
        }

        // Limpar referências
        URL.revokeObjectURL(audioUrl)
        stream.getTracks().forEach(track => track.stop())
        mediaRecorderRef.current = null
      }

      mediaRecorderRef.current.start()
      setRecording(true)

      // Iniciar timer para mostrar o tempo de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error)
      setError("Erro ao iniciar gravação: " + (error as Error).message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setRecordingTime(0)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative w-full h-full p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {showSupabaseAlert && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            O Supabase não está configurado. As mensagens não serão salvas.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex flex-col gap-1.5 rounded-md p-3 ${
                        message.role === "user" ? "bg-gray-100 dark:bg-gray-700" : "bg-blue-100 dark:bg-blue-700"
                      }`}
                    >
                      <div className="text-sm font-bold">{message.role === "user" ? "Você" : "Áudio Pank AI"}</div>
                      <div className="flex gap-2 items-start">
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

              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-md border p-2 bg-zinc-700 text-white"
                  disabled={isLoading || recording || transcribingAudio}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || recording || transcribingAudio || !input.trim()}
                  className="rounded-md p-2 bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin">
                      <Volume2 className="h-5 w-5" />
                    </div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Switch
                    id="audioProcessing"
                    checked={audioProcessingEnabled}
                    onCheckedChange={setAudioProcessingEnabled}
                    disabled={recording || transcribingAudio}
                  />
                </div>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border p-2 bg-zinc-700 text-white"
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
          </div>
        </TabsContent>
        <TabsContent value="whatsapp">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={whatsInput}
                onChange={(e) => setWhatsInput(e.target.value)}
                placeholder="Digite o número do WhatsApp (ex: 5511999999999)"
                className="flex-1 rounded-md border p-2 bg-zinc-700 text-white"
              />
              <button
                onClick={() => {
                  setShowWhatsForm(true)
                  setInput(whatsInput)
                }}
                className="rounded-md p-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Enviar
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
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
  )
}
