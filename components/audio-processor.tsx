"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Play,
  Pause,
  Loader2,
  FileAudio,
  AudioWaveformIcon as Waveform,
  Brain,
  MessageSquare,
} from "lucide-react"

interface AudioProcessorProps {
  onTranscription?: (text: string) => void
  onAnalysis?: (analysis: any) => void
}

export function AudioProcessor({ onTranscription, onAnalysis }: AudioProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcription, setTranscription] = useState<string>("")
  const [analysis, setAnalysis] = useState<any>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      setTranscription("")
      setAnalysis(null)
    }
  }, [])

  const processAudio = useCallback(async () => {
    if (!audioFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Aqui você integraria com APIs reais de IA
      // Por exemplo: OpenAI Whisper para transcrição

      // Simulação de processamento
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const mockTranscription =
        "Esta é uma transcrição simulada do áudio enviado. O ÁUDIO PANK AI processou com sucesso o conteúdo de áudio."
      const mockAnalysis = {
        duration: "2:34",
        language: "Português",
        sentiment: "Neutro",
        keywords: ["áudio", "processamento", "IA", "tecnologia"],
        confidence: 0.95,
      }

      setTranscription(mockTranscription)
      setAnalysis(mockAnalysis)
      setProgress(100)

      onTranscription?.(mockTranscription)
      onAnalysis?.(mockAnalysis)
    } catch (error) {
      console.error("Erro no processamento:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [audioFile, onTranscription, onAnalysis])

  const togglePlayback = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="bg-black/40 border-purple-500/30 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
              <Brain className="h-3 w-3 text-white" />
            </div>
            Processamento de Áudio IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Áudio
            </Button>

            {audioFile && (
              <div className="flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-purple-300">{audioFile.name}</span>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />

          {audioUrl && (
            <div className="space-y-4">
              <audio ref={audioRef} src={audioUrl} className="hidden" />

              <div className="flex items-center gap-2">
                <Button
                  onClick={togglePlayback}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <Button
                  onClick={processAudio}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Processar com IA
                    </>
                  )}
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300">Processando áudio...</span>
                    <span className="text-cyan-300">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {transcription && (
        <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <MessageSquare className="h-5 w-5" />
              Transcrição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed">{transcription}</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-300">
              <Waveform className="h-5 w-5" />
              Análise de Áudio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-purple-300">Duração:</span>
                <p className="text-white font-medium">{analysis.duration}</p>
              </div>
              <div>
                <span className="text-sm text-purple-300">Idioma:</span>
                <p className="text-white font-medium">{analysis.language}</p>
              </div>
              <div>
                <span className="text-sm text-purple-300">Sentimento:</span>
                <p className="text-white font-medium">{analysis.sentiment}</p>
              </div>
              <div>
                <span className="text-sm text-purple-300">Confiança:</span>
                <p className="text-white font-medium">{(analysis.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-purple-300 block mb-2">Palavras-chave:</span>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-cyan-500/50 text-cyan-300">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
