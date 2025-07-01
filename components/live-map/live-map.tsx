"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useSocketIO } from "@/hooks/useSocketIO"

import { UserListPanel } from "./user-list-panel"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, MessageCircle, Download, Navigation, Send, X, AlertTriangle } from "lucide-react"
import useCurrentLocation from "@/hooks/useTrackingLocatio"

// Set Mapbox access token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

interface User {
    id: string
    name: string
    role: "admin" | "supervisor" | "worker"
    location: {
        latitude: number
        longitude: number
        accuracy?: number
        heading?: number
        speed?: number
    }
    status: "online" | "away" | "offline"
    lastSeen: Date
    trail: Array<{
        latitude: number
        longitude: number
        timestamp: Date
    }>
}

interface ChatMessage {
    id: string
    userId: string
    userName: string
    message: string
    timestamp: Date
}

const roleColors = {
    admin: "#ef4444",
    supervisor: "#f59e0b",
    worker: "#10b981",
}

export function LiveMap() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
    const trailSourcesRef = useRef<Set<string>>(new Set())
    const initialized = useRef(false)

    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [autoFollow, setAutoFollow] = useState(false)
    const [showUserList, setShowUserList] = useState(true)
    const [showChat, setShowChat] = useState(false)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const [recordedRoute, setRecordedRoute] = useState<
        Array<{
            latitude: number
            longitude: number
            timestamp: Date
        }>
    >([])

    const { location, isLoading: locationLoading } = useCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
    })

    const { socket, isConnected } = useSocketIO({
        url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:4000",
    })

    // Initialize map once
    useEffect(() => {
        if (!mapContainer.current || map.current || initialized.current || !MAPBOX_TOKEN) return

        initialized.current = true
        mapboxgl.accessToken = MAPBOX_TOKEN

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [-74.006, 40.7128], // NYC default
            zoom: 13,
            attributionControl: false,
        })

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
        map.current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
            }),
            "top-right",
        )

        map.current.addControl(
            new mapboxgl.AttributionControl({
                compact: true,
            }),
            "bottom-right",
        )

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
            initialized.current = false
        }
    }, [])

    // Handle location updates
    const handleLocationUpdate = useCallback(() => {
        if (!location || !socket || !isConnected) return

        socket.emit("location-update", {
            userId: "current-user",
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                heading: location.heading,
                speed: location.speed,
            },
            timestamp: new Date(),
        })

        if (isRecording) {
            setRecordedRoute((prev) => [
                ...prev,
                {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timestamp: new Date(),
                },
            ])
        }

        if (map.current && users.length === 0) {
            map.current.setCenter([location.longitude, location.latitude])
        }
    }, [location, socket, isConnected, isRecording, users.length])

    useEffect(() => {
        handleLocationUpdate()
    }, [handleLocationUpdate])

    // Socket event handlers
    useEffect(() => {
        if (!socket) return

        const handleUserUpdate = (userData: User) => {
            setUsers((prev) => {
                const existing = prev.find((u) => u.id === userData.id)
                if (existing) {
                    return prev.map((u) => (u.id === userData.id ? userData : u))
                }
                return [...prev, userData]
            })
        }

        const handleUserDisconnect = (userId: string) => {
            setUsers((prev) => prev.filter((u) => u.id !== userId))

            const marker = markersRef.current.get(userId)
            if (marker) {
                marker.remove()
                markersRef.current.delete(userId)
            }

            if (map.current && trailSourcesRef.current.has(userId)) {
                if (map.current.getSource(`trail-${userId}`)) {
                    map.current.removeLayer(`trail-${userId}`)
                    map.current.removeSource(`trail-${userId}`)
                }
                trailSourcesRef.current.delete(userId)
            }
        }

        const handleChatMessage = (message: ChatMessage) => {
            setChatMessages((prev) => [...prev, message])
        }

        socket.on("user-update", handleUserUpdate)
        socket.on("user-disconnect", handleUserDisconnect)
        socket.on("chat-message", handleChatMessage)

        return () => {
            socket.off("user-update", handleUserUpdate)
            socket.off("user-disconnect", handleUserDisconnect)
            socket.off("chat-message", handleChatMessage)
        }
    }, [socket])

    // Update markers and trails
    const updateMarkersAndTrails = useCallback(() => {
        if (!map.current) return

        users.forEach((user) => {
            const { id, name, role, location: userLocation, status, trail } = user

            let marker = markersRef.current.get(id)

            if (!marker) {
                const el = document.createElement("div")
                el.className = "user-marker"
                el.style.cssText = `
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
        `

                const roleIcons = {
                    admin: "👑",
                    supervisor: "👷‍♂️",
                    worker: "🔨",
                }

                el.style.backgroundColor = status === "offline" ? "#6b7280" : roleColors[role]
                el.textContent = roleIcons[role]

                if (status === "offline") {
                    el.style.opacity = "0.6"
                }

                const popup = new mapboxgl.Popup({
                    offset: 25,
                    closeButton: true,
                    closeOnClick: false,
                }).setHTML(`
          <div class="p-3">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">${roleIcons[role]}</span>
              <div>
                <div class="font-semibold">${name}</div>
                <div class="text-sm text-gray-500 capitalize">${role}</div>
              </div>
            </div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span>Status:</span>
                <span class="capitalize font-medium" style="color: ${status === "online" ? "#10b981" : status === "away" ? "#f59e0b" : "#6b7280"
                    }">${status}</span>
              </div>
              ${userLocation.accuracy
                        ? `
                <div class="flex justify-between">
                  <span>Accuracy:</span>
                  <span>${Math.round(userLocation.accuracy)}m</span>
                </div>
              `
                        : ""
                    }
              ${userLocation.speed
                        ? `
                <div class="flex justify-between">
                  <span>Speed:</span>
                  <span>${Math.round((userLocation.speed || 0) * 3.6)} km/h</span>
                </div>
              `
                        : ""
                    }
            </div>
          </div>
        `)

                marker = new mapboxgl.Marker(el)
                    .setLngLat([userLocation.longitude, userLocation.latitude])
                    .setPopup(popup)
                    .addTo(map.current!)

                markersRef.current.set(id, marker)

                el.addEventListener("click", () => {
                    setSelectedUser(id)
                    if (autoFollow) {
                        map.current?.flyTo({
                            center: [userLocation.longitude, userLocation.latitude],
                            zoom: 16,
                            duration: 1000,
                        })
                    }
                })
            } else {
                marker.setLngLat([userLocation.longitude, userLocation.latitude])
            }

            if (trail.length > 1) {
                const trailId = `trail-${id}`

                if (!trailSourcesRef.current.has(id)) {
                    const trailData = {
                        type: "Feature" as const,
                        properties: {},
                        geometry: {
                            type: "LineString" as const,
                            coordinates: trail.map((point) => [point.longitude, point.latitude]),
                        },
                    }

                    map.current!.addSource(trailId, {
                        type: "geojson",
                        data: trailData,
                    })

                    map.current!.addLayer({
                        id: trailId,
                        type: "line",
                        source: trailId,
                        layout: {
                            "line-join": "round",
                            "line-cap": "round",
                        },
                        paint: {
                            "line-color": roleColors[role],
                            "line-width": 3,
                            "line-opacity": 0.7,
                        },
                    })

                    trailSourcesRef.current.add(id)
                } else {
                    const source = map.current!.getSource(trailId) as mapboxgl.GeoJSONSource
                    if (source) {
                        source.setData({
                            type: "Feature",
                            properties: {},
                            geometry: {
                                type: "LineString",
                                coordinates: trail.map((point) => [point.longitude, point.latitude]),
                            },
                        })
                    }
                }
            }
        })

        if (autoFollow && selectedUser) {
            const user = users.find((u) => u.id === selectedUser)
            if (user) {
                map.current!.flyTo({
                    center: [user.location.longitude, user.location.latitude],
                    zoom: 16,
                    duration: 1000,
                })
            }
        }
    }, [users, selectedUser, autoFollow])

    useEffect(() => {
        updateMarkersAndTrails()
    }, [updateMarkersAndTrails])

    const handleSendMessage = useCallback(() => {
        if (!newMessage.trim() || !socket) return

        const message: ChatMessage = {
            id: Date.now().toString(),
            userId: "current-user",
            userName: "You",
            message: newMessage.trim(),
            timestamp: new Date(),
        }

        socket.emit("chat-message", message)
        setNewMessage("")
    }, [newMessage, socket])

    const handleExportData = useCallback(() => {
        const data = {
            users,
            chatMessages,
            recordedRoute,
            timestamp: new Date(),
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `live-tracking-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [users, chatMessages, recordedRoute])

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            setIsRecording(false)
        } else {
            setRecordedRoute([])
            setIsRecording(true)
        }
    }, [isRecording])

    const handleUserSelect = useCallback((userId: string | null) => {
        setSelectedUser(userId)
    }, [])

    const handleAutoFollowToggle = useCallback((enabled: boolean) => {
        setAutoFollow(enabled)
    }, [])

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <Card className="p-6 max-w-md">
                    <div className="text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
                        <h2 className="text-xl font-semibold">Mapbox Token Required</h2>
                        <p className="text-gray-600">Please set your Mapbox access token in the environment variables.</p>
                        <code className="block bg-gray-100 p-2 rounded text-sm">NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here</code>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="relative h-screen w-full">
            <div ref={mapContainer} className="absolute inset-0" />

            <div className="absolute top-4 left-4 z-10">
                <Card className="p-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
                        {/* {isConnected && (
                            <Badge variant="secondary" className="text-xs">
                                {connectionCount} online
                            </Badge>
                        )} */}
                    </div>
                </Card>
            </div>

            <div className="absolute top-4 right-4 z-10 space-y-2">
                <Button variant={showUserList ? "default" : "outline"} size="sm" onClick={() => setShowUserList(!showUserList)}>
                    <Users className="w-4 h-4 mr-1" />
                    Users ({users.length})
                </Button>

                <Button variant={showChat ? "default" : "outline"} size="sm" onClick={() => setShowChat(!showChat)}>
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                    {chatMessages.length > 0 && <Badge className="ml-1 text-xs">{chatMessages.length}</Badge>}
                </Button>

                <Button variant={isRecording ? "destructive" : "outline"} size="sm" onClick={toggleRecording}>
                    <Navigation className="w-4 h-4 mr-1" />
                    {isRecording ? "Stop Recording" : "Record Route"}
                </Button>

                <Button variant="outline" size="sm" onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                </Button>
            </div>

            {showUserList && (
                <div className="absolute left-4 top-20 z-10 w-80">
                    <UserListPanel
                        users={users}
                        selectedUser={selectedUser}
                        onSelectUser={handleUserSelect}
                        autoFollow={autoFollow}
                        onToggleAutoFollow={handleAutoFollowToggle}
                    />
                </div>
            )}

            {showChat && (
                <div className="absolute right-4 top-32 z-10 w-80">
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Live Chat</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <ScrollArea className="h-64 mb-3">
                            <div className="space-y-2">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className="p-2 bg-gray-50 rounded text-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium">{msg.userName}</span>
                                            <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                        <p>{msg.message}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <Button size="sm" onClick={handleSendMessage}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {locationLoading && (
                <div className="absolute bottom-4 left-4 z-10">
                    <Card className="p-3">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm">Getting location...</span>
                        </div>
                    </Card>
                </div>
            )}

            {isRecording && (
                <div className="absolute bottom-4 right-4 z-10">
                    <Card className="p-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Recording Route</span>
                            <Badge variant="secondary">{recordedRoute.length} points</Badge>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
