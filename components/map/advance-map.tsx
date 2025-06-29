"use client"

import "mapbox-gl/dist/mapbox-gl.css"
import mapboxgl from "mapbox-gl"
import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import useCurrentLocation from "@/hooks/useCurrentLocation"
import { AlertCircle, Navigation, X } from "lucide-react"
import { MapSearch } from "./map-search"
import { MapControls } from "./map-control"
import { LocationInfoPanel } from "./location-info-panel"

// Set your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""

interface LocationInfo {
    name: string
    address: string
    coordinates: [number, number]
    category?: string
    rating?: number
    phone?: string
    website?: string
    hours?: string
    description?: string
}

export default function AdvancedMap() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const userMarkerRef = useRef<mapboxgl.Marker | null>(null)
    const searchMarkerRef = useRef<mapboxgl.Marker | null>(null)
    const routeSourceRef = useRef<string>("route")

    const { location, error, loading, requestLocation } = useCurrentLocation(true)

    const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v12")
    const [trafficEnabled, setTrafficEnabled] = useState(false)
    const [is3DEnabled, setIs3DEnabled] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null)
    const [isRoutingMode, setIsRoutingMode] = useState(false)
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)

    // Initialize map
    useEffect(() => {
        if (!mapRef.current && mapContainer.current && mapboxgl.accessToken) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: mapStyle,
                center: [-74.006, 40.7128], // Default to NYC
                zoom: 12,
                pitch: 0,
                bearing: 0,
                antialias: true,
            })

            // Add navigation control
            mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right")

            // Add fullscreen control
            mapRef.current.addControl(new mapboxgl.FullscreenControl(), "bottom-right")

            // Add scale control
            mapRef.current.addControl(new mapboxgl.ScaleControl(), "bottom-left")

            // Map click handler for POI selection
            mapRef.current.on("click", async (e) => {
                const features = mapRef.current!.queryRenderedFeatures(e.point, {
                    layers: ["poi-label"],
                })

                if (features.length > 0) {
                    const feature = features[0]
                    const coordinates = e.lngLat.toArray() as [number, number]

                    // Create location info from clicked feature
                    const locationInfo: LocationInfo = {
                        name: feature.properties?.name || "Unknown Location",
                        address: feature.properties?.address || `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`,
                        coordinates,
                        category: feature.properties?.category,
                    }

                    setSelectedLocation(locationInfo)

                    // Add search marker
                    if (searchMarkerRef.current) {
                        searchMarkerRef.current.remove()
                    }

                    const el = document.createElement("div")
                    el.className = "search-marker"
                    el.style.cssText = `
            background-color: #ef4444;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          `

                    searchMarkerRef.current = new mapboxgl.Marker(el).setLngLat(coordinates).addTo(mapRef.current!)
                }
            })

            // Add map load event for additional features
            mapRef.current.on("load", () => {
                // Add 3D buildings layer (initially hidden)
                if (!mapRef.current!.getLayer("3d-buildings")) {
                    mapRef.current!.addLayer({
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
                        layout: {
                            visibility: "none",
                        },
                    })
                }
            })
        }
    }, [mapStyle])

    // Update user location
    useEffect(() => {
        if (!mapRef.current || !location) return

        const lngLat: [number, number] = [location.longitude, location.latitude]

        // Center map on first location
        if (!userMarkerRef.current) {
            mapRef.current.setCenter(lngLat)
            mapRef.current.setZoom(15)
        }

        // Update or create user marker
        if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat(lngLat)
        } else {
            const el = document.createElement("div")
            el.className = "user-marker"
            el.style.cssText = `
        background: linear-gradient(45deg, #3b82f6, #1d4ed8);
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        position: relative;
      `

            // Add pulsing animation
            const pulse = document.createElement("div")
            pulse.style.cssText = `
        position: absolute;
        top: -10px;
        left: -10px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.2);
        animation: pulse 2s infinite;
      `
            el.appendChild(pulse)

            // Add CSS animation
            const style = document.createElement("style")
            style.textContent = `
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `
            document.head.appendChild(style)

            userMarkerRef.current = new mapboxgl.Marker(el)
                .setLngLat(lngLat)
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <strong>Your Location</strong><br>
                <small>Accuracy: ${location.accuracy}m</small>
              </div>
            `),
                )
                .addTo(mapRef.current)
        }
    }, [location])

    // Map control handlers
    const handleStyleChange = (style: string) => {
        setMapStyle(style)
        if (mapRef.current) {
            mapRef.current.setStyle(style)
        }
    }

    const handleToggleTraffic = (enabled: boolean) => {
        setTrafficEnabled(enabled)
        if (mapRef.current) {
            if (enabled) {
                mapRef.current.addSource("mapbox-traffic", {
                    type: "vector",
                    url: "mapbox://mapbox.mapbox-traffic-v1",
                })
                mapRef.current.addLayer({
                    id: "traffic",
                    type: "line",
                    source: "mapbox-traffic",
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
                            "#ff8000",
                            ["==", ["get", "congestion"], "severe"],
                            "#ff0000",
                            "#000000",
                        ],
                    },
                })
            } else {
                if (mapRef.current.getLayer("traffic")) {
                    mapRef.current.removeLayer("traffic")
                }
                if (mapRef.current.getSource("mapbox-traffic")) {
                    mapRef.current.removeSource("mapbox-traffic")
                }
            }
        }
    }

    const handleToggle3D = (enabled: boolean) => {
        setIs3DEnabled(enabled)
        if (mapRef.current && mapRef.current.getLayer("3d-buildings")) {
            mapRef.current.setLayoutProperty("3d-buildings", "visibility", enabled ? "visible" : "none")
            if (enabled) {
                mapRef.current.setPitch(45)
            } else {
                mapRef.current.setPitch(0)
            }
        }
    }

    const handleZoomIn = () => {
        mapRef.current?.zoomIn()
    }

    const handleZoomOut = () => {
        mapRef.current?.zoomOut()
    }

    const handleResetBearing = () => {
        mapRef.current?.resetNorth()
    }

    const handleLocateUser = () => {
        if (location && mapRef.current) {
            mapRef.current.flyTo({
                center: [location.longitude, location.latitude],
                zoom: 16,
                duration: 1000,
            })
        } else {
            requestLocation()
        }
    }

    const handleLocationSelect = async (coordinates: [number, number], name: string) => {
        if (!mapRef.current) return

        mapRef.current.flyTo({
            center: coordinates,
            zoom: 16,
            duration: 1000,
        })

        // Remove existing search marker
        if (searchMarkerRef.current) {
            searchMarkerRef.current.remove()
        }

        // Add new search marker
        const el = document.createElement("div")
        el.className = "search-marker"
        el.style.cssText = `
      background-color: #ef4444;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    `

        searchMarkerRef.current = new mapboxgl.Marker(el).setLngLat(coordinates).addTo(mapRef.current)

        // Set location info
        setSelectedLocation({
            name,
            address: `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`,
            coordinates,
        })
    }

    const handleGetDirections = async (destination: [number, number]) => {
        if (!location || !mapRef.current) return

        setIsRoutingMode(true)
        const start = [location.longitude, location.latitude]

        try {
            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
            )
            const data = await response.json()

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0]

                // Add route to map
                if (mapRef.current.getSource(routeSourceRef.current)) {
                    mapRef.current.removeLayer("route")
                    mapRef.current.removeSource(routeSourceRef.current)
                }

                mapRef.current.addSource(routeSourceRef.current, {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        properties: {},
                        geometry: route.geometry,
                    },
                })

                mapRef.current.addLayer({
                    id: "route",
                    type: "line",
                    source: routeSourceRef.current,
                    layout: {
                        "line-join": "round",
                        "line-cap": "round",
                    },
                    paint: {
                        "line-color": "#3b82f6",
                        "line-width": 5,
                        "line-opacity": 0.8,
                    },
                })

                // Fit map to route
                const coordinates = route.geometry.coordinates
                const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
                    return bounds.extend(coord)
                }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

                mapRef.current.fitBounds(bounds, { padding: 50 })

                // Set route info
                setRouteInfo({
                    distance: `${(route.distance / 1000).toFixed(1)} km`,
                    duration: `${Math.round(route.duration / 60)} min`,
                })
            }
        } catch (error) {
            console.error("Routing error:", error)
        }
    }

    const clearRoute = () => {
        if (mapRef.current) {
            if (mapRef.current.getLayer("route")) {
                mapRef.current.removeLayer("route")
            }
            if (mapRef.current.getSource(routeSourceRef.current)) {
                mapRef.current.removeSource(routeSourceRef.current)
            }
        }
        setIsRoutingMode(false)
        setRouteInfo(null)
    }

    if (!mapboxgl.accessToken) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Mapbox access token is required. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="relative w-full h-screen">
            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
                    <Card className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Getting your location...</span>
                        </div>
                    </Card>
                </div>
            )}

            {/* Error alert */}
            {error && (
                <Alert className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Route info */}
            {isRoutingMode && routeInfo && (
                <Card className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 p-3">
                    <div className="flex items-center space-x-4">
                        <Navigation className="h-4 w-4 text-blue-600" />
                        <div className="flex items-center space-x-4 text-sm">
                            <span>
                                <strong>{routeInfo.distance}</strong>
                            </span>
                            <span>
                                <strong>{routeInfo.duration}</strong>
                            </span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={clearRoute}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            )}

            {/* Map container */}
            <div ref={mapContainer} className="w-full h-full" />

            {/* Map search */}
            <MapSearch onLocationSelect={handleLocationSelect} accessToken={mapboxgl.accessToken} />

            {/* Map controls */}
            <MapControls
                onStyleChange={handleStyleChange}
                onToggleTraffic={handleToggleTraffic}
                onToggle3D={handleToggle3D}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetBearing={handleResetBearing}
                onLocateUser={handleLocateUser}
                currentStyle={mapStyle}
                trafficEnabled={trafficEnabled}
                is3DEnabled={is3DEnabled}
            />

            {/* Location info panel */}
            <LocationInfoPanel
                location={selectedLocation}
                onClose={() => {
                    setSelectedLocation(null)
                    if (searchMarkerRef.current) {
                        searchMarkerRef.current.remove()
                        searchMarkerRef.current = null
                    }
                }}
                onGetDirections={handleGetDirections}
            />
        </div>
    )
}
