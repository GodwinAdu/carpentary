"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MessageCircle, Send, X, Clock, Smile, Users, Wifi, WifiOff, Activity } from "lucide-react"
import { useSocket } from "@/providers/socket-provider"




const roleColors = {
    admin: "bg-red-500",
    supervisor: "bg-yellow-500",
    worker: "bg-green-500",
}

const roleIcons = {
    admin: "👑",
    supervisor: "👷‍♂️",
    worker: "🔨",
}

const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥"]


const LiveChat = () => {
    const {
        messages,
        sendMessage,
        currentSocketId,
        users,
        typingUsers,
        isConnected,
        connectionCount,
        handleTyping,
        stopTyping,
        addMessageReaction,
        removeMessageReaction,
    } = useSocket()

    const [newMessage, setNewMessage] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSendMessage = () => {
        if (!newMessage.trim()) return
        sendMessage(newMessage.trim())
        setNewMessage("")
        setIsTyping(false)
        stopTyping()
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setNewMessage(value)

        if (value.trim() && !isTyping) {
            setIsTyping(true)
            handleTyping()
        } else if (!value.trim() && isTyping) {
            setIsTyping(false)
            stopTyping()
        } else if (value.trim()) {
            handleTyping()
        }
    }

    const isMyMessage = (message: Message) => {
        return message.userId === currentSocketId
    }

    const getUserRole = (userId: string) => {
        const user = users.find((u) => u.id === userId)
        return user?.role || "worker"
    }

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const handleEmojiReaction = (messageId: string, emoji: string) => {
        const message = messages.find((m) => m.id === messageId)
        if (!message) return

        const userReactions = message.reactions?.[emoji] || []
        const hasReacted = userReactions.includes(currentSocketId || "")

        if (hasReacted) {
            removeMessageReaction(messageId, emoji)
        } else {
            addMessageReaction(messageId, emoji)
        }
    }

    const getTypingText = () => {
        const activeTypers = typingUsers.filter((t) => t.isTyping && t.userId !== currentSocketId)
        if (activeTypers.length === 0) return ""

        if (activeTypers.length === 1) {
            return `${activeTypers[0].userName} is typing...`
        } else if (activeTypers.length === 2) {
            return `${activeTypers[0].userName} and ${activeTypers[1].userName} are typing...`
        } else {
            return `${activeTypers.length} people are typing...`
        }
    }
    return (
        <Dialog>

            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="relative flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-colors duration-200 shadow-sm focus:ring-2 focus:ring-blue-400"
                >
                    <MessageCircle className="w-4 h-4" />
                    Chat

                    {/* Online dot */}
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle>Live Chat</DialogTitle>
                </DialogHeader>

                <Card className="">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <MessageCircle className="w-5 h-5 text-blue-600" />
                                {isConnected ? (
                                    <Wifi className="w-3 h-3 text-green-500 absolute -top-1 -right-1" />
                                ) : (
                                    <WifiOff className="w-3 h-3 text-red-500 absolute -top-1 -right-1" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Team Chat</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Users className="w-3 h-3" />
                                    <span>{connectionCount} online</span>
                                    {isConnected ? (
                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                            Connected
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                            Disconnected
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* <Button variant="ghost" size="sm" onClick={Di}>
                                <X className="w-4 h-4" />
                            </Button> */}
                    </div>

                    {/* Messages */}
                    <ScrollArea className="h-96 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">No messages yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg: Message, index) => {
                                    const isOwn = isMyMessage(msg)
                                    const userRole = getUserRole(msg.userId)
                                    const showAvatar = index === 0 || messages[index - 1].userId !== msg.userId

                                    return (
                                        <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                            <div className={`flex gap-3 max-w-[85%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                                                {/* Avatar */}
                                                <div className="flex-shrink-0">
                                                    {showAvatar ? (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className={`text-white text-xs ${roleColors[userRole]}`}>
                                                                {roleIcons[userRole]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ) : (
                                                        <div className="w-8 h-8" />
                                                    )}
                                                </div>

                                                {/* Message Content */}
                                                <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                                                    {/* Message Header */}
                                                    {showAvatar && (
                                                        <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                                                            <span className="text-xs font-medium text-gray-700">{isOwn ? "You" : msg.userName}</span>
                                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{formatTime(msg.timestamp)}</span>
                                                            </div>
                                                            {!isOwn && (
                                                                <Badge variant="outline" className="text-xs capitalize">
                                                                    {userRole}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Message Bubble */}
                                                    <div className="relative group">
                                                        <div
                                                            className={`px-4 py-2 rounded-2xl text-sm max-w-full break-words relative ${isOwn
                                                                ? "bg-blue-500 text-white rounded-br-md"
                                                                : "bg-gray-100 text-gray-800 rounded-bl-md border"
                                                                }`}
                                                        >
                                                            <p className="whitespace-pre-wrap">{msg.message}</p>

                                                            {/* Message Actions */}
                                                            <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-6 w-6 p-0 bg-white shadow-sm border rounded-full"
                                                                        >
                                                                            <Smile className="w-3 h-3" />
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-2">
                                                                        <div className="flex gap-1">
                                                                            {commonEmojis.map((emoji) => (
                                                                                <Button
                                                                                    key={emoji}
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                                                                    onClick={() => handleEmojiReaction(msg.id, emoji)}
                                                                                >
                                                                                    {emoji}
                                                                                </Button>
                                                                            ))}
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                        </div>

                                                        {/* Reactions */}
                                                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                                                    <Button
                                                                        key={emoji}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className={`h-6 px-2 py-0 text-xs rounded-full border ${userIds.includes(currentSocketId || "")
                                                                            ? "bg-blue-100 border-blue-300"
                                                                            : "bg-gray-50 border-gray-200"
                                                                            }`}
                                                                        onClick={() => handleEmojiReaction(msg.id, emoji)}
                                                                    >
                                                                        {emoji} {userIds.length}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}

                            {/* Typing Indicator */}
                            {getTypingText() && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.1s" }}
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.2s" }}
                                        ></div>
                                    </div>
                                    <span className="text-xs">{getTypingText()}</span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t bg-gray-50">
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                className="flex-1 border-gray-300 focus:border-blue-500"
                                maxLength={500}
                                disabled={!isConnected}
                            />
                            <Button
                                size="sm"
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || !isConnected}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <span>Press Enter to send</span>
                                {isConnected && (
                                    <div className="flex items-center gap-1">
                                        <Activity className="w-3 h-3 text-green-500" />
                                        <span className="text-green-600">Online</span>
                                    </div>
                                )}
                            </div>
                            <span className={newMessage.length > 450 ? "text-red-500" : ""}>{newMessage.length}/500</span>
                        </div>
                    </div>
                </Card>

            </DialogContent>
        </Dialog>
    )
}

export default LiveChat