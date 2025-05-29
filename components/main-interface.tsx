"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Mic, Play, Square, Upload, Save, AudioWaveformIcon as Waveform, Headphones } from "lucide-react"
import supabase from "@/lib/supabase-client"

export default function MainInterface() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioFiles, setAudioFiles] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState("gravar")
  const [volume, setVolume] = useState([75])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch audio files from Supabase on component mount
  useEffect(() => {
    fetchAudioFiles()
  }, [])

  const fetchAudioFiles = async () => {
    try {
      const { data, error } = await supabase.from("audio_files").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setAudioFiles(data || [])
    } catch (error) {
      console.error("Error fetching audio files:", error)
    }
  }

  const startRecording = async () => {
    try {
      audioChunksRef.current = []
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)

        if (audioRef.current) {
          audioRef.current.src = url
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioURL) {
      audioRef.current.play()
      setIsPlaying(true)

      audioRef.current.onended = () => {
        setIsPlaying(false)
      }
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const saveAudio = async () => {
    if (!audioURL) return

    try {
      const audioBlob = await fetch(audioURL).then((r) => r.blob())
      const fileName = `audio_${Date.now()}.wav`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("audio").upload(fileName, audioBlob)

      if (error) throw error

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("audio").getPublicUrl(fileName)

      // Save metadata to database
      const { error: dbError } = await supabase.from("audio_files").insert([
        {
          name: fileName,
          url: publicUrl,
          duration: recordingTime,
        },
      ])

      if (dbError) throw dbError

      // Refresh audio files list
      fetchAudioFiles()
    } catch (error) {
      console.error("Error saving audio:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="gravar" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gravar">Gravar</TabsTrigger>
          <TabsTrigger value="biblioteca">Biblioteca</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="gravar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gravação de Áudio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <div className="w-full bg-gray-800 rounded-lg p-6 flex flex-col items-center">
                  {audioURL ? (
                    <div className="w-full h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                      <Waveform className="h-16 w-16 text-pink-500" />
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">Nenhum áudio gravado</p>
                    </div>
                  )}

                  <div className="text-2xl font-mono mt-4">{formatTime(recordingTime)}</div>

                  <div className="flex space-x-4 mt-6">
                    {!isRecording ? (
                      <Button onClick={startRecording} className="bg-pink-600 hover:bg-pink-700" size="lg">
                        <Mic className="mr-2 h-5 w-5" />
                        Iniciar Gravação
                      </Button>
                    ) : (
                      <Button onClick={stopRecording} variant="destructive" size="lg">
                        <Square className="mr-2 h-5 w-5" />
                        Parar Gravação
                      </Button>
                    )}
                  </div>

                  {audioURL && (
                    <div className="w-full mt-6 space-y-4">
                      <div className="flex space-x-4 justify-center">
                        {!isPlaying ? (
                          <Button onClick={playAudio} variant="outline">
                            <Play className="mr-2 h-4 w-4" />
                            Reproduzir
                          </Button>
                        ) : (
                          <Button onClick={stopAudio} variant="outline">
                            <Square className="mr-2 h-4 w-4" />
                            Parar
                          </Button>
                        )}

                        <Button onClick={saveAudio} className="bg-green-600 hover:bg-green-700">
                          <Save className="mr-2 h-4 w-4" />
                          Salvar
                        </Button>
                      </div>

                      <audio ref={audioRef} className="hidden" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biblioteca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de Áudios</CardTitle>
            </CardHeader>
            <CardContent>
              {audioFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {audioFiles.map((file) => (
                    <Card key={file.id} className="overflow-hidden">
                      <div className="p-4 flex items-center space-x-4">
                        <div className="bg-gray-800 p-3 rounded-full">
                          <Headphones className="h-6 w-6 text-pink-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{file.name}</h3>
                          <p className="text-sm text-gray-400">{formatTime(file.duration)}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">Nenhum áudio na biblioteca</p>
                  <Button onClick={() => setSelectedTab("gravar")} variant="outline" className="mt-4">
                    Gravar um áudio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Volume</label>
                    <span className="text-sm text-gray-400">{volume[0]}%</span>
                  </div>
                  <Slider defaultValue={[75]} max={100} step={1} value={volume} onValueChange={setVolume} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Importar Áudio</label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-400">Arraste um arquivo de áudio ou clique para selecionar</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Selecionar Arquivo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
