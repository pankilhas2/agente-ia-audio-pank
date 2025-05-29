"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AdminButton() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const supabase = createClientComponentClient()

  const handleClick = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push("/admin/painel")
    } else {
      router.push("/admin/login")
    }
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-4 right-4 p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-lg"
      aria-label="Painel Administrativo"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        <path d="M12 3a9 9 0 1 0 9 9" />
        <path d="M12 3v6l4-4" />
      </svg>
      {isHovered && (
        <div className="absolute right-12 top-2 bg-black text-white text-sm py-1 px-2 rounded whitespace-nowrap">
          Painel Admin
        </div>
      )}
    </button>
  )
}