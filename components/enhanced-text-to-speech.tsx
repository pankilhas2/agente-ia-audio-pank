"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Loader2, Settings } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EnhancedTextToSpeechProps {
  text: string
  className?: string
}

export function EnhancedTextToSpeech({ text, className = "" }: EnhancedTextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [speed, setSpeed] = useState([0.9])
  const [pitch, setPitch] = useState([1.1])
  const [voice, setVoice] = useState("auto")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speakText = async () => {
    if (isPlaying) {
      // Parar a fala atual
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    setIsLoading(true)

    try {
      // Tentar usar Google TTS primeiro
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (data.success && data.audioContent) {
        // Usar Google TTS
        const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0))], {
          type: "audio/mp3",
        })
        const audioUrl = URL.createObjectURL(audioBlob)

        audioRef.current = new Audio(audioUrl)
        audioRef.current.onplay = () => {
          setIsLoading(false)
          setIsPlaying(true)
        }
        audioRef.current.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }
        audioRef.current.onerror = () => {
          setIsLoading(false)
          setIsPlaying(false)
          fallbackToBrowserTTS()
        }

        audioRef.current.play()
      } else {
        // Fallback para browser TTS
        fallbackToBrowserTTS()
      }
    } catch (error) {
      console.error("Erro no TTS:", error)
      fallbackToBrowserTTS()
    }
  }

  const fallbackToBrowserTTS = () => {
    if (!window.speechSynthesis) {
      setIsLoading(false)
      console.error("Text-to-Speech não suportado neste navegador")
      return
    }

    const cleanText = text
      .replace(/[🎵🎧🔊🎤🤖🔧]/gu, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = "pt-BR"
    utterance.rate = speed[0]
    utterance.pitch = pitch[0]
    utterance.volume = 0.8

    // Selecionar voz
    if (voice !== "auto") {
      const voices = window.speechSynthesis.getVoices()
      const selectedVoice = voices.find((v) => v.name === voice)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    utterance.onstart = () => {
      setIsLoading(false)
      setIsPlaying(true)
    }

    utterance.onend = () => {
      setIsPlaying(false)
    }

    utterance.onerror = () => {
      setIsLoading(false)
      setIsPlaying(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={speakText}
        variant="ghost"
        size="sm"
        className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${className} ${
          isPlaying ? "bg-cyan-500/80 text-white animate-pulse" : "bg-purple-500/80 hover:bg-purple-400 text-white"
        }`}
        title={isPlaying ? "Parar áudio" : "Escutar resposta"}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="h-3 w-3" />
        ) : (
          <Volume2 className="h-3 w-3" />
        )}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 rounded-full bg-purple-500/60 hover:bg-purple-400/80 text-white transition-all duration-200"
            title="Configurações de voz"
          >
            <Settings className="h-2 w-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-black/90 border-purple-500/30 text-white">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-purple-300 block mb-2">Velocidade</label>
              <Slider value={speed} onValueChange={setSpeed} min={0.5} max={2} step={0.1} className="w-full" />
              <span className="text-xs text-cyan-300">{speed[0]}x</span>
            </div>

            <div>
              <label className="text-sm text-purple-300 block mb-2">Tom</label>
              <Slider value={pitch} onValueChange={setPitch} min={0.5} max={2} step={0.1} className="w-full" />
              <span className="text-xs text-cyan-300">{pitch[0]}</span>
            </div>

            <div>
              <label className="text-sm text-purple-300 block mb-2">Voz</label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="bg-black/60 border-purple-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-purple-500/30">
                  <SelectItem value="auto">Automática</SelectItem>
                  <SelectItem value="google">Google TTS (Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
