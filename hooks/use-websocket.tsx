"use client"

import { useState, useEffect, useCallback } from "react"

type ConnectionStatus = "connecting" | "connected" | "disconnected"

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")

  // Connect to WebSocket server
  const connectWebSocket = useCallback(() => {
    // Check if we have a WebSocket URL in env
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || null

    if (websocketUrl) {
      // Connect to real WebSocket server
      try {
        setConnectionStatus("connecting")
        const ws = new WebSocket(websocketUrl)

        ws.onopen = () => {
          setConnectionStatus("connected")
          console.log("WebSocket connected")
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setLastMessage(data)
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        ws.onclose = () => {
          setConnectionStatus("disconnected")
          console.log("WebSocket disconnected")
          // Try to reconnect after a delay
          setTimeout(connectWebSocket, 5000)
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          ws.close()
        }

        setSocket(ws)

        return () => {
          ws.close()
        }
      } catch (error) {
        console.error("Error connecting to WebSocket:", error)
        setConnectionStatus("disconnected")
        // Fallback to mock WebSocket
        mockWebSocket()
      }
    } else {
      // Use mock WebSocket
      mockWebSocket()
    }
  }, [])

  // Mock WebSocket for development/demo
  const mockWebSocket = useCallback(() => {
    setConnectionStatus("connecting")

    // Simulate connection delay
    setTimeout(() => {
      setConnectionStatus("connected")
      console.log("Mock WebSocket connected")

      // Simulate receiving messages periodically
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          // 30% chance of receiving a message
          const mockEventNames = [
            "Tech Conference 2023",
            "Music Festival",
            "Corporate Retreat",
            "Charity Gala",
            "Sports Tournament",
          ]

          const mockMessages = [
            "Weather alert: Strong winds expected in the area.",
            "Security alert: Suspicious activity reported near entrance B.",
            "Medical emergency reported in section C4.",
            "Fire alarm triggered in the west wing.",
            "Traffic congestion reported at main entrance.",
            "Power outage affecting parts of the venue.",
            "VIP guest arrival in 15 minutes, prepare security detail.",
          ]

          const mockSeverities = ["low", "medium", "high", "critical"]

          const mockMessage = {
            eventId: `evt_${Math.floor(Math.random() * 1000000)}`,
            eventName: mockEventNames[Math.floor(Math.random() * mockEventNames.length)],
            message: mockMessages[Math.floor(Math.random() * mockMessages.length)],
            severity: mockSeverities[Math.floor(Math.random() * mockSeverities.length)],
            timestamp: new Date().toISOString(),
          }

          setLastMessage(mockMessage)
        }
      }, 30000) // Check every 30 seconds

      // Store the interval ID for cleanup
      setSocket({ close: () => clearInterval(interval) } as any)

      return () => {
        clearInterval(interval)
        setConnectionStatus("disconnected")
      }
    }, 1500)
  }, [])

  useEffect(() => {
    connectWebSocket()

    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [connectWebSocket])

  return {
    lastMessage,
    connectionStatus,
    reconnect: connectWebSocket,
  }
}

