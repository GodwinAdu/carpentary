"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useSocket } from "@/providers/socket-provider"
import { UserListPanel } from "./user-list-panel"
import { ConnectionStatus } from "./connection-status"
import { AdvancedChatPanel } from "./advanced-chat-panel"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, Download, Navigation, AlertTriangle, Zap } from "lucide-react"
import { UserSimulator } from "./user-simulator"
import useCurrentLocation from "@/hooks/useTrackingLocatio"

// Set your Mapbox access token here
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const roleColors = {
    admin: "#ef4444",
    supervisor: "#f59e0b",
    worker: "#10b981",
}

const roleIcons = {
    admin: "👑",
    supervisor: "👷‍♂️",
    worker: "🔨",
}

export function LiveMap() {
    const { socket, isConnected, connectionCount, users, messages, typingUsers, latency } = useSocket()
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
    const trailSourcesRef = useRef<Set<string>>(new Set())
    const initialized = useRef(false)

    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [autoFollow, setAutoFollow] = useState(false)
    const [showUserList, setShowUserList] = useState(true)
    const [showChat, setShowChat] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [mapLoaded, setMapLoaded] = useState(false)

    const { location, isLoading: locationLoading } = useCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
    })

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current || initialized.current) return

        if (!MAPBOX_TOKEN) {
            console.error("❌ Mapbox token not found")
            return
        }

        console.log("🗺️ Initializing Mapbox map...")
        initialized.current = true
        mapboxgl.accessToken = MAPBOX_TOKEN

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/streets-v12",
                center: [-74.006, 40.7128],
                zoom: 13,
                attributionControl: false,
                antialias: true,
            })

            map.current.on("load", () => {
                console.log("✅ Map loaded successfully")
                setMapLoaded(true)
            })

            map.current.on("error", (e) => {
                console.error("❌ Map error:", e)
            })

            map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
            map.current.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: { enableHighAccuracy: true },
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
        } catch (error) {
            console.error("❌ Failed to initialize map:", error)
        }

        return () => {
            if (map.current) {
                console.log("🧹 Cleaning up map...")
                map.current.remove()
                map.current = null
            }
            initialized.current = false
            setMapLoaded(false)
        }
    }, [])

    // Update markers and trails
    const updateMarkersAndTrails = useCallback(() => {
        if (!map.current || !mapLoaded) return

        console.log("🗺️ Updating markers for", users.length, "users")

        const currentUserIds = new Set(users.map((u) => u.id))
        markersRef.current.forEach((marker, userId) => {
            if (!currentUserIds.has(userId)) {
                console.log(`🗑️ Removing marker for user ${userId}`)
                marker.remove()
                markersRef.current.delete(userId)
            }
        })

        users.forEach((user: User) => {
            if (!user.location) {
                console.log(`⚠️ No location for user ${user.name}`)
                return
            }

            const { id, name, role, location: userLocation, status, trail, isTyping } = user
            let marker = markersRef.current.get(id)

            if (!marker) {
                console.log(`🆕 Creating new marker for ${name} at [${userLocation.longitude}, ${userLocation.latitude}]`)

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
          z-index: 1000;
          position: relative;
        `

                el.style.backgroundColor = status === "offline" ? "#6b7280" : roleColors[role]
                el.textContent = roleIcons[role]

                if (status === "offline") {
                    el.style.opacity = "0.6"
                }

                // Add typing indicator
                if (isTyping) {
                    const typingIndicator = document.createElement("div")
                    typingIndicator.className = "typing-indicator"
                    typingIndicator.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            width: 12px;
            height: 12px;
            background: #10b981;
            border-radius: 50%;
            border: 2px solid white;
            animation: pulse 1s infinite;
          `
                    el.appendChild(typingIndicator)
                }

                const popup = new mapboxgl.Popup({
                    offset: 25,
                    closeButton: true,
                    closeOnClick: false,
                }).setHTML(`
          <div class="p-3 min-w-[200px]">
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
              <div class="flex justify-between">
                <span>Location:</span>
                <span>${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}</span>
              </div>
              ${user.isTyping ? '<div class="text-green-600 text-xs">💬 Typing...</div>' : ""}
            </div>
          </div>
        `)

                try {
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
                } catch (error) {
                    console.error(`❌ Failed to create marker for ${name}:`, error)
                }
            } else {
                // Update existing marker position
                try {
                    marker.setLngLat([userLocation.longitude, userLocation.latitude])
                } catch (error) {
                    console.error(`❌ Failed to update marker for ${name}:`, error)
                }
            }

            // Handle trails
            if (trail && trail.length > 1) {
                const trailId = `trail-${id}`
                try {
                    if (!trailSourcesRef.current.has(id)) {
                        console.log(`🛤️ Creating trail for ${name}`)

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
                } catch (error) {
                    console.error(`❌ Failed to handle trail for ${name}:`, error)
                }
            }
        })

        if (autoFollow && selectedUser) {
            const user = users.find((u: User) => u.id === selectedUser)
            if (user && user.location) {
                map.current!.flyTo({
                    center: [user.location.longitude, user.location.latitude],
                    zoom: 16,
                    duration: 1000,
                })
            }
        }
    }, [users, selectedUser, autoFollow, mapLoaded])

    useEffect(() => {
        updateMarkersAndTrails()
    }, [updateMarkersAndTrails])

    useEffect(() => {
        if (location && map.current && mapLoaded) {
            console.log(`📍 Centering map on user location: [${location.longitude}, ${location.latitude}]`)
            map.current.flyTo({
                center: [location.longitude, location.latitude],
                zoom: 15,
                duration: 2000,
            })
        }
    }, [location, mapLoaded])

    const handleExportData = useCallback(() => {
        const data = {
            users,
            messages,
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
    }, [users, messages])

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
                <Card className="p-6 max-w-md">
                    <div className="text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
                        <h2 className="text-xl font-semibold">Mapbox Token Required</h2>
                        <p className="text-gray-600">Please set your Mapbox access token in the environment variables.</p>
                        <code className="block bg-gray-100 p-2 rounded text-sm">
                            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
                        </code>
                    </div>
                </Card>
            </div>
        )
    }

    const activeTypingCount = typingUsers.filter((t) => t.isTyping).length

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {/* Map Container */}
            <div
                ref={mapContainer}
                className="absolute inset-0 w-full h-full"
                style={{ minHeight: "100vh", minWidth: "100vw" }}
            />

            {/* Loading Overlay */}
            {!mapLoaded && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <div>
                                <div className="font-semibold">Loading Map...</div>
                                <div className="text-sm text-gray-500">Initializing Mapbox GL</div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Connection Status */}
            <ConnectionStatus />

            {/* User Simulator */}
            <UserSimulator />

            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 space-y-2">
                <Button variant={showUserList ? "default" : "outline"} size="sm" onClick={() => setShowUserList(!showUserList)}>
                    <Users className="w-4 h-4 mr-1" />
                    Users ({users.length})
                </Button>

                <Button variant={showChat ? "default" : "outline"} size="sm" onClick={() => setShowChat(!showChat)}>
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                    <div className="flex items-center gap-1 ml-1">
                        {messages.length > 0 && <Badge className="text-xs">{messages.length}</Badge>}
                        {activeTypingCount > 0 && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 animate-pulse">
                                {activeTypingCount} typing
                            </Badge>
                        )}
                    </div>
                </Button>

                <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsRecording(!isRecording)}
                >
                    <Navigation className="w-4 h-4 mr-1" />
                    {isRecording ? "Stop Recording" : "Record Route"}
                </Button>

                <Button variant="outline" size="sm" onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                </Button>

                {/* Latency Indicator */}
                {latency !== null && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {latency}ms
                    </div>
                )}
            </div>

            {/* User List Panel */}
            {showUserList && (
                <div className="absolute left-4 top-40 z-10 w-80">
                    <UserListPanel
                        users={users}
                        selectedUser={selectedUser}
                        onSelectUser={setSelectedUser}
                        autoFollow={autoFollow}
                        onToggleAutoFollow={setAutoFollow}
                    />
                </div>
            )}

            {/* Advanced Chat Panel */}
            <AdvancedChatPanel isOpen={showChat} onClose={() => setShowChat(false)} />

            {/* Location Loading */}
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

            {/* Recording Status */}
            {isRecording && (
                <div className="absolute bottom-4 right-4 z-10">
                    <Card className="p-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Recording Route</span>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
