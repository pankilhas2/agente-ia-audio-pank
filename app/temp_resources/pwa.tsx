"use client"

import { useEffect } from "react"
import { syncService } from "@/lib/sync-service"

export function PWAInstaller() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js")
          console.log("ServiceWorker registration successful with scope: ", registration.scope)

          // Register for background sync if supported
          if ("sync" in registration) {
            // Trigger background sync when coming online
            window.addEventListener("online", () => {
              registration.sync.register("sync-messages").catch((err) => {
                console.error("Error registering background sync:", err)
              })
            })

            // Initial registration if online
            if (navigator.onLine) {
              registration.sync.register("sync-messages").catch((err) => {
                console.error("Error registering background sync:", err)
              })
            }
          } else {
            console.log("Background Sync not supported")
          }
        } catch (err) {
          console.log("ServiceWorker registration failed: ", err)
        }
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type) {
          switch (event.data.type) {
            case "SYNC_STARTED":
              console.log("Background sync started")
              break
            case "SYNC_COMPLETED":
              console.log("Background sync completed")
              syncService.sync() // Update UI
              break
            case "SYNC_FAILED":
              console.error("Background sync failed:", event.data.error)
              break
          }
        }
      })
    }

    // Add beforeinstallprompt event handler
    let deferredPrompt: any
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt = e

      // Show the install button if available
      const installButton = document.getElementById("install-button")
      if (installButton) {
        installButton.style.display = "block"

        installButton.addEventListener("click", () => {
          // Show the install prompt
          deferredPrompt.prompt()

          // Wait for the user to respond to the prompt
          deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === "accepted") {
              console.log("User accepted the install prompt")
            } else {
              console.log("User dismissed the install prompt")
            }
            deferredPrompt = null

            // Hide the install button
            installButton.style.display = "none"
          })
        })
      }
    })

    // Handle app installed event
    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed")
      // Hide the install button
      const installButton = document.getElementById("install-button")
      if (installButton) {
        installButton.style.display = "none"
      }
    })
  }, [])

  return null
}
