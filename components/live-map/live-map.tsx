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
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Users,
    MessageCircle,
    Download,
    Navigation,
    AlertTriangle,
    Settings,
    MapPin,
    Eye,
    EyeOff,
    RotateCcw,
} from "lucide-react"
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

// Map styles
const mapStyles = [
    { id: "streets-v12", name: "Streets", icon: "🏙️" },
    { id: "satellite-v9", name: "Satellite", icon: "🛰️" },
    { id: "outdoors-v12", name: "Outdoors", icon: "🏔️" },
    { id: "light-v11", name: "Light", icon: "☀️" },
    { id: "dark-v11", name: "Dark", icon: "🌙" },
    { id: "navigation-day-v1", name: "Navigation", icon: "🧭" },
]

export function LiveMap() {
    const { users, messages, typingUsers, latency } = useSocket()
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
    const trailSourcesRef = useRef<Set<string>>(new Set())
    type Geofence = {
        id: string
        name: string
        center: [number, number]
        radius: number
        color: string
    }
    const geofencesRef = useRef<Map<string, Geofence>>(new Map())
    const initialized = useRef(false)

    // UI State
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [autoFollow, setAutoFollow] = useState(false)
    const [showUserList, setShowUserList] = useState(true)
    const [showChat, setShowChat] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [mapLoaded, setMapLoaded] = useState(false)


    // Map Features State
    const [currentMapStyle, setCurrentMapStyle] = useState("streets-v12")
    const [showTrails, setShowTrails] = useState(true)
    const [showHeatmap, setShowHeatmap] = useState(false)
    const [showGeofences, setShowGeofences] = useState(true)
    const [showClusters, setShowClusters] = useState(false)
    const [trailOpacity, setTrailOpacity] = useState([70])
    const [markerSize, setMarkerSize] = useState([40])
    const [mapBearing, setMapBearing] = useState(0)
    const [mapPitch, setMapPitch] = useState(0)
    const [show3D, setShow3D] = useState(false)
    const [showWeather, setShowWeather] = useState(false)
    const [showTraffic, setShowTraffic] = useState(false)

    // Location with better control
    const {
        location,
        isLoading: locationLoading,
        error: locationError,
        permissionStatus,
        getCurrentLocation,
        startWatching,
        stopWatching,
        isWatching,
    } = useCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        watchPosition: false, // Start with manual control
        autoStart: false, // Don't auto-start
    })

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current || initialized.current) return

        if (!MAPBOX_TOKEN) {
            console.error("❌ Mapbox token not found")
            return
        }

        console.log("🗺️ Initializing advanced Mapbox map...")
        initialized.current = true
        mapboxgl.accessToken = MAPBOX_TOKEN

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: `mapbox://styles/mapbox/${currentMapStyle}`,
                center: [-74.006, 40.7128], // NYC default
                zoom: 13,
                pitch: 0,
                bearing: 0,
                attributionControl: false,
                antialias: true,
                maxZoom: 22,
                minZoom: 1,
            })

            // Map event listeners
            map.current.on("load", () => {
                console.log("✅ Map loaded successfully")
                setMapLoaded(true)
                initializeMapFeatures()
            })

            map.current.on("error", (e) => {
                console.error("❌ Map error:", e)
            })

            // Add enhanced controls
            map.current.addControl(
                new mapboxgl.NavigationControl({
                    showCompass: true,
                    showZoom: true,
                    visualizePitch: true,
                }),
                "top-right",
            )

            map.current.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: { enableHighAccuracy: true },
                    trackUserLocation: true,
                    showUserHeading: true,
                    showAccuracyCircle: true,
                }),
                "top-right",
            )

            map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left")
            map.current.addControl(new mapboxgl.FullscreenControl(), "top-right")

            // Add terrain after DEM source is loaded
            map.current.on("style.load", () => {
                if (map.current && map.current.getSource("mapbox-dem")) {
                    map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })
                }
            })

            // Map interaction events
            map.current.on("click", handleMapClick)
            map.current.on("contextmenu", handleMapRightClick)
            map.current.on("moveend", handleMapMove)
            map.current.on("zoomend", handleMapZoom)
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

    // Initialize advanced map features
    const initializeMapFeatures = useCallback(() => {
        if (!map.current) return

        // Add terrain source
        map.current.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
        })

        // Add 3D buildings
        if (show3D) {
            add3DBuildings()
        }

        // Add weather layer
        if (showWeather) {
            addWeatherLayer()
        }

        // Add traffic layer
        if (showTraffic) {
            addTrafficLayer()
        }

        // Initialize geofences
        initializeGeofences()

        // Initialize heatmap
        if (showHeatmap) {
            initializeHeatmap()
        }
    }, [show3D, showWeather, showTraffic, showHeatmap])

    // Map event handlers
    const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
        console.log("🖱️ Map clicked at:", e.lngLat)

        // Check if clicked on a user marker
        const features = map.current?.queryRenderedFeatures(e.point, {
            layers: ["user-markers"],
        })

        if (features && features.length > 0) {
            const userId = features[0].properties?.userId
            if (userId) {
                setSelectedUser(userId)
            }
        }
    }, [])

    const handleMapRightClick = useCallback((e: mapboxgl.MapMouseEvent) => {
        e.preventDefault()
        console.log("🖱️ Map right-clicked at:", e.lngLat)

        // Add context menu functionality here
        // Could add geofence creation, waypoint addition, etc.
    }, [])

    const handleMapMove = useCallback(() => {
        if (map.current) {
            const bearing = map.current.getBearing()
            const pitch = map.current.getPitch()

            setMapBearing(Math.round(bearing))
            setMapPitch(Math.round(pitch))
        }
    }, [])

    const handleMapZoom = useCallback(() => {
        if (map.current) {
            const zoom = map.current.getZoom()
            console.log("🔍 Zoom level:", zoom)

            // Adjust marker clustering based on zoom
            if (zoom < 10 && !showClusters) {
                setShowClusters(true)
            } else if (zoom >= 10 && showClusters) {
                setShowClusters(false)
            }
        }
    }, [showClusters])

    // Add 3D buildings
    const add3DBuildings = useCallback(() => {
        if (!map.current) return

        map.current.addLayer({
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
                "fill-extrusion-color": "#aaa",
                "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
                "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
                "fill-extrusion-opacity": 0.6,
            },
        })
    }, [])

    // Add weather layer
    const addWeatherLayer = useCallback(() => {
        if (!map.current) return

        // Add weather radar layer (example)
        map.current.addSource("weather", {
            type: "raster",
            tiles: ["https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_WEATHER_API_KEY"],
            tileSize: 256,
        })

        map.current.addLayer({
            id: "weather-layer",
            type: "raster",
            source: "weather",
            paint: {
                "raster-opacity": 0.6,
            },
        })
    }, [])

    // Add traffic layer
    const addTrafficLayer = useCallback(() => {
        if (!map.current) return

        map.current.addLayer({
            id: "traffic",
            type: "line",
            source: {
                type: "vector",
                url: "mapbox://mapbox.mapbox-traffic-v1",
            },
            "source-layer": "traffic",
            paint: {
                "line-width": 2,
                "line-color": [
                    "case",
                    ["==", ["get", "congestion"], "low"],
                    "#00ff00",
                    ["==", ["get", "congestion"], "moderate"],
                    "#ffff00",
                    ["==", ["get", "congestion"], "heavy"],
                    "#ff8800",
                    ["==", ["get", "congestion"], "severe"],
                    "#ff0000",
                    "#000000",
                ],
            },
        })
    }, [])

    // Initialize geofences
    const initializeGeofences = useCallback(() => {
        if (!map.current) return

        // Example geofences
        const geofences: Geofence[] = [
            {
                id: "office-zone",
                name: "Office Zone",
                center: [-74.006, 40.7128],
                radius: 500,
                color: "#3b82f6",
            },
            {
                id: "restricted-area",
                name: "Restricted Area",
                center: [-74.01, 40.71],
                radius: 300,
                color: "#ef4444",
            },
        ]

        geofences.forEach((geofence) => {
            // Add geofence circle
            map.current!.addSource(`geofence-${geofence.id}`, {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Point",
                        coordinates: geofence.center,
                    },
                },
            })

            map.current!.addLayer({
                id: `geofence-${geofence.id}`,
                type: "circle",
                source: `geofence-${geofence.id}`,
                paint: {
                    "circle-radius": {
                        base: 1.75,
                        stops: [
                            [12, geofence.radius / 20],
                            [22, geofence.radius],
                        ],
                    },
                    "circle-color": geofence.color,
                    "circle-opacity": 0.2,
                    "circle-stroke-color": geofence.color,
                    "circle-stroke-width": 2,
                    "circle-stroke-opacity": 0.8,
                },
            })

            geofencesRef.current.set(geofence.id, geofence)
        })
    }, [])

    // Initialize heatmap
    const initializeHeatmap = useCallback(() => {
        if (!map.current || !users.length) return

        const heatmapData = {
            type: "FeatureCollection" as const,
            features: users
                .filter((user) => user.location)
                .map((user) => ({
                    type: "Feature" as const,
                    properties: {
                        weight: user.role === "admin" ? 3 : user.role === "supervisor" ? 2 : 1,
                    },
                    geometry: {
                        type: "Point" as const,
                        coordinates: [user.location!.longitude, user.location!.latitude],
                    },
                })),
        }

        if (map.current.getSource("heatmap-data")) {
            ; (map.current.getSource("heatmap-data") as mapboxgl.GeoJSONSource).setData(heatmapData)
        } else {
            map.current.addSource("heatmap-data", {
                type: "geojson",
                data: heatmapData,
            })

            map.current.addLayer({
                id: "heatmap",
                type: "heatmap",
                source: "heatmap-data",
                maxzoom: 15,
                paint: {
                    "heatmap-weight": ["get", "weight"],
                    "heatmap-intensity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        11, 1,
                        15, 3
                    ],
                    "heatmap-color": [
                        "interpolate",
                        ["linear"],
                        ["heatmap-density"],
                        0,
                        "rgba(33,102,172,0)",
                        0.2,
                        "rgb(103,169,207)",
                        0.4,
                        "rgb(209,229,240)",
                        0.6,
                        "rgb(253,219,199)",
                        0.8,
                        "rgb(239,138,98)",
                        1,
                        "rgb(178,24,43)",
                    ],
                    "heatmap-radius": {
                        stops: [
                            [11, 15],
                            [15, 20],
                        ],
                    },
                    "heatmap-opacity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        14, 1,
                        15, 0
                    ],
                },
            })
        }
    }, [users])

    // Update markers and trails with advanced features
    const updateMarkersAndTrails = useCallback(() => {
        if (!map.current || !mapLoaded) return

        console.log("🗺️ Updating markers for", users.length, "users")

        // Clear old markers for users that no longer exist
        const currentUserIds = new Set(users.map((u) => u.id))
        markersRef.current.forEach((marker, userId) => {
            if (!currentUserIds.has(userId)) {
                console.log(`🗑️ Removing marker for user ${userId}`)
                marker.remove()
                markersRef.current.delete(userId)
            }
        })

        users.forEach((user: User) => {
            if (!user.location) return

            const { id, name, role, location: userLocation, status, trail, isTyping } = user
            let marker = markersRef.current.get(id)

            if (!marker) {
                console.log(`🆕 Creating new marker for ${name}`)

                const el = document.createElement("div")
                el.className = "user-marker"
                el.style.cssText = `
          width: ${markerSize[0]}px;
          height: ${markerSize[0]}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${markerSize[0] * 0.45}px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 1000;
          position: relative;
          transform-origin: center;
        `

                el.style.backgroundColor = status === "offline" ? "#6b7280" : roleColors[role]
                el.textContent = roleIcons[role]

                if (status === "offline") {
                    el.style.opacity = "0.6"
                }

                // Add status indicators
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

                // Add accuracy circle if available
                if (userLocation.accuracy && userLocation.accuracy < 100) {
                    const accuracyCircle = document.createElement("div")
                    accuracyCircle.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${Math.max(20, userLocation.accuracy / 2)}px;
            height: ${Math.max(20, userLocation.accuracy / 2)}px;
            border: 2px solid ${roleColors[role]};
            border-radius: 50%;
            opacity: 0.3;
            pointer-events: none;
          `
                    el.appendChild(accuracyCircle)
                }

                // Enhanced popup with more information
                const popup = new mapboxgl.Popup({
                    offset: 25,
                    closeButton: true,
                    closeOnClick: false,
                    maxWidth: "300px",
                }).setHTML(`
          <div class="p-4 min-w-[250px]">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">${roleIcons[role]}</span>
              <div>
                <div class="font-bold text-lg">${name}</div>
                <div class="text-sm text-gray-500 capitalize">${role}</div>
              </div>
            </div>
            
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="font-medium">Status:</span>
                <span class="capitalize font-medium px-2 py-1 rounded text-xs" style="background-color: ${status === "online" ? "#dcfce7" : status === "away" ? "#fef3c7" : "#f3f4f6"
                    }; color: ${status === "online" ? "#166534" : status === "away" ? "#92400e" : "#6b7280"
                    }">${status}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="font-medium">Location:</span>
                <span class="font-mono text-xs">${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}</span>
              </div>
              
              ${userLocation.accuracy
                        ? `
                <div class="flex justify-between">
                  <span class="font-medium">Accuracy:</span>
                  <span class="text-green-600">±${Math.round(userLocation.accuracy)}m</span>
                </div>
              `
                        : ""
                    }
              
              ${userLocation.speed
                        ? `
                <div class="flex justify-between">
                  <span class="font-medium">Speed:</span>
                  <span>${Math.round((userLocation.speed || 0) * 3.6)} km/h</span>
                </div>
              `
                        : ""
                    }
              
              ${userLocation.heading
                        ? `
                <div class="flex justify-between">
                  <span class="font-medium">Heading:</span>
                  <span>${Math.round(userLocation.heading)}°</span>
                </div>
              `
                        : ""
                    }
              
              <div class="flex justify-between">
                <span class="font-medium">Last Seen:</span>
                <span>${new Date(user.lastSeen).toLocaleTimeString()}</span>
              </div>
              
              ${user.isTyping ? '<div class="text-green-600 text-sm font-medium">💬 Currently typing...</div>' : ""}
              
              ${trail.length > 0
                        ? `
                <div class="flex justify-between">
                  <span class="font-medium">Trail Points:</span>
                  <span>${trail.length}</span>
                </div>
              `
                        : ""
                    }
            </div>
            
            <div class="mt-3 pt-3 border-t flex gap-2">
              <button onclick="focusUser('${id}')" class="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                Focus
              </button>
              <button onclick="messageUser('${id}')" class="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">
                Message
              </button>
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

            // Handle trails with advanced styling
            if (showTrails && trail && trail.length > 1) {
                const trailId = `trail-${id}`
                try {
                    if (!trailSourcesRef.current.has(id)) {
                        console.log(`🛤️ Creating trail for ${name}`)

                        const trailData = {
                            type: "Feature" as const,
                            properties: {
                                userId: id,
                                userName: name,
                                userRole: role,
                            },
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
                                "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 15, 4, 20, 8],
                                "line-opacity": trailOpacity[0] / 100,
                                "line-dasharray": role === "admin" ? [1, 0] : [2, 2],
                            },
                        })

                        // Add trail animation
                        map.current!.addLayer({
                            id: `${trailId}-animation`,
                            type: "line",
                            source: trailId,
                            layout: {
                                "line-join": "round",
                                "line-cap": "round",
                            },
                            paint: {
                                "line-color": roleColors[role],
                                "line-width": 6,
                                "line-opacity": 0.4,
                                "line-dasharray": [0, 4, 3],
                            },
                        })

                        trailSourcesRef.current.add(id)
                    } else {
                        const source = map.current!.getSource(trailId) as mapboxgl.GeoJSONSource
                        if (source) {
                            source.setData({
                                type: "Feature",
                                properties: {
                                    userId: id,
                                    userName: name,
                                    userRole: role,
                                },
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

        // Update heatmap if enabled
        if (showHeatmap) {
            initializeHeatmap()
        }

        // Auto follow selected user
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
    }, [users, selectedUser, autoFollow, mapLoaded, showTrails, showHeatmap, trailOpacity, markerSize, initializeHeatmap])

    useEffect(() => {
        updateMarkersAndTrails()
    }, [updateMarkersAndTrails])

    // Handle location updates with better control
    useEffect(() => {
        if (location && map.current && mapLoaded && !autoFollow) {
            console.log(`📍 Centering map on user location: [${location.longitude}, ${location.latitude}]`)
            map.current.flyTo({
                center: [location.longitude, location.latitude],
                zoom: 15,
                duration: 2000,
            })
        }
    }, [location, mapLoaded, autoFollow])

    // Map style change handler
    const changeMapStyle = useCallback(
        (styleId: string) => {
            if (!map.current) return

            setCurrentMapStyle(styleId)
            map.current.setStyle(`mapbox://styles/mapbox/${styleId}`)

            // Re-add custom layers after style change
            map.current.once("styledata", () => {
                initializeMapFeatures()
                updateMarkersAndTrails()
            })
        },
        [initializeMapFeatures, updateMarkersAndTrails],
    )

    // Location control handlers
    const handleLocationToggle = useCallback(() => {
        if (isWatching) {
            stopWatching()
        } else {
            startWatching()
        }
    }, [isWatching, startWatching, stopWatching])

    const handleGetCurrentLocation = useCallback(async () => {
        try {
            const currentLocation = await getCurrentLocation()
            if (currentLocation && map.current) {
                map.current.flyTo({
                    center: [currentLocation.longitude, currentLocation.latitude],
                    zoom: 16,
                    duration: 1500,
                })
            }
        } catch (error) {
            console.error("Failed to get current location:", error)
        }
    }, [getCurrentLocation])

    // Export data with enhanced features
    const handleExportData = useCallback(() => {
        const data = {
            users,
            messages,
            geofences: Array.from(geofencesRef.current.entries()),
            mapSettings: {
                style: currentMapStyle,
                center: map.current?.getCenter(),
                zoom: map.current?.getZoom(),
                bearing: mapBearing,
                pitch: mapPitch,
            },
            timestamp: new Date(),
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `live-tracking-advanced-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [users, messages, currentMapStyle, mapBearing, mapPitch])

    // Reset map view
    const resetMapView = useCallback(() => {
        if (!map.current) return

        map.current.flyTo({
            center: [-74.006, 40.7128],
            zoom: 13,
            bearing: 0,
            pitch: 0,
            duration: 2000,
        })
    }, [])

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
                                <div className="font-semibold">Loading Advanced Map...</div>
                                <div className="text-sm text-gray-500">Initializing Mapbox GL with enhanced features</div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Connection Status */}
            <ConnectionStatus />

            {/* User Simulator */}
            <UserSimulator />

            {/* Advanced Map Controls */}
            <div className="absolute top-4 right-4 z-10 space-y-2">
                {/* Main Controls */}
                <div className="flex gap-2">
                    <Button
                        variant={showUserList ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowUserList(!showUserList)}
                    >
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
                </div>

                {/* Advanced Controls */}
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4 mr-1" />
                                Settings
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Map Style</label>
                                    <Select value={currentMapStyle} onValueChange={changeMapStyle}>
                                        <SelectTrigger className="w-full mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mapStyles.map((style) => (
                                                <SelectItem key={style.id} value={style.id}>
                                                    {style.icon} {style.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Show Trails</label>
                                        <Switch checked={showTrails} onCheckedChange={setShowTrails} />
                                    </div>

                                    {showTrails && (
                                        <div>
                                            <label className="text-sm text-gray-600">Trail Opacity: {trailOpacity[0]}%</label>
                                            <Slider
                                                value={trailOpacity}
                                                onValueChange={setTrailOpacity}
                                                max={100}
                                                min={10}
                                                step={10}
                                                className="mt-1"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600">Marker Size: {markerSize[0]}px</label>
                                    <Slider
                                        value={markerSize}
                                        onValueChange={setMarkerSize}
                                        max={60}
                                        min={20}
                                        step={5}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Show Heatmap</label>
                                        <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Show Geofences</label>
                                        <Switch checked={showGeofences} onCheckedChange={setShowGeofences} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">3D Buildings</label>
                                        <Switch checked={show3D} onCheckedChange={setShow3D} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Traffic Layer</label>
                                        <Switch checked={showTraffic} onCheckedChange={setShowTraffic} />
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MapPin className="w-4 h-4 mr-1" />
                                Location
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4">
                            <div className="space-y-3">
                                <div className="text-sm font-medium">Location Control</div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Status:</span>
                                        <Badge
                                            variant={
                                                permissionStatus === "granted"
                                                    ? "default"
                                                    : permissionStatus === "denied"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {permissionStatus}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Watching:</span>
                                        <Badge variant={isWatching ? "default" : "secondary"}>{isWatching ? "Active" : "Inactive"}</Badge>
                                    </div>

                                    {location && (
                                        <div className="text-xs text-gray-600">
                                            <div>Lat: {location.latitude.toFixed(6)}</div>
                                            <div>Lng: {location.longitude.toFixed(6)}</div>
                                            {location.accuracy && <div>Accuracy: ±{Math.round(location.accuracy)}m</div>}
                                        </div>
                                    )}

                                    {locationError && <div className="text-xs text-red-600 p-2 bg-red-50 rounded">{locationError}</div>}
                                </div>

                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={handleLocationToggle} disabled={locationLoading}>
                                        {isWatching ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                                        {isWatching ? "Stop" : "Start"}
                                    </Button>

                                    <Button size="sm" onClick={handleGetCurrentLocation} disabled={locationLoading}>
                                        <Navigation className="w-3 h-3 mr-1" />
                                        {locationLoading ? "Getting..." : "Get"}
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" size="sm" onClick={resetMapView}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset
                    </Button>
                </div>

                {/* Recording and Export */}
                <div className="flex gap-2">
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
                </div>

                {/* Map Info */}
                <Card className="p-2 text-xs">
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>Bearing:</span>
                            <span>{mapBearing}°</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pitch:</span>
                            <span>{mapPitch}°</span>
                        </div>
                        {latency !== null && (
                            <div className="flex justify-between">
                                <span>Latency:</span>
                                <span
                                    className={latency > 1000 ? "text-red-500" : latency > 500 ? "text-yellow-500" : "text-green-500"}
                                >
                                    {latency}ms
                                </span>
                            </div>
                        )}
                    </div>
                </Card>
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

            {/* Location Status */}
            {(locationLoading || locationError) && (
                <div className="absolute bottom-4 left-4 z-10">
                    <Card className="p-3">
                        <div className="flex items-center gap-2">
                            {locationLoading && (
                                <>
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm">Getting location...</span>
                                </>
                            )}
                            {locationError && (
                                <>
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-red-600">Location error</span>
                                </>
                            )}
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
