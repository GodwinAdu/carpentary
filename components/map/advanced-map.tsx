"use client"

import "mapbox-gl/dist/mapbox-gl.css"
import mapboxgl from "mapbox-gl"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapControls } from "./map-controls"
import { MapSearch } from "./map-search"
import { LocationInfoPanel } from "./location-info-panel"
import { DrawingTools } from "./drawing-tools"
import { MeasurementTools } from "./measurement-tools"
import useCurrentLocation from "@/hooks/useCurrentLocation"
import { AlertCircle, Navigation, X, Cloud, CloudRain, Sun } from "lucide-react"
import { toast } from "sonner"

// Set your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""

interface LocationInfo {
    id: string
    imgUrlsArray: string[]
    coordinates: { lat: number, lng: number }
    buildingType: string
    description: string
    clientId: string
    place_name: string
    center: [number, number]
    status: string
    createdAt: Date,
    updatedAt: Date,
    place_type: string[],
    properties: {
        buildingType: string,
        status: string,
    },
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

    console.log(selectedLocation, "checking selected location")

    // Sample data for clustering and heatmap - realistic NYC locations
    const sampleLocations = [
        [-74.0059, 40.7128], // Times Square area
        [-74.0445, 40.6892], // Statue of Liberty area
        [-73.9857, 40.7484], // Empire State Building area
        [-73.9781, 40.7614], // Central Park area
        [-73.9442, 40.8176], // Yankee Stadium area
        [-73.9969, 40.7061], // Brooklyn Bridge area
        [-74.0134, 40.7045], // Wall Street area
        [-73.9735, 40.7505], // UN Headquarters area
        [-73.9903, 40.7359], // Flatiron Building area
        [-74.0061, 40.7589], // Lincoln Center area
        [-73.9626, 40.7794], // Metropolitan Museum area
        [-74.0094, 40.7505], // High Line area
        [-73.9876, 40.7661], // Columbus Circle area
        [-73.9857, 40.7282], // Madison Square Garden area
        [-74.0445, 40.7589], // Hudson River Park area
        [-73.9442, 40.8008], // Harlem area
        [-73.9903, 40.6892], // Red Hook area
        [-73.9735, 40.8176], // Bronx Zoo area
        [-74.0134, 40.6782], // Staten Island Ferry area
        [-73.9626, 40.7897], // Museum Mile area
    ]

    // Generate realistic heat map data with varying intensities
    const generateHeatmapData = () => {
        return {
            type: "FeatureCollection" as const,
            features: sampleLocations.map((coord, index) => ({
                type: "Feature" as const,
                properties: {
                    id: index,
                    name: `Location ${index + 1}`,
                    category: "sample",
                    intensity: Math.random() * 10 + 1, // Random intensity 1-11
                    mag: Math.random() * 6 + 1, // For heatmap weight
                },
                geometry: {
                    type: "Point" as const,
                    coordinates: coord,
                },
            })),
        }
    }

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
                // Add terrain source with proper configuration
                mapRef?.current?.addSource("mapbox-dem", {
                    type: "raster-dem",
                    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                    tileSize: 512,
                    maxzoom: 14,
                })

                // Add sky layer for 3D effect
                mapRef.current!.addLayer({
                    id: "sky",
                    type: "sky",
                    paint: {
                        "sky-type": "atmosphere",
                        "sky-atmosphere-sun": [0.0, 0.0],
                        "sky-atmosphere-sun-intensity": 15,
                    },
                })

                // Add 3D buildings layer with enhanced styling
                if (!mapRef.current!.getLayer("3d-buildings")) {
                    mapRef.current!.addLayer({
                        id: "3d-buildings",
                        source: "composite",
                        "source-layer": "building",
                        filter: ["==", "extrude", "true"],
                        type: "fill-extrusion",
                        minzoom: 15,
                        paint: {
                            "fill-extrusion-color": [
                                "interpolate",
                                ["linear"],
                                ["get", "height"],
                                0,
                                "#e2e8f0",
                                50,
                                "#cbd5e1",
                                100,
                                "#94a3b8",
                                200,
                                "#64748b",
                            ],
                            "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
                            "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
                            "fill-extrusion-opacity": 0.8,
                        },
                        layout: {
                            visibility: "none",
                        },
                    })
                }

                // Add sample data for clustering with realistic data
                mapRef.current!.addSource("sample-points", {
                    type: "geojson",
                    data: generateHeatmapData(),
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 50,
                })

                // Add cluster layers with enhanced styling
                mapRef.current!.addLayer({
                    id: "clusters",
                    type: "circle",
                    source: "sample-points",
                    filter: ["has", "point_count"],
                    paint: {
                        "circle-color": ["step", ["get", "point_count"], "#51bbd6", 10, "#f1f075", 30, "#f28cb1"],
                        "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#fff",
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
                    paint: {
                        "text-color": "#ffffff",
                    },
                })

                mapRef.current!.addLayer({
                    id: "unclustered-point",
                    type: "circle",
                    source: "sample-points",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        "circle-color": "#11b4da",
                        "circle-radius": 6,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#fff",
                    },
                    layout: {
                        visibility: "none",
                    },
                })

                // Add enhanced heatmap layer
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

                // Add weather layers (precipitation, clouds, temperature)
                mapRef.current!.addSource("weather-precipitation", {
                    type: "raster",
                    tiles: [
                        "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHER_API_KEY",
                    ],
                    tileSize: 256,
                })

                mapRef.current!.addSource("weather-clouds", {
                    type: "raster",
                    tiles: ["https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHER_API_KEY"],
                    tileSize: 256,
                })

                mapRef.current!.addSource("weather-temperature", {
                    type: "raster",
                    tiles: ["https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHER_API_KEY"],
                    tileSize: 256,
                })

                // Add weather layers (initially hidden)
                mapRef.current!.addLayer({
                    id: "weather-precipitation",
                    type: "raster",
                    source: "weather-precipitation",
                    paint: {
                        "raster-opacity": 0.6,
                    },
                    layout: {
                        visibility: "none",
                    },
                })

                mapRef.current!.addLayer({
                    id: "weather-clouds",
                    type: "raster",
                    source: "weather-clouds",
                    paint: {
                        "raster-opacity": 0.4,
                    },
                    layout: {
                        visibility: "none",
                    },
                })

                mapRef.current!.addLayer({
                    id: "weather-temperature",
                    type: "raster",
                    source: "weather-temperature",
                    paint: {
                        "raster-opacity": 0.5,
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
                                if (zoom != null) {
                                    mapRef.current!.easeTo({
                                        center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
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
    const handleStyleChange = useCallback(
        (style: string) => {
            setMapStyle(style)
            if (mapRef.current) {
                mapRef.current.setStyle(style)

                // For satellite styles, ensure high-resolution imagery
                if (style.includes("satellite")) {
                    mapRef.current.on("styledata", () => {
                        // Re-add all custom layers after style change
                        setTimeout(() => {
                            if (mapRef.current && mapRef.current.isStyleLoaded()) {
                                // Re-add sources and layers that were removed by style change
                                handleToggleTraffic(trafficEnabled)
                                handleToggle3D(is3DEnabled)
                                handleToggleTerrain(terrainEnabled)
                                handleToggleWeather(weatherEnabled)
                                handleToggleClustering(clusteringEnabled)
                                handleToggleHeatmap(heatmapEnabled)
                            }
                        }, 1000)
                    })
                }
            }
        },
        [trafficEnabled, is3DEnabled, terrainEnabled, weatherEnabled, clusteringEnabled, heatmapEnabled],
    )

    const handleToggleTraffic = useCallback((enabled: boolean) => {
        setTrafficEnabled(enabled)
        if (!mapRef.current) return

        if (enabled) {
            if (!mapRef.current.getSource("mapbox-traffic")) {
                mapRef.current.addSource("mapbox-traffic", {
                    type: "vector",
                    url: "mapbox://mapbox.mapbox-traffic-v1",
                })
            }

            if (!mapRef.current.getLayer("traffic")) {
                mapRef.current.addLayer({
                    id: "traffic",
                    type: "line",
                    source: "mapbox-traffic",
                    "source-layer": "traffic",
                    paint: {
                        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 18, 6],
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
                        "line-opacity": 0.8,
                    },
                })
            }
            toast.success("Traffic layer enabled")
        } else {
            if (mapRef.current.getLayer("traffic")) {
                mapRef.current.removeLayer("traffic")
            }
            if (mapRef.current.getSource("mapbox-traffic")) {
                mapRef.current.removeSource("mapbox-traffic")
            }
            toast.success("Traffic layer disabled")
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
            toast.success(`3D Buildings ${enabled ? "enabled" : "disabled"}`)
        }
    }, [])

    const handleToggleTerrain = useCallback((enabled: boolean) => {
        setTerrainEnabled(enabled)
        if (!mapRef.current) return

        if (enabled) {
            if (mapRef.current.getSource("mapbox-dem")) {
                mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })
                toast.success("3D Terrain enabled")
            }
        } else {
            mapRef.current.setTerrain(null)
            toast.success("3D Terrain disabled")
        }
    }, [])

    const handleToggleWeather = useCallback((enabled: boolean) => {
        setWeatherEnabled(enabled)
        if (!mapRef.current) return

        const layers = ["weather-precipitation", "weather-clouds", "weather-temperature"]

        layers.forEach((layerId) => {
            if (mapRef.current!.getLayer(layerId)) {
                mapRef.current!.setLayoutProperty(layerId, "visibility", enabled ? "visible" : "none")
            }
        })

        toast.success(`Weather layers ${enabled ? "enabled" : "disabled"}`)
    }, [])

    const handleToggleClustering = useCallback((enabled: boolean) => {
        setClusteringEnabled(enabled)
        if (!mapRef.current) return

        const visibility = enabled ? "visible" : "none"
        const layers = ["clusters", "cluster-count", "unclustered-point"]

        layers.forEach((layerId) => {
            if (mapRef.current!.getLayer(layerId)) {
                mapRef.current!.setLayoutProperty(layerId, "visibility", visibility)
            }
        })

        toast.success(`Clustering ${enabled ? "enabled" : "disabled"}`)
    }, [])

    const handleToggleHeatmap = useCallback((enabled: boolean) => {
        setHeatmapEnabled(enabled)
        if (!mapRef.current) return

        if (mapRef.current.getLayer("heatmap")) {
            mapRef.current.setLayoutProperty("heatmap", "visibility", enabled ? "visible" : "none")
            toast.success(`Heat map ${enabled ? "enabled" : "disabled"}`)
        }
    }, [])

    const handleToggleDrawing = useCallback((enabled: boolean) => {
        setDrawingEnabled(enabled)
        if (!mapRef.current || !drawRef.current) return

        if (enabled) {
            mapRef.current.addControl(drawRef.current)
            toast.success("Drawing tools enabled")
        } else {
            mapRef.current.removeControl(drawRef.current)
            setActiveTool("")
            toast.success("Drawing tools disabled")
        }
    }, [])

    const handleToggleMeasurement = useCallback((enabled: boolean) => {
        setMeasurementEnabled(enabled)
        if (enabled) {
            setActiveTool("distance")
            toast.success("Measurement tools enabled")
        } else {
            setActiveTool("")
            setMeasurements([])
            toast.success("Measurement tools disabled")
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

    const handleLocationSelect = useCallback(async (coordinates: [number, number], name: string, details?: Record<string, unknown>) => {
        if (!mapRef.current) return

        mapRef.current.flyTo({
            center: coordinates,
            zoom: 16,
            duration: 1000,
        })

        addSearchMarker(coordinates)

        // Enhanced location info with details
        const locationInfo: LocationInfo = {
            // buildingType,
            address: `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`,
            coordinates,
            category: typeof details?.category === "string" ? details.category : undefined,
            phone: typeof details?.tel === "string" ? details.tel : undefined,
            website: typeof details?.website === "string" ? details.website : undefined,
            hours: typeof details?.hours === "string" ? details.hours : undefined,
            description: typeof details?.description === "string" ? details.description : undefined,
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

                    // Add route source
                    mapRef.current.addSource(routeSourceRef.current, {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            properties: {},
                            geometry: route.geometry,
                        },
                    })

                    // Add route layer with enhanced styling
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
                            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 4, 18, 12],
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
                            "icon-size": 0.8,
                            "icon-rotation-alignment": "map",
                            "icon-allow-overlap": true,
                        },
                    })

                    // Fit map to route
                    const coordinates = route.geometry.coordinates
                    const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
                        return bounds.extend(coord)
                    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

                    mapRef.current.fitBounds(bounds, {
                        padding: 50,
                        duration: 1000,
                    })

                    // Set route info
                    const distance = (route.distance / 1000).toFixed(1) + " km"
                    const duration = Math.round(route.duration / 60) + " min"
                    setRouteInfo({ distance, duration })

                    toast.success(`Route found: ${distance}, ${duration}`)
                }
            } catch (error) {
                console.error("Routing error:", error)
                toast.error("Failed to get directions")
            }
        },
        [location],
    )

    const handleClearRoute = useCallback(() => {
        if (!mapRef.current) return

        if (mapRef.current.getSource(routeSourceRef.current)) {
            mapRef.current.removeLayer("route")
            mapRef.current.removeLayer("route-arrows")
            mapRef.current.removeSource(routeSourceRef.current)
        }

        setIsRoutingMode(false)
        setRouteInfo(null)
        toast.success("Route cleared")
    }, [])

    // Drawing tool handlers
    const handleSelectDrawingTool = useCallback((tool: string) => {
        setActiveTool(tool)
        if (!drawRef.current) return

        drawRef.current.changeMode(`draw_${tool}`)
        toast.success(`${tool} tool selected`)
    }, [])

    const handleClearDrawings = useCallback(() => {
        if (!drawRef.current) return
        drawRef.current.deleteAll()
        toast.success("All drawings cleared")
    }, [])

    const handleExportDrawings = useCallback(() => {
        if (!drawRef.current) return

        const data = drawRef.current.getAll()
        const dataStr = JSON.stringify(data, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = "map-drawings.geojson"
        link.click()
        URL.revokeObjectURL(url)
        toast.success("Drawings exported")
    }, [])

    const handleDrawingColorChange = useCallback((color: string) => {
        setDrawingColor(color)
        // Update drawing styles would require re-initializing the draw control
        // For now, new drawings will use the new color
    }, [])

    // Measurement tool handlers
    const handleSelectMeasurementTool = useCallback((tool: string) => {
        setActiveTool(tool)
        toast.success(`${tool} measurement selected`)
    }, [])

    const handleClearMeasurements = useCallback(() => {
        setMeasurements([])
        // Clear measurement overlays from map
        toast.success("Measurements cleared")
    }, [])

    // Export map as image
    const handleExportMap = useCallback(() => {
        if (!mapRef.current) return

        const canvas = mapRef.current.getCanvas()
        const link = document.createElement("a")
        link.download = "map-export.png"
        link.href = canvas.toDataURL()
        link.click()
        toast.success("Map exported as image")
    }, [])

    // Share location
    const handleShareLocation = useCallback(() => {
        if (!selectedLocation) return

        const url = `https://maps.google.com/?q=${selectedLocation.coordinates[1]},${selectedLocation.coordinates[0]}`

        if (navigator.share) {
            navigator.share({
                title: selectedLocation.buildingType,
                text: `Check out this location: ${selectedLocation.buildingType}`,
                url: url,
            })
        } else {
            navigator.clipboard.writeText(url)
            toast.success("Location URL copied to clipboard")
        }
    }, [selectedLocation]);

    // Handle client actions
    const handleCall = useCallback((clientId: string) => {
        // Implement call functionality
        toast.info(`Calling client: ${clientId}`)
    }, [])

    const handleEmail = useCallback((clientId: string) => {
        // Implement email functionality
        toast.info(`Emailing client: ${clientId}`)
    }, [])

    if (!mapboxgl.accessToken) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please set your Mapbox access token in the environment variables (NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN).
                    </AlertDescription>
                </Alert>
            </div>
        )
    }



    return (
        <div className="relative h-screen w-full">
            <div ref={mapContainer} className="h-full w-full" />

            {/* Map Controls */}
            <MapControls
                mapStyle={mapStyle}
                onStyleChange={handleStyleChange}
                trafficEnabled={trafficEnabled}
                onToggleTraffic={handleToggleTraffic}
                is3DEnabled={is3DEnabled}
                onToggle3D={handleToggle3D}
                terrainEnabled={terrainEnabled}
                onToggleTerrain={handleToggleTerrain}
                weatherEnabled={weatherEnabled}
                onToggleWeather={handleToggleWeather}
                clusteringEnabled={clusteringEnabled}
                onToggleClustering={handleToggleClustering}
                heatmapEnabled={heatmapEnabled}
                onToggleHeatmap={handleToggleHeatmap}
                drawingEnabled={drawingEnabled}
                onToggleDrawing={handleToggleDrawing}
                measurementEnabled={measurementEnabled}
                onToggleMeasurement={handleToggleMeasurement}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetBearing={handleResetBearing}
                onLocateUser={handleLocateUser}
                onExportMap={handleExportMap}
                userLocation={location}
                isLoading={loading}
            />

            {/* Search */}
            <MapSearch onLocationSelect={handleLocationSelect} />

            {/* Location Info Panel */}
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
                onShareLocation={handleShareLocation}
                onCall={handleCall}
                onEmail={handleEmail}
            />

            {/* Drawing Tools */}
            <DrawingTools
                isActive={drawingEnabled}
                onToggle={() => handleToggleDrawing(!drawingEnabled)}
                onSelectTool={handleSelectDrawingTool}
                onClearAll={handleClearDrawings}
                onExport={handleExportDrawings}
                activeTool={activeTool}
                onColorChange={handleDrawingColorChange}
                currentColor={drawingColor}
            />

            {/* Measurement Tools */}
            <MeasurementTools
                isActive={measurementEnabled}
                onToggle={() => handleToggleMeasurement(!measurementEnabled)}
                onSelectTool={handleSelectMeasurementTool}
                onClearAll={handleClearMeasurements}
                activeTool={activeTool}
                measurements={measurements}
            />

            {/* Route Info */}
            {isRoutingMode && routeInfo && (
                <Card className="absolute top-20 left-4 z-10 p-3">
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-2">
                            <Navigation className="h-4 w-4 text-blue-600" />
                            <div className="text-sm">
                                <div className="font-medium">{routeInfo.distance}</div>
                                <div className="text-muted-foreground">{routeInfo.duration}</div>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={handleClearRoute}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            )}

            {/* Location Error */}
            {error && (
                <Alert className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Weather Legend */}
            {weatherEnabled && (
                <Card className="absolute top-4 right-80 z-10 p-3">
                    <div className="space-y-2">
                        <div className="text-sm font-medium flex items-center space-x-2">
                            <Cloud className="h-4 w-4" />
                            <span>Weather Layers</span>
                        </div>
                        <div className="space-y-1 text-xs">
                            <div className="flex items-center space-x-2">
                                <CloudRain className="h-3 w-3 text-blue-500" />
                                <span>Precipitation</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Cloud className="h-3 w-3 text-gray-500" />
                                <span>Cloud Cover</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Sun className="h-3 w-3 text-orange-500" />
                                <span>Temperature</span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
