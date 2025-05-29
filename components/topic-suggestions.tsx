"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { BotIcon as Robot, ClubIcon as Football, Tv2 } from "lucide-react"

interface TopicSuggestionProps {
  onSelectTopic: (topic: string) => void
}

export default function TopicSuggestions({ onSelectTopic }: TopicSuggestionProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic)
    onSelectTopic(topic)
  }

  const topics = [
    {
      id: "ia",
      title: "Saber sobre IA",
      icon: <Robot className="h-5 w-5 text-purple-500" />,
      prompt: "Me explique de forma simples o que é Inteligência Artificial e como ela funciona.",
    },
    {
      id: "futebol",
      title: "Futebol Brasileiro",
      icon: <Football className="h-5 w-5 text-green-500" />,
      prompt: "Quais são os principais times do futebol brasileiro e suas conquistas recentes?",
    },
    {
      id: "tv",
      title: "Curiosidades da TV",
      icon: <Tv2 className="h-5 w-5 text-blue-500" />,
      prompt: "Me conte algumas curiosidades interessantes sobre programas de TV brasileiros.",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {topics.map((topic) => (
        <Card
          key={topic.id}
          className={`p-3 cursor-pointer transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 flex flex-col items-center justify-center text-center ${
            selectedTopic === topic.id ? "border-b-2 border-red-500" : ""
          }`}
          onClick={() => handleTopicClick(topic.prompt)}
        >
          <div className="mb-1">{topic.icon}</div>
          <div className="text-sm font-medium">{topic.title}</div>
        </Card>
      ))}
    </div>
  )
}
