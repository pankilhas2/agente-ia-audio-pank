import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"
import { Toaster } from "../components/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AGENTE IA - ÁUDIO PANK",
  description: "Assistente de IA especializado em áudio e música",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-agente-ia.svg",
    apple: "/logo-agente-ia.svg",
  },
  generator: 'v0.dev',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Áudio Pank"
  }
}

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#A855F7"
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#A855F7"
    }
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      <Script
        id="register-sw"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  })
                  .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
              });
            }
          `,
        }}
      />
    </body>
  </html>
)
}
