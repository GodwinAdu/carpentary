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

  const { user, isLoading: userLoading } = useCurrentUser()
  const { location, isLoading: locationLoading } = useCurrentLocation()

  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const pingInterval = useRef<NodeJS.Timeout | null>(null)
  const hasJoinedSession = useRef(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true,
    })

    // Core events
    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server with ID:", socket.id)
      setIsConnected(true)
      setConnectionError(null)
      setCurrentSocketId(socket.id)
      reconnectAttempts.current = 0
      hasJoinedSession.current = false

      // Join session immediately if user is available
      setTimeout(() => {
        joinTrackingSession()
      }, 100)

      // Ping monitoring
      pingInterval.current = setInterval(() => {
        const start = Date.now()
        socket.emit("ping")
        socket.once("pong", (data) => {
          setLatency(Date.now() - start)
        })
      }, 5000)
    })

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason)
      setIsConnected(false)
      setCurrentSocketId(null)
      setTypingUsers([])
      hasJoinedSession.current = false
      if (pingInterval.current) clearInterval(pingInterval.current)
    })

    socket.on("connect_error", (error) => {
      console.error("🚫 Connection error:", error)
      setConnectionError(error.message)
      reconnectAttempts.current++
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setConnectionError("Failed to connect after multiple attempts")
      }
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
      console.log("⌨️ Typing update:", typingData)
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== typingData.userId)
        if (typingData.isTyping) {
          return [...filtered, typingData]
        }
        return filtered
      })
    })

    socket.on("location-update", (data: any) => {
      console.log("📍 Location update received:", data)
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
      console.log("👍 Reaction update:", reactionData)
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
    hasJoinedSession.current = false
    if (pingInterval.current) clearInterval(pingInterval.current)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }, [])

  // Actions
  const sendLocationUpdate = useCallback((locationData: LocationData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("location-update", locationData)
    }
  }, [])

  const sendMessage = useCallback((message: string, messageType = "text") => {
    if (socketRef.current?.connected && message.trim()) {
      socketRef.current.emit("send-message", { message: message.trim(), messageType })
    }
  }, [])

  const startTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing-start")
    }
  }, [])

  const stopTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing-stop")
    }
  }, [])

  const handleTyping = useCallback(() => {
    startTyping()

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 1000)
  }, [startTyping, stopTyping])

  const addMessageReaction = useCallback((messageId: string, emoji: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message-reaction", { messageId, emoji, action: "add" })
    }
  }, [])

  const removeMessageReaction = useCallback((messageId: string, emoji: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message-reaction", { messageId, emoji, action: "remove" })
    }
  }, [])

  const updateStatus = useCallback((status: User["status"]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("status-update", status)
    }
  }, [])

  const updatePresence = useCallback((isActive: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("presence-update", {
        isActive,
        lastActivity: new Date().toISOString(),
      })
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
