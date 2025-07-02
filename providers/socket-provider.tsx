"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useSocketIO } from "@/hooks/useSocketIO"
import type { Socket } from "socket.io-client"


interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
    connectionCount: number
    users: User[]
    messages: Message[]
    currentSocketId: string | null
    typingUsers: TypingUser[]
    latency: number | null
    connectionStatus: "connecting" | "connected" | "disconnected" | "reconnecting"
    emit: (event: string, data: unknown) => void
    on: (event: string, callback: (data: unknown) => void) => void
    off: (event: string, callback?: (data: unknown) => void) => void
    sendMessage: (message: string, messageType?: string) => void
    updateStatus: (status: User["status"]) => void
    updatePresence: (isActive: boolean) => void
    handleTyping: () => void
    startTyping: () => void
    stopTyping: () => void
    addMessageReaction: (messageId: string, emoji: string) => void
    removeMessageReaction: (messageId: string, emoji: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function useSocket() {
    const context = useContext(SocketContext)
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider")
    }
    return context
}

interface SocketProviderProps {
    children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
    const socketConnection = useSocketIO({
        serverUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:4000",
        autoConnect: true,
    })

    const contextValue: SocketContextType = {
        socket: socketConnection.socket,
        isConnected: socketConnection.isConnected,
        connectionCount: socketConnection.userCount,
        users: socketConnection.users,
        messages: socketConnection.messages,
        currentSocketId: socketConnection.currentSocketId,
        typingUsers: socketConnection.typingUsers,
        latency: socketConnection.latency,
        connectionStatus: socketConnection.connectionStatus,
        emit: (...args: [string, unknown]) => socketConnection.socket?.emit(...args),
        on: (...args: [string, (data: unknown) => void]) => socketConnection.socket?.on(...args),
        off: (...args: [string, ((data: unknown) => void)?]) => socketConnection.socket?.off(...args),
        sendMessage: socketConnection.sendMessage,
        updateStatus: socketConnection.updateStatus,
        updatePresence: socketConnection.updatePresence,
        handleTyping: socketConnection.handleTyping,
        startTyping: socketConnection.startTyping,
        stopTyping: socketConnection.stopTyping,
        addMessageReaction: socketConnection.addMessageReaction,
        removeMessageReaction: socketConnection.removeMessageReaction,
    }

    return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>
}
