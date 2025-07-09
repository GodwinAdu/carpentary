"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, type Socket } from "socket.io-client"
import { useCurrentUser } from "./useCurrentUser"
import useCurrentLocation from "./useTrackingLocatio"



interface UseSocketIOOptions {
  serverUrl?: string
  autoConnect?: boolean
}

export function useSocketIO(options: UseSocketIOOptions = {}) {
  const { serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:4000", autoConnect = true } = options

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [userCount, setUserCount] = useState(0)
  const [latency, setLatency] = useState<number | null>(null)
  const [currentSocketId, setCurrentSocketId] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "reconnecting"
  >("disconnected")

  const { user, isLoading: userLoading } = useCurrentUser()
  const { location, isLoading: locationLoading } = useCurrentLocation()

  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 10 // Increased for better resilience
  const pingInterval = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)
  const hasJoinedSession = useRef(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionCheckInterval = useRef<NodeJS.Timeout | null>(null)

  const joinTrackingSession = useCallback(() => {
    if (!socketRef.current?.connected || !user || hasJoinedSession.current) return

    console.log("🔗 Joining tracking session with user:", user)

    const joinData = {
      name: user.fullName,
      role: user.role,
      sessionId: "tracking-users",
      location: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        : null,
      speed: location?.speed || null,
      accuracy: location?.accuracy || null,
      heading: location?.heading || null,
    }

    console.log("📤 Sending join-tracking data:", joinData)
    socketRef.current.emit("join-tracking", joinData)
    hasJoinedSession.current = true
  }, [user, location])

  const connect = useCallback(() => {
    if (socketRef.current?.connected || userLoading) return

    console.log("🔌 Connecting to Socket.IO server:", serverUrl)
    setConnectionStatus("connecting")

    const socket = io(serverUrl, {
      // Enhanced connection options for Render stability
      transports: ["websocket", "polling"],
      timeout: 20000, // 20 seconds
      forceNew: false, // Reuse existing connection if possible
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000, // Max 10 seconds between attempts
      randomizationFactor: 0.5,
      withCredentials: true,

      // Render-specific optimizations
      upgrade: true,
      rememberUpgrade: true,

      // Polling configuration for unstable connections
      polling: {
        extraHeaders: {
          "Cache-Control": "no-cache",
        },
      },

      // WebSocket configuration
      websocket: {
        compression: true,
      },
    })

    // Connection events
    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server with ID:", socket.id)
      setIsConnected(true)
      setConnectionError(null)
      setCurrentSocketId(socket.id!)
      setConnectionStatus("connected")
      reconnectAttempts.current = 0
      hasJoinedSession.current = false

      // Clear any pending reconnection
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
        reconnectTimeout.current = null
      }

      // Join session after a short delay
      setTimeout(() => {
        joinTrackingSession()
      }, 500)

      // Start ping monitoring
      if (pingInterval.current) clearInterval(pingInterval.current)
      pingInterval.current = setInterval(() => {
        if (socket.connected) {
          const start = Date.now()
          socket.emit("ping", { timestamp: start })

          const timeout = setTimeout(() => {
            console.warn("⚠️ Ping timeout - connection may be unstable")
            setLatency(null)
          }, 10000)

          socket.once("pong", (data) => {
            clearTimeout(timeout)
            const latency = Date.now() - start
            setLatency(latency)

            // Log high latency
            if (latency > 5000) {
              console.warn(`⚠️ High latency detected: ${latency}ms`)
            }
          })
        }
      }, 30000) // Ping every 30 seconds
    })

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason)
      setIsConnected(false)
      setCurrentSocketId(null)
      setTypingUsers([])
      setConnectionStatus("disconnected")
      hasJoinedSession.current = false

      if (pingInterval.current) {
        clearInterval(pingInterval.current)
        pingInterval.current = null
      }

      // Handle different disconnect reasons
      if (reason === "io server disconnect") {
        // Server initiated disconnect - try to reconnect
        console.log("🔄 Server disconnected, attempting reconnection...")
        setConnectionStatus("reconnecting")
        scheduleReconnect()
      } else if (reason === "transport close" || reason === "transport error") {
        // Network issues - try to reconnect
        console.log("🔄 Network issue detected, attempting reconnection...")
        setConnectionStatus("reconnecting")
        scheduleReconnect()
      }
    })

    socket.on("connect_error", (error) => {
      console.error("🚫 Connection error:", error)
      setConnectionError(error.message)
      setConnectionStatus("reconnecting")
      reconnectAttempts.current++

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setConnectionError("Failed to connect after multiple attempts. Please refresh the page.")
        setConnectionStatus("disconnected")
      } else {
        scheduleReconnect()
      }
    })

    socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`)
      setConnectionError(null)
      reconnectAttempts.current = 0
    })

    socket.on("reconnect_error", (error) => {
      console.error("🔄 Reconnection error:", error)
      setConnectionError(`Reconnection failed: ${error.message}`)
    })

    socket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after all attempts")
      setConnectionError("Unable to reconnect. Please refresh the page.")
      setConnectionStatus("disconnected")
    })

    // Server shutdown notification
    socket.on("server-shutdown", (data) => {
      console.log("🔄 Server shutdown notification:", data.message)
      setConnectionError("Server is restarting. Reconnecting...")
      setConnectionStatus("reconnecting")
    })

    // Connection confirmation
    socket.on("connection-confirmed", (data) => {
      console.log("✅ Connection confirmed:", data)
      setConnectionError(null)
    })

    // Error handling
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error)
      setConnectionError(error.message || "Socket error occurred")
    })

    // User events
    socket.on("users-list", (usersList: User[]) => {
      console.log("📋 Received users list:", usersList)
      setUsers(usersList)
      setUserCount(usersList.length)
    })

    socket.on("user-joined", (newUser: User) => {
      console.log("👤 User joined:", newUser)
      setUsers((prev) => {
        const exists = prev.find((u) => u.id === newUser.id)
        if (exists) return prev
        return [...prev, newUser]
      })
      setUserCount((prev) => prev + 1)
    })

    socket.on("user-left", ({ userId }: { userId: string }) => {
      console.log("👋 User left:", userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId))
      setUserCount((prev) => Math.max(0, prev - 1))
    })

    socket.on("user-updated", (updatedUser: User) => {
      console.log("🔄 User updated:", updatedUser)
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
    })

    socket.on("user-count", (count: number) => {
      console.log("📊 User count updated:", count)
      setUserCount(count)
    })

    // Typing events
    socket.on("user-typing", (typingData: TypingUser) => {
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== typingData.userId)
        if (typingData.isTyping) {
          return [...filtered, typingData]
        }
        return filtered
      })
    })

    socket.on("location-update", (data: any) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.userId
            ? {
                ...u,
                location: data.location,
                accuracy: data.accuracy,
                speed: data.speed,
                heading: data.heading,
                lastSeen: data.timestamp || new Date().toISOString(),
              }
            : u,
        ),
      )
    })

    socket.on("new-message", (message: Message) => {
      console.log("💬 New message:", message)
      setMessages((prev) => [...prev, message].slice(-100))
    })

    socket.on("message-reaction-update", (reactionData) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === reactionData.messageId) {
            const reactions = { ...msg.reactions } || {}
            const emoji = reactionData.emoji
            const userId = reactionData.userId

            if (reactionData.action === "add") {
              if (!reactions[emoji]) reactions[emoji] = []
              if (!reactions[emoji].includes(userId)) {
                reactions[emoji].push(userId)
              }
            } else {
              if (reactions[emoji]) {
                reactions[emoji] = reactions[emoji].filter((id) => id !== userId)
                if (reactions[emoji].length === 0) {
                  delete reactions[emoji]
                }
              }
            }

            return { ...msg, reactions }
          }
          return msg
        }),
      )
    })

    socket.on("user-status-changed", ({ userId, status }: { userId: string; status: string }) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: status as User["status"] } : u)))
    })

    socket.on("user-presence-changed", (presenceData) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === presenceData.userId
            ? { ...u, isActive: presenceData.isActive, lastActivity: presenceData.lastActivity }
            : u,
        ),
      )
    })

    socketRef.current = socket
  }, [serverUrl, userLoading, joinTrackingSession])

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeout.current) return

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000) // Exponential backoff, max 30s
    console.log(`🔄 Scheduling reconnection in ${delay}ms (attempt ${reconnectAttempts.current + 1})`)

    reconnectTimeout.current = setTimeout(() => {
      reconnectTimeout.current = null
      if (!socketRef.current?.connected) {
        connect()
      }
    }, delay)
  }, [connect])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("🔌 Disconnecting Socket.IO")
      socketRef.current.emit("typing-stop")
      socketRef.current.disconnect()
      socketRef.current = null
    }

    setIsConnected(false)
    setCurrentSocketId(null)
    setTypingUsers([])
    setConnectionStatus("disconnected")
    hasJoinedSession.current = false

    // Clear all intervals and timeouts
    if (pingInterval.current) {
      clearInterval(pingInterval.current)
      pingInterval.current = null
    }
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
      reconnectTimeout.current = null
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    if (connectionCheckInterval.current) {
      clearInterval(connectionCheckInterval.current)
      connectionCheckInterval.current = null
    }
  }, [])

  // Actions with error handling
  const sendLocationUpdate = useCallback((locationData: LocationData) => {
    if (socketRef.current?.connected) {
      try {
        socketRef.current.emit("location-update", locationData)
      } catch (error) {
        console.error("❌ Failed to send location update:", error)
      }
    }
  }, [])

  const sendMessage = useCallback((message: string, messageType = "text") => {
    if (socketRef.current?.connected && message.trim()) {
      try {
        socketRef.current.emit("send-message", { message: message.trim(), messageType })
      } catch (error) {
        console.error("❌ Failed to send message:", error)
      }
    }
  }, [])

  const startTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      try {
        socketRef.current.emit("typing-start")
      } catch (error) {
        console.error("❌ Failed to start typing:", error)
      }
    }
  }, [])

  const stopTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      try {
        socketRef.current.emit("typing-stop")
      } catch (error) {
        console.error("❌ Failed to stop typing:", error)
      }
    }
  }, [])

  const handleTyping = useCallback(() => {
    startTyping()

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 1000)
  }, [startTyping, stopTyping])

  const addMessageReaction = useCallback((messageId: string, emoji: string) => {
    if (socketRef.current?.connected) {
      try {
        socketRef.current.emit("message-reaction", { messageId, emoji, action: "add" })
      } catch (error) {
        console.error("❌ Failed to add reaction:", error)
      }
    }
  }, [])

  const removeMessageReaction = useCallback((messageId: string, emoji: string) => {
    if (socketRef.current?.connected) {
      try {
        socketRef.current.emit("message-reaction", { messageId, emoji, action: "remove" })
      } catch (error) {
        console.error("❌ Failed to remove reaction:", error)
      }
    }
  }, [])

  const updateStatus = useCallback((status: User["status"]) => {
    if (socketRef.current?.connected) {
      try {
        socketRef.current.emit("status-update", status)
      } catch (error) {
        console.error("❌ Failed to update status:", error)
      }
    }
  }, [])

  const updatePresence = useCallback((isActive: boolean) => {
    if (socketRef.current?.connected) {
      try {
        socketRef.current.emit("presence-update", {
          isActive,
          lastActivity: new Date().toISOString(),
        })
      } catch (error) {
        console.error("❌ Failed to update presence:", error)
      }
    }
  }, [])

  // Auto location updates
  useEffect(() => {
    if (location && socketRef.current?.connected && user) {
      const locationUpdate = {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
        timestamp: new Date().toISOString(),
      }
      sendLocationUpdate(locationUpdate)
    }
  }, [location, sendLocationUpdate, user])

  // Join session when user becomes available
  useEffect(() => {
    if (user && socketRef.current?.connected && !hasJoinedSession.current) {
      console.log("👤 User available, joining session...")
      joinTrackingSession()
    }
  }, [user, joinTrackingSession])

  // Presence tracking
  useEffect(() => {
    let isActive = true

    const handleVisibilityChange = () => {
      isActive = !document.hidden
      updatePresence(isActive)
    }

    const handleActivity = () => {
      if (!isActive) {
        isActive = true
        updatePresence(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("mousemove", handleActivity)
    document.addEventListener("keypress", handleActivity)
    document.addEventListener("click", handleActivity)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("mousemove", handleActivity)
      document.removeEventListener("keypress", handleActivity)
      document.removeEventListener("click", handleActivity)
    }
  }, [updatePresence])

  // Connection health monitoring
  useEffect(() => {
    if (connectionCheckInterval.current) {
      clearInterval(connectionCheckInterval.current)
    }

    connectionCheckInterval.current = setInterval(() => {
      if (socketRef.current && !socketRef.current.connected && connectionStatus !== "connecting") {
        console.log("🔍 Connection health check failed, attempting reconnection...")
        setConnectionStatus("reconnecting")
        connect()
      }
    }, 60000) // Check every minute

    return () => {
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current)
      }
    }
  }, [connect, connectionStatus])

  // Init effect
  useEffect(() => {
    if (autoConnect && !userLoading) {
      connect()
    }
    return () => disconnect()
  }, [autoConnect, connect, disconnect, userLoading])

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    connectionStatus,
    users,
    messages,
    userCount,
    latency,
    currentSocketId,
    typingUsers,
    connect,
    disconnect,
    sendLocationUpdate,
    sendMessage,
    updateStatus,
    updatePresence,
    handleTyping,
    startTyping,
    stopTyping,
    addMessageReaction,
    removeMessageReaction,
  }
}
