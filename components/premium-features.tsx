"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Crown, Zap, Star, CreditCard } from "lucide-react"

export function PremiumFeatures() {
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async (planType: string, amount: number) => {
    if (!email) {
      alert("Por favor, insira seu email")
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description: `ÁUDIO PANK AI - Plano ${planType}`,
          userEmail: email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirecionar para o Mercado Pago
        window.open(data.initPoint, "_blank")
      } else {
        alert("Erro ao processar pagamento")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao processar pagamento")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="bg-black/40 border-yellow-500/30 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-300">
          <Crown className="h-5 w-5" />
          Recursos Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-purple-100">Google TTS Premium</span>
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-300 text-xs">
              PRO
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-purple-100">Processamento Ilimitado</span>
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-300 text-xs">
              PRO
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-400" />
            <span className="text-sm text-purple-100">Análise Avançada</span>
            <Badge variant="outline" className="border-green-500/50 text-green-300 text-xs">
              PRO
            </Badge>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade para PRO
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 border-purple-500/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-yellow-300">Escolha seu Plano Premium</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/60 border-purple-500/30 text-white"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-purple-500/20 border-purple-500/50">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold text-purple-300 mb-2">Mensal</h3>
                    <p className="text-2xl font-bold text-white mb-2">R$ 29,90</p>
                    <p className="text-sm text-purple-200 mb-4">por mês</p>
                    <Button
                      onClick={() => handlePurchase("Mensal", 29.9)}
                      disabled={isProcessing}
                      className="w-full bg-purple-500 hover:bg-purple-600"
                    >
                      {isProcessing ? "Processando..." : "Assinar"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-500/20 border-yellow-500/50">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold text-yellow-300 mb-2">Anual</h3>
                    <p className="text-2xl font-bold text-white mb-2">R$ 299,90</p>
                    <p className="text-sm text-yellow-200 mb-4">por ano (2 meses grátis)</p>
                    <Button
                      onClick={() => handlePurchase("Anual", 299.9)}
                      disabled={isProcessing}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      {isProcessing ? "Processando..." : "Assinar"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
