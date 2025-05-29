"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  Play,
  Pause,
  Loader2,
  FileAudio,
  AudioWaveformIcon as Waveform,
  Brain,
  MessageSquare,
  BarChart3,
  Mic,
  Square,
} from "lucide-react"

interface RealAudioProcessorProps {
  onTranscription?: (text: string) => void
  onAnalysis?: (analysis: any) => void
}

export function RealAudioProcessor({ onTranscription, onAnalysis }: RealAudioProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcription, setTranscription] = useState<string>("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      setTranscription("")
      setAnalysis(null)
      setDetailedAnalysis(null)
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      recordedChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/wav" })
        const file = new File([blob], "gravacao.wav", { type: "audio/wav" })
        setAudioFile(file)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Parar todas as tracks do stream
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

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
          return prev + 15
        })
      }, 300)

      // Transcrição
      const formData = new FormData()
      formData.append("audio", audioFile)

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      const transcribeData = await transcribeResponse.json()

      if (transcribeData.success) {
        setTranscription(transcribeData.transcription)
        setAnalysis(transcribeData.analysis)
        onTranscription?.(transcribeData.transcription)
        onAnalysis?.(transcribeData.analysis)
      }

      // Análise detalhada
      const analyzeResponse = await fetch("/api/analyze-audio", {
        method: "POST",
        body: formData,
      })

      const analyzeData = await analyzeResponse.json()

      if (analyzeData.success) {
        setDetailedAnalysis(analyzeData.analysis)
      }

      setProgress(100)
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
      {/* Upload e Gravação */}
      <Card className="bg-black/40 border-purple-500/30 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Brain className="h-5 w-5" />
            Processamento de Áudio IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Áudio
            </Button>

            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Parar Gravação
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Gravar Áudio
                </>
              )}
            </Button>
          </div>

          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />

          {audioFile && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-purple-300">{audioFile.name}</span>
              </div>

              <audio ref={audioRef} src={audioUrl || undefined} className="hidden" />

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

      {/* Resultados */}
      {(transcription || detailedAnalysis) && (
        <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-xl">
          <CardContent className="p-0">
            <Tabs defaultValue="transcription" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/60">
                <TabsTrigger value="transcription" className="data-[state=active]:bg-purple-500/50">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Transcrição
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-500/50">
                  <Waveform className="h-4 w-4 mr-2" />
                  Análise Básica
                </TabsTrigger>
                <TabsTrigger value="detailed" className="data-[state=active]:bg-purple-500/50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Análise Avançada
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transcription" className="p-4">
                {transcription && (
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">Transcrição</h3>
                    <p className="text-purple-100 leading-relaxed">{transcription}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="p-4">
                {analysis && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Análise Básica</h3>
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
                  </div>
                )}
              </TabsContent>

              <TabsContent value="detailed" className="p-4">
                {detailedAnalysis && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Análise Técnica Avançada</h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-purple-300">Formato:</span>
                        <p className="text-white font-medium">{detailedAnalysis.format}</p>
                      </div>
                      <div>
                        <span className="text-sm text-purple-300">Tamanho:</span>
                        <p className="text-white font-medium">{detailedAnalysis.size}</p>
                      </div>
                      <div>
                        <span className="text-sm text-purple-300">Qualidade:</span>
                        <p className="text-white font-medium">{detailedAnalysis.quality}</p>
                      </div>
                      <div>
                        <span className="text-sm text-purple-300">Canais:</span>
                        <p className="text-white font-medium">{detailedAnalysis.channels}</p>
                      </div>
                      <div>
                        <span className="text-sm text-purple-300">Sample Rate:</span>
                        <p className="text-white font-medium">{detailedAnalysis.sampleRate}</p>
                      </div>
                      <div>
                        <span className="text-sm text-purple-300">Bit Rate:</span>
                        <p className="text-white font-medium">{detailedAnalysis.bitRate}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-purple-300 block mb-2">Características Detectadas:</span>
                      <div className="flex flex-wrap gap-2">
                        {detailedAnalysis.features?.map((feature: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-purple-500/50 text-purple-300">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {detailedAnalysis.loudness && (
                      <div>
                        <span className="text-sm text-purple-300 block mb-2">Análise de Volume:</span>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-purple-300">Peak:</span>
                            <p className="text-white">{detailedAnalysis.loudness.peak.toFixed(1)} dB</p>
                          </div>
                          <div>
                            <span className="text-purple-300">RMS:</span>
                            <p className="text-white">{detailedAnalysis.loudness.rms.toFixed(1)} dB</p>
                          </div>
                          <div>
                            <span className="text-purple-300">LUFS:</span>
                            <p className="text-white">{detailedAnalysis.loudness.lufs.toFixed(1)} LUFS</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
