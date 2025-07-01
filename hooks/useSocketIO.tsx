"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, type Socket } from "socket.io-client"

export interface LocationData {
    location: [number, number]
    accuracy?: number
    speed?: number
    heading?: number
    timestamp?: string
}

export interface User {
    id: string
    name: string
    role: string
    sessionId: string
    joinedAt: string
    lastSeen: string
    status: "online" | "away" | "offline"
    location: [number, number] | null
    accuracy?: number
    speed?: number
    heading?: number
}

export interface Message {
    id: string
    userId: string
    userName: string
    userRole: string
    message: string
    timestamp: string
    location?: [number, number] | null
}

export interface GeofenceAlert {
    id: string
    userId: string
    userName: string
    type: "enter" | "exit"
    geofenceName: string
    location: [number, number]
    timestamp: string
}

interface UseSocketIOOptions {
    serverUrl?: string
    autoConnect?: boolean
    sessionId?: string
    userName?: string
    userRole?: string
}

export function useSocketIO(options: UseSocketIOOptions = {}) {
    const {
        serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:4000",
        autoConnect = true,
        sessionId = "default",
        userName = "Anonymous",
        userRole = "worker",
    } = options

    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [userCount, setUserCount] = useState(0)
    const [latency, setLatency] = useState<number | null>(null)

    const reconnectAttempts = useRef(0)
    const maxReconnectAttempts = 5
    const pingInterval = useRef<NodeJS.Timeout | null>(null)

    // Initialize socket connection
    const connect = useCallback(() => {
        if (socket?.connected) return

        console.log("🔌 Connecting to Socket.IO server:", serverUrl)

        const newSocket = io(serverUrl, {
            transports: ["websocket", "polling"],
            timeout: 10000,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        })

        // Connection events
        newSocket.on("connect", () => {
            console.log("✅ Connected to Socket.IO server")
            setIsConnected(true)
            setConnectionError(null)
            reconnectAttempts.current = 0

            // Join tracking session
            newSocket.emit("join-tracking", {
                name: userName,
                role: userRole,
                sessionId,
            })

            // Start ping monitoring
            pingInterval.current = setInterval(() => {
                const start = Date.now()
                newSocket.emit("ping")

                newSocket.once("pong", () => {
                    setLatency(Date.now() - start)
                })
            }, 5000)
        })

        newSocket.on("disconnect", (reason) => {
            console.log("❌ Disconnected from Socket.IO server:", reason)
            setIsConnected(false)

            if (pingInterval.current) {
                clearInterval(pingInterval.current)
            }
        })

        newSocket.on("connect_error", (error) => {
            console.error("🚫 Connection error:", error)
            setConnectionError(error.message)
            reconnectAttempts.current++

            if (reconnectAttempts.current >= maxReconnectAttempts) {
                setConnectionError("Failed to connect after multiple attempts")
            }
        })

        // User management events
        newSocket.on("users-list", (usersList: User[]) => {
            setUsers(usersList)
            setUserCount(usersList.length)
        })

        newSocket.on("user-joined", (user: User) => {
            setUsers((prev) => [...prev, user])
            setUserCount((prev) => prev + 1)
        })

        newSocket.on("user-left", (data: { userId: string; userName: string }) => {
            setUsers((prev) => prev.filter((user) => user.id !== data.userId))
            setUserCount((prev) => Math.max(0, prev - 1))
        })

        newSocket.on("user-updated", (updatedUser: User) => {
            setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
        })

        newSocket.on("user-count", (count: number) => {
            setUserCount(count)
        })

        // Location tracking events
        newSocket.on("location-update", (data: LocationData & { userId: string }) => {
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === data.userId
                        ? {
                            ...user,
                            location: data.location,
                            accuracy: data.accuracy,
                            speed: data.speed,
                            heading: data.heading,
                            lastSeen: data.timestamp || new Date().toISOString(),
                        }
                        : user,
                ),
            )
        })

        // Chat events
        newSocket.on("new-message", (message: Message) => {
            setMessages((prev) => [...prev, message].slice(-100)) // Keep last 100 messages
        })

        // Status events
        newSocket.on("user-status-changed", (data: { userId: string; status: string }) => {
            setUsers((prev) =>
                prev.map((user) => (user.id === data.userId ? { ...user, status: data.status as User["status"] } : user)),
            )
        })

        setSocket(newSocket)

        return newSocket
    }, [serverUrl, sessionId, userName, userRole])

    // Disconnect socket
    const disconnect = useCallback(() => {
        if (socket) {
            console.log("🔌 Disconnecting from Socket.IO server")
            socket.disconnect()
            setSocket(null)
            setIsConnected(false)

            if (pingInterval.current) {
                clearInterval(pingInterval.current)
            }
        }
    }, [socket])

    // Send location update
    const sendLocationUpdate = useCallback(
        (locationData: LocationData) => {
            if (socket?.connected) {
                socket.emit("location-update", locationData)
            }
        },
        [socket],
    )

    // Send chat message
    const sendMessage = useCallback(
        (message: string) => {
            if (socket?.connected && message.trim()) {
                socket.emit("send-message", { message: message.trim() })
            }
        },
        [socket],
    )

    // Update user status
    const updateStatus = useCallback(
        (status: User["status"]) => {
            if (socket?.connected) {
                socket.emit("status-update", status)
            }
        },
        [socket],
    )

    // Send geofence alert
    const sendGeofenceAlert = useCallback(
        (alertData: {
            type: "enter" | "exit"
            geofenceName: string
            location: [number, number]
        }) => {
            if (socket?.connected) {
                socket.emit("geofence-alert", alertData)
            }
        },
        [socket],
    )

    // Route recording
    const startRouteRecording = useCallback(() => {
        if (socket?.connected) {
            socket.emit("start-route-recording")
        }
    }, [socket])

    const stopRouteRecording = useCallback(
        (routeData: any) => {
            if (socket?.connected) {
                socket.emit("stop-route-recording", routeData)
            }
        },
        [socket],
    )

    // Initialize connection
    useEffect(() => {
        if (autoConnect) {
            connect()
        }

        return () => {
            disconnect()
        }
    }, [autoConnect, connect, disconnect])

    return {
        socket,
        isConnected,
        connectionError,
        users,
        messages,
        userCount,
        latency,
        connect,
        disconnect,
        sendLocationUpdate,
        sendMessage,
        updateStatus,
        sendGeofenceAlert,
        startRouteRecording,
        stopRouteRecording,
    }
}
