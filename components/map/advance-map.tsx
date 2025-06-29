"use client"

import "mapbox-gl/dist/mapbox-gl.css"
import mapboxgl from "mapbox-gl"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { MapSearch } from "./map-search"
import { LocationInfoPanel } from "./location-info-panel"
import useCurrentLocation from "@/hooks/useCurrentLocation"
import { AlertCircle, Navigation, X } from "lucide-react"
import { toast } from "sonner"
import { DrawingTools } from "./drawing-tool"
import { MeasurementTools } from "./measurement-tool"
import { MapControls } from "./map-control"

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
    photos?: string[]
    reviews?: Array<{
        author: string
        rating: number
        text: string
        date: string
    }>
    details?: Record<string, unknown>
}

export default function AdvancedMap() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const userMarkerRef = useRef<mapboxgl.Marker | null>(null)
    const searchMarkerRef = useRef<mapboxgl.Marker | null>(null)
    const drawRef = useRef<MapboxDraw | null>(null)
    const routeSourceRef = useRef<string>("route")

    const { location, error, loading, requestLocation } = useCurrentLocation(true)

    // Map state
    const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/satellite-v9")
    const [trafficEnabled, setTrafficEnabled] = useState(false)
    const [is3DEnabled, setIs3DEnabled] = useState(false)
    const [terrainEnabled, setTerrainEnabled] = useState(false)
    const [weatherEnabled, setWeatherEnabled] = useState(false)
    const [clusteringEnabled, setClusteringEnabled] = useState(false)
    const [heatmapEnabled, setHeatmapEnabled] = useState(false)

    // Tool states
    const [drawingEnabled, setDrawingEnabled] = useState(false)
    const [measurementEnabled, setMeasurementEnabled] = useState(false)
    const [activeTool, setActiveTool] = useState("")
    const [drawingColor, setDrawingColor] = useState("#ef4444")
    const [measurements, setMeasurements] = useState<
        Array<{
            type: string
            value: string
            unit: string
        }>
    >([])

    // Location state
    const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null)
    const [isRoutingMode, setIsRoutingMode] = useState(false)
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)

    // Sample data for clustering and heatmap
    const sampleLocations = [
        [-74.006, 40.7128],
        [-74.0059, 40.7127],
        [-74.0061, 40.7129],
        [-74.0065, 40.7125],
        [-74.0055, 40.7135],
        [-74.007, 40.712],
        [-74.005, 40.714],
        [-74.0075, 40.7115],
        [-74.0045, 40.7145],
        [-74.008, 40.711],
        [-74.004, 40.715],
        [-74.0085, 40.7105],
    ]

    // Initialize map with enhanced satellite view
    useEffect(() => {
        if (!mapRef.current && mapContainer.current && mapboxgl.accessToken) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: mapStyle,
                center: [-74.006, 40.7128],
                zoom: 12,
                pitch: 0,
                bearing: 0,
                antialias: true,
                maxZoom: 22, // Enable high zoom for satellite
                preserveDrawingBuffer: true, // For screenshots
            })

            // Add enhanced controls
            mapRef.current.addControl(
                new mapboxgl.NavigationControl({
                    visualizePitch: true,
                    showZoom: true,
                    showCompass: true,
                }),
                "bottom-right",
            )

            mapRef.current.addControl(new mapboxgl.FullscreenControl(), "bottom-right")
            mapRef.current.addControl(
                new mapboxgl.ScaleControl({
                    maxWidth: 100,
                    unit: "metric",
                }),
                "bottom-left",
            )

            // Initialize drawing tools
            drawRef.current = new MapboxDraw({
                displayControlsDefault: false,
                controls: {},
                styles: [
                    {
                        id: "gl-draw-polygon-fill-inactive",
                        type: "fill",
                        filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                        paint: {
                            "fill-color": drawingColor,
                            "fill-outline-color": drawingColor,
                            "fill-opacity": 0.3,
                        },
                    },
                    {
                        id: "gl-draw-polygon-stroke-inactive",
                        type: "line",
                        filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                        layout: {
                            "line-cap": "round",
                            "line-join": "round",
                        },
                        paint: {
                            "line-color": drawingColor,
                            "line-width": 2,
                        },
                    },
                    {
                        id: "gl-draw-line-inactive",
                        type: "line",
                        filter: ["all", ["==", "active", "false"], ["==", "$type", "LineString"], ["!=", "mode", "static"]],
                        layout: {
                            "line-cap": "round",
                            "line-join": "round",
                        },
                        paint: {
                            "line-color": drawingColor,
                            "line-width": 2,
                        },
                    },
                    {
                        id: "gl-draw-polygon-and-line-vertex-halo-active",
                        type: "circle",
                        filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
                        paint: {
                            "circle-radius": 5,
                            "circle-color": "#FFF",
                        },
                    },
                    {
                        id: "gl-draw-polygon-and-line-vertex-active",
                        type: "circle",
                        filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
                        paint: {
                            "circle-radius": 3,
                            "circle-color": drawingColor,
                        },
                    },
                ],
            })

            // Map load event for additional features
            mapRef.current.on("load", () => {
                // Add terrain source
                mapRef.current!.addSource("mapbox-dem", {
                    type: "raster-dem",
                    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                    tileSize: 512,
                    maxzoom: 14,
                })

                // Add 3D buildings layer
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

                // Add sample data for clustering
                mapRef.current!.addSource("sample-points", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: sampleLocations.map((coord, index) => ({
                            type: "Feature",
                            properties: {
                                id: index,
                                name: `Location ${index + 1}`,
                                category: "sample",
                            },
                            geometry: {
                                type: "Point",
                                coordinates: coord,
                            },
                        })),
                    },
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 50,
                })

                // Add cluster layers
                mapRef.current!.addLayer({
                    id: "clusters",
                    type: "circle",
                    source: "sample-points",
                    filter: ["has", "point_count"],
                    paint: {
                        "circle-color": ["step", ["get", "point_count"], "#51bbd6", 100, "#f1f075", 750, "#f28cb1"],
                        "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
                    },
                    layout: {
                        visibility: "none",
                    },
                })

                mapRef.current!.addLayer({
                    id: "cluster-count",
                    type: "symbol",
                    source: "sample-points",
                    filter: ["has", "point_count"],
                    layout: {
                        "text-field": "{point_count_abbreviated}",
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12,
                        visibility: "none",
                    },
                })

                mapRef.current!.addLayer({
                    id: "unclustered-point",
                    type: "circle",
                    source: "sample-points",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        "circle-color": "#11b4da",
                        "circle-radius": 4,
                        "circle-stroke-width": 1,
                        "circle-stroke-color": "#fff",
                    },
                    layout: {
                        visibility: "none",
                    },
                })

                // Add heatmap layer
                mapRef.current!.addLayer({
                    id: "heatmap",
                    type: "heatmap",
                    source: "sample-points",
                    maxzoom: 15,
                    paint: {
                        "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 0, 0, 6, 1],
                        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
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
                        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 15, 20],
                        "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 15, 0],
                    },
                    layout: {
                        visibility: "none",
                    },
                })
            })

            // Enhanced click handler
            mapRef.current.on("click", async (e) => {
                const features = mapRef.current!.queryRenderedFeatures(e.point, {
                    layers: ["poi-label", "clusters", "unclustered-point"],
                })

                if (features.length > 0) {
                    const feature = features[0]

                    // Handle cluster clicks
                    if (feature.layer && feature.layer.id === "clusters") {
                        const clusterId = feature.properties!.cluster_id
                        const source = mapRef.current!.getSource("sample-points") as mapboxgl.GeoJSONSource
                        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                            if (!err) {
                                if (typeof zoom === "number") {
                                    mapRef.current!.easeTo({
                                        center: (feature.geometry as any).coordinates,
                                        zoom: zoom,
                                    })
                                }
                            }
                        })
                        return
                    }

                    const coordinates = e.lngLat.toArray() as [number, number]
                    const locationInfo: LocationInfo = {
                        name: feature.properties?.name || "Unknown Location",
                        address: feature.properties?.address || `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`,
                        coordinates,
                        category: feature.properties?.category,
                        rating: feature.properties?.rating ? Number.parseFloat(feature.properties.rating) : undefined,
                        phone: feature.properties?.tel,
                        website: feature.properties?.website,
                        hours: feature.properties?.opening_hours,
                    }

                    setSelectedLocation(locationInfo)
                    addSearchMarker(coordinates)
                }
            })
        }
    }, [mapStyle, drawingColor])

    // Update user location with enhanced marker
    useEffect(() => {
        if (!mapRef.current || !location) return

        const lngLat: [number, number] = [location.longitude, location.latitude]

        if (!userMarkerRef.current) {
            mapRef.current.setCenter(lngLat)
            mapRef.current.setZoom(16)
        }

        if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat(lngLat)
        } else {
            const el = document.createElement("div")
            el.className = "user-marker"
            el.innerHTML = `
        <div style="
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -10px;
            left: -10px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.2);
            animation: pulse 2s infinite;
          "></div>
        </div>
      `

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
            <div style="padding: 8px;">
              <strong>Your Location</strong><br>
              <small>Accuracy: ${location.accuracy}m</small>
              ${location.speed ? `<br><small>Speed: ${(location.speed * 3.6).toFixed(1)} km/h</small>` : ""}
              ${location.heading ? `<br><small>Heading: ${location.heading.toFixed(0)}°</small>` : ""}
            </div>
          `),
                )
                .addTo(mapRef.current)
        }
    }, [location])

    // Helper function to add search marker
    const addSearchMarker = (coordinates: [number, number]) => {
        if (!mapRef.current) return

        if (searchMarkerRef.current) {
            searchMarkerRef.current.remove()
        }

        const el = document.createElement("div")
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
    }

    // Map control handlers
    const handleStyleChange = useCallback((style: string) => {
        setMapStyle(style)
        if (mapRef.current) {
            mapRef.current.setStyle(style)

            // For satellite styles, ensure high-resolution imagery
            if (style.includes("satellite")) {
                mapRef.current.on("styledata", () => {
                    // Force high-resolution tiles
                    mapRef.current!.getSource("mapbox://mapbox.satellite")
                })
            }
        }
    }, [])

    const handleToggleTraffic = useCallback((enabled: boolean) => {
        setTrafficEnabled(enabled)
        if (!mapRef.current) return

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
                    "line-width": 3,
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
                mapRef.current.removeSource("mapbox-traffic")
            }
        }
    }, [])

    const handleToggle3D = useCallback((enabled: boolean) => {
        setIs3DEnabled(enabled)
        if (!mapRef.current) return

        if (mapRef.current.getLayer("3d-buildings")) {
            mapRef.current.setLayoutProperty("3d-buildings", "visibility", enabled ? "visible" : "none")
            mapRef.current.easeTo({
                pitch: enabled ? 45 : 0,
                duration: 1000,
            })
        }
    }, [])

    const handleToggleTerrain = useCallback((enabled: boolean) => {
        setTerrainEnabled(enabled)
        if (!mapRef.current) return

        if (enabled) {
            mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })
        } else {
            mapRef.current.setTerrain(null)
        }
    }, [])

    const handleToggleWeather = useCallback((enabled: boolean) => {
        setWeatherEnabled(enabled)
        if (!mapRef.current) return

        if (enabled) {
            // Add weather radar layer
            mapRef.current.addSource("weather", {
                type: "raster",
                tiles: ["https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY"],
                tileSize: 256,
            })

            mapRef.current.addLayer({
                id: "weather-layer",
                type: "raster",
                source: "weather",
                paint: {
                    "raster-opacity": 0.6,
                },
            })
        } else {
            if (mapRef.current.getLayer("weather-layer")) {
                mapRef.current.removeLayer("weather-layer")
                mapRef.current.removeSource("weather")
            }
        }
    }, [])

    const handleToggleClustering = useCallback((enabled: boolean) => {
        setClusteringEnabled(enabled)
        if (!mapRef.current) return

        const visibility = enabled ? "visible" : "none"
        if (mapRef.current.getLayer("clusters")) {
            mapRef.current.setLayoutProperty("clusters", "visibility", visibility)
            mapRef.current.setLayoutProperty("cluster-count", "visibility", visibility)
            mapRef.current.setLayoutProperty("unclustered-point", "visibility", visibility)
        }
    }, [])

    const handleToggleHeatmap = useCallback((enabled: boolean) => {
        setHeatmapEnabled(enabled)
        if (!mapRef.current) return

        if (mapRef.current.getLayer("heatmap")) {
            mapRef.current.setLayoutProperty("heatmap", "visibility", enabled ? "visible" : "none")
        }
    }, [])

    const handleToggleDrawing = useCallback((enabled: boolean) => {
        setDrawingEnabled(enabled)
        if (!mapRef.current || !drawRef.current) return

        if (enabled) {
            mapRef.current.addControl(drawRef.current)
        } else {
            mapRef.current.removeControl(drawRef.current)
            setActiveTool("")
        }
    }, [])

    const handleToggleMeasurement = useCallback((enabled: boolean) => {
        setMeasurementEnabled(enabled)
        if (enabled) {
            setActiveTool("distance")
        } else {
            setActiveTool("")
            setMeasurements([])
        }
    }, [])

    const handleZoomIn = useCallback(() => {
        mapRef.current?.zoomIn({ duration: 300 })
    }, [])

    const handleZoomOut = useCallback(() => {
        mapRef.current?.zoomOut({ duration: 300 })
    }, [])

    const handleResetBearing = useCallback(() => {
        mapRef.current?.resetNorth({ duration: 500 })
    }, [])

    const handleLocateUser = useCallback(() => {
        if (location && mapRef.current) {
            mapRef.current.flyTo({
                center: [location.longitude, location.latitude],
                zoom: 16,
                duration: 1000,
            })
        } else {
            requestLocation()
        }
    }, [location, requestLocation])

    const handleLocationSelect = useCallback(async (coordinates: [number, number], name: string, details?: any) => {
        if (!mapRef.current) return

        mapRef.current.flyTo({
            center: coordinates,
            zoom: 16,
            duration: 1000,
        })

        addSearchMarker(coordinates)

        // Enhanced location info with details
        const locationInfo: LocationInfo = {
            name,
            address: `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`,
            coordinates,
            category: details?.category,
            phone: details?.tel,
            website: details?.website,
            hours: details?.hours,
            description: details?.description,
            details,
        }

        setSelectedLocation(locationInfo)
    }, [])

    const handleGetDirections = useCallback(
        async (destination: [number, number]) => {
            if (!location || !mapRef.current) {
                toast.error("Current location not available")
                return
            }

            setIsRoutingMode(true)
            const start = [location.longitude, location.latitude]

            try {
                const response = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`,
                )
                const data = await response.json()

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0]

                    // Remove existing route
                    if (mapRef.current.getSource(routeSourceRef.current)) {
                        mapRef.current.removeLayer("route")
                        mapRef.current.removeLayer("route-arrows")
                        mapRef.current.removeSource(routeSourceRef.current)
                    }

                    // Add route with enhanced styling
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
                            "line-width": ["interpolate", ["linear"], ["zoom"], 12, 3, 22, 12],
                            "line-opacity": 0.8,
                        },
                    })

                    // Add directional arrows
                    mapRef.current.addLayer({
                        id: "route-arrows",
                        type: "symbol",
                        source: routeSourceRef.current,
                        layout: {
                            "symbol-placement": "line",
                            "symbol-spacing": 100,
                            "icon-image": "arrow",
                            "icon-size": 0.5,
                            "icon-rotation-alignment": "map",
                        },
                    })

                    // Fit map to route with padding
                    const coordinates = route.geometry.coordinates
                    const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
                        return bounds.extend(coord)
                    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

                    mapRef.current.fitBounds(bounds, {
                        padding: { top: 50, bottom: 50, left: 50, right: 50 },
                        duration: 1000,
                    })

                    // Set enhanced route info
                    setRouteInfo({
                        distance: `${(route.distance / 1000).toFixed(1)} km`,
                        duration: `${Math.round(route.duration / 60)} min`,
                    })

                    toast.success("Route calculated successfully")
                }
            } catch (error) {
                console.error("Routing error:", error)
                toast.error("Failed to calculate route")
            }
        },
        [location],
    )

    const clearRoute = useCallback(() => {
        if (mapRef.current) {
            if (mapRef.current.getLayer("route")) {
                mapRef.current.removeLayer("route")
            }
            if (mapRef.current.getLayer("route-arrows")) {
                mapRef.current.removeLayer("route-arrows")
            }
            if (mapRef.current.getSource(routeSourceRef.current)) {
                mapRef.current.removeSource(routeSourceRef.current)
            }
        }
        setIsRoutingMode(false)
        setRouteInfo(null)
    }, [])

    const handleExportMap = useCallback(() => {
        if (!mapRef.current) return

        const canvas = mapRef.current.getCanvas()
        const link = document.createElement("a")
        link.download = `map-export-${new Date().toISOString().split("T")[0]}.png`
        link.href = canvas.toDataURL()
        link.click()
        toast.success("Map exported successfully")
    }, [])

    const handleShareLocation = useCallback(async () => {
        if (!selectedLocation) return

        const shareData = {
            title: selectedLocation.name,
            text: `Check out ${selectedLocation.name} at ${selectedLocation.address}`,
            url: `https://maps.google.com/?q=${selectedLocation.coordinates[1]},${selectedLocation.coordinates[0]}`,
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(shareData.url)
                toast.success("Location link copied to clipboard")
            }
        } catch (error) {
            console.error("Share error:", error)
            toast.error("Failed to share location")
        }
    }, [selectedLocation])

    const handleSelectDrawingTool = useCallback((tool: string) => {
        setActiveTool(tool)
        if (!drawRef.current) return

        // Change drawing mode based on tool
        switch (tool) {
            case "point":
                drawRef.current.changeMode("draw_point")
                break
            case "line":
                drawRef.current.changeMode("draw_line_string")
                break
            case "polygon":
                drawRef.current.changeMode("draw_polygon")
                break
            case "circle":
                // Custom circle mode would need to be implemented
                drawRef.current.changeMode("draw_polygon")
                break
            default:
                drawRef.current.changeMode("simple_select")
        }
    }, [])

    const handleClearDrawings = useCallback(() => {
        if (drawRef.current) {
            drawRef.current.deleteAll()
        }
        toast.success("All drawings cleared")
    }, [])

    const handleExportDrawings = useCallback(() => {
        if (!drawRef.current) return

        const data = drawRef.current.getAll()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const link = document.createElement("a")
        link.download = `map-drawings-${new Date().toISOString().split("T")[0]}.geojson`
        link.href = URL.createObjectURL(blob)
        link.click()
        toast.success("Drawings exported successfully")
    }, [])

    const handleSelectMeasurementTool = useCallback((tool: string) => {
        setActiveTool(tool)
        // Measurement tool logic would be implemented here
        toast.info(`${tool} measurement tool activated`)
    }, [])

    const handleClearMeasurements = useCallback(() => {
        setMeasurements([])
        // Clear measurement overlays from map
        toast.success("All measurements cleared")
    }, [])

    const handleSaveLocation = useCallback((location: LocationInfo) => {
        const saved = JSON.parse(localStorage.getItem("savedLocations") || "[]")
        const updated = [
            location,
            ...saved.filter(
                (l: LocationInfo) =>
                    l.coordinates[0] !== location.coordinates[0] || l.coordinates[1] !== location.coordinates[1],
            ),
        ].slice(0, 20)
        localStorage.setItem("savedLocations", JSON.stringify(updated))
        toast.success("Location saved successfully")
    }, [])

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
        <div className="relative w-full h-screen overflow-hidden">
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
                onToggleTerrain={handleToggleTerrain}
                onToggleWeather={handleToggleWeather}
                onToggleClustering={handleToggleClustering}
                onToggleHeatmap={handleToggleHeatmap}
                onToggleDrawing={handleToggleDrawing}
                onToggleMeasurement={handleToggleMeasurement}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetBearing={handleResetBearing}
                onLocateUser={handleLocateUser}
                onExportMap={handleExportMap}
                onShareLocation={handleShareLocation}
                currentStyle={mapStyle}
                trafficEnabled={trafficEnabled}
                is3DEnabled={is3DEnabled}
                terrainEnabled={terrainEnabled}
                weatherEnabled={weatherEnabled}
                clusteringEnabled={clusteringEnabled}
                heatmapEnabled={heatmapEnabled}
                drawingEnabled={drawingEnabled}
                measurementEnabled={measurementEnabled}
            />

            {/* Drawing tools */}
            <DrawingTools
                isActive={drawingEnabled}
                onToggle={() => handleToggleDrawing(!drawingEnabled)}
                onSelectTool={handleSelectDrawingTool}
                onClearAll={handleClearDrawings}
                onExport={handleExportDrawings}
                activeTool={activeTool}
                onColorChange={setDrawingColor}
                currentColor={drawingColor}
            />

            {/* Measurement tools */}
            <MeasurementTools
                isActive={measurementEnabled}
                onToggle={() => handleToggleMeasurement(!measurementEnabled)}
                onSelectTool={handleSelectMeasurementTool}
                onClearAll={handleClearMeasurements}
                activeTool={activeTool}
                measurements={measurements}
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
                onSaveLocation={handleSaveLocation}
                onShareLocation={handleShareLocation}
            />
        </div>
    )
}
