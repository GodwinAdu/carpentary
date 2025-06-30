"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Map,
    Satellite,
    Layers,
    ZoomIn,
    ZoomOut,
    Compass,
    MapPin,
    Download,
    Car,
    Mountain,
    Cloud,
    Zap,
    Activity,
    Edit3,
    Ruler,
    Building,
    TreePine,
    Globe,
    X,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { useState } from "react"

interface LocationData {
    latitude: number
    longitude: number
    accuracy: number
    altitude?: number | null
    altitudeAccuracy?: number | null
    heading?: number | null
    speed?: number | null
    timestamp: number
}

interface MapControlsProps {
    mapStyle: string
    onStyleChange: (style: string) => void
    trafficEnabled: boolean
    onToggleTraffic: (enabled: boolean) => void
    is3DEnabled: boolean
    onToggle3D: (enabled: boolean) => void
    terrainEnabled: boolean
    onToggleTerrain: (enabled: boolean) => void
    weatherEnabled: boolean
    onToggleWeather: (enabled: boolean) => void
    clusteringEnabled: boolean
    onToggleClustering: (enabled: boolean) => void
    heatmapEnabled: boolean
    onToggleHeatmap: (enabled: boolean) => void
    drawingEnabled: boolean
    onToggleDrawing: (enabled: boolean) => void
    measurementEnabled: boolean
    onToggleMeasurement: (enabled: boolean) => void
    onZoomIn: () => void
    onZoomOut: () => void
    onResetBearing: () => void
    onLocateUser: () => void
    onExportMap: () => void
    userLocation: LocationData | null
    isLoading: boolean
}

const mapStyles = [
    {
        id: "mapbox://styles/mapbox/satellite-v9",
        name: "Satellite",
        icon: Satellite,
        description: "High-resolution satellite imagery",
    },
    {
        id: "mapbox://styles/mapbox/satellite-streets-v12",
        name: "Hybrid",
        icon: Globe,
        description: "Satellite with street labels",
    },
    {
        id: "mapbox://styles/mapbox/streets-v12",
        name: "Streets",
        icon: Map,
        description: "Detailed street map",
    },
    {
        id: "mapbox://styles/mapbox/outdoors-v12",
        name: "Outdoors",
        icon: TreePine,
        description: "Topographic outdoor map",
    },
    {
        id: "mapbox://styles/mapbox/light-v11",
        name: "Light",
        icon: Map,
        description: "Clean light theme",
    },
    {
        id: "mapbox://styles/mapbox/dark-v11",
        name: "Dark",
        icon: Map,
        description: "Dark theme map",
    },
]

export function MapControls({
    mapStyle,
    onStyleChange,
    trafficEnabled,
    onToggleTraffic,
    is3DEnabled,
    onToggle3D,
    terrainEnabled,
    onToggleTerrain,
    weatherEnabled,
    onToggleWeather,
    clusteringEnabled,
    onToggleClustering,
    heatmapEnabled,
    onToggleHeatmap,
    drawingEnabled,
    onToggleDrawing,
    measurementEnabled,
    onToggleMeasurement,
    onZoomIn,
    onZoomOut,
    onResetBearing,
    onLocateUser,
    onExportMap,
    userLocation,
    isLoading,
}: MapControlsProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [activeSection, setActiveSection] = useState<string | null>(null)

    const currentStyle = mapStyles.find((style) => style.id === mapStyle)

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section)
    }

    return (
        <div className="absolute top-4 right-4 z-10 space-y-2">
            {/* Main Controls Card */}
            <Card className={`transition-all duration-300 ${isExpanded ? "w-80" : "w-16"}`}>
                <div className="p-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        {isExpanded && (
                            <div className="flex items-center space-x-2">
                                <Layers className="h-4 w-4" />
                                <Label className="text-sm font-medium">Map Controls</Label>
                            </div>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
                            {isExpanded ? <X className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                        </Button>
                    </div>

                    {isExpanded && (
                        <ScrollArea className="max-h-96">
                            <div className="space-y-4">
                                {/* Map Styles */}
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleSection("styles")}
                                        className="w-full justify-between p-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            {currentStyle?.icon && <currentStyle.icon className="h-4 w-4" />}
                                            <span className="text-sm">Map Style</span>
                                        </div>
                                        {activeSection === "styles" ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>

                                    {activeSection === "styles" && (
                                        <div className="mt-2 space-y-2">
                                            {mapStyles.map((style) => (
                                                <Button
                                                    key={style.id}
                                                    size="sm"
                                                    variant={mapStyle === style.id ? "default" : "outline"}
                                                    onClick={() => onStyleChange(style.id)}
                                                    className="w-full justify-start"
                                                >
                                                    <style.icon className="h-4 w-4 mr-2" />
                                                    <div className="text-left">
                                                        <div>{style.name}</div>
                                                        <div className="text-xs text-muted-foreground">{style.description}</div>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Layer Controls */}
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleSection("layers")}
                                        className="w-full justify-between p-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Layers className="h-4 w-4" />
                                            <span className="text-sm">Layers</span>
                                        </div>
                                        {activeSection === "layers" ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>

                                    {activeSection === "layers" && (
                                        <div className="mt-2 space-y-3">
                                            {/* Traffic */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Car className="h-4 w-4 text-muted-foreground" />
                                                    <Label className="text-sm">Traffic</Label>
                                                    {trafficEnabled && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            ON
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Switch checked={trafficEnabled} onCheckedChange={onToggleTraffic} />
                                            </div>

                                            {/* 3D Buildings */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Building className="h-4 w-4 text-muted-foreground" />
                                                    <Label className="text-sm">3D Buildings</Label>
                                                    {is3DEnabled && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            ON
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Switch checked={is3DEnabled} onCheckedChange={onToggle3D} />
                                            </div>

                                            {/* Terrain */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Mountain className="h-4 w-4 text-muted-foreground" />
                                                    <Label className="text-sm">3D Terrain</Label>
                                                    {terrainEnabled && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            ON
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Switch checked={terrainEnabled} onCheckedChange={onToggleTerrain} />
                                            </div>

                                            {/* Weather */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Cloud className="h-4 w-4 text-muted-foreground" />
                                                    <Label className="text-sm">Weather</Label>
                                                    {weatherEnabled && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            ON
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Switch checked={weatherEnabled} onCheckedChange={onToggleWeather} />
                                            </div>

                                            {/* Clustering */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Zap className="h-4 w-4 text-muted-foreground" />
                                                    <Label className="text-sm">Clustering</Label>
                                                    {clusteringEnabled && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            ON
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Switch checked={clusteringEnabled} onCheckedChange={onToggleClustering} />
                                            </div>

                                            {/* Heatmap */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                                    <Label className="text-sm">Heat Map</Label>
                                                    {heatmapEnabled && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            ON
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Switch checked={heatmapEnabled} onCheckedChange={onToggleHeatmap} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Tools */}
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleSection("tools")}
                                        className="w-full justify-between p-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Edit3 className="h-4 w-4" />
                                            <span className="text-sm">Tools</span>
                                        </div>
                                        {activeSection === "tools" ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>

                                    {activeSection === "tools" && (
                                        <div className="mt-2 space-y-3">
                                            {/* Drawing Tools */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Edit3 className="h-4 w-4 text-muted-foreground" />
                                                    <Label className="text-sm">Drawing</Label>
                                                    {drawingEnabled && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            ON
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Switch checked={drawingEnabled} onCheckedChange={onToggleDrawing} />
                                            </div>

                                            {/* Measurement Tools */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Ruler className="h-4 w-4 text-muted-foreground" />
                                                    <Label className="text-sm">Measurement</Label>
                                                    {measurementEnabled && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            ON
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Switch checked={measurementEnabled} onCheckedChange={onToggleMeasurement} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Location Info */}
                                {userLocation && (
                                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                        <div className="font-medium mb-1">Your Location</div>
                                        <div>Lat: {userLocation.latitude.toFixed(6)}</div>
                                        <div>Lng: {userLocation.longitude.toFixed(6)}</div>
                                        <div>Accuracy: {userLocation.accuracy}m</div>
                                        {userLocation.speed && <div>Speed: {(userLocation.speed * 3.6).toFixed(1)} km/h</div>}
                                        {userLocation.heading && <div>Heading: {userLocation.heading.toFixed(0)}°</div>}
                                    </div>
                                )}

                                {/* Export */}
                                <Button onClick={onExportMap} size="sm" variant="outline" className="w-full bg-transparent">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Map
                                </Button>
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </Card>

            {/* Quick Action Buttons */}
            <div className="flex flex-col space-y-2">
                {/* Zoom Controls */}
                <Card className="p-2">
                    <div className="flex flex-col space-y-1">
                        <Button size="sm" variant="outline" onClick={onZoomIn} className="h-8 w-8 p-0 bg-transparent">
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={onZoomOut} className="h-8 w-8 p-0 bg-transparent">
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>

                {/* Navigation Controls */}
                <Card className="p-2">
                    <div className="flex flex-col space-y-1">
                        <Button size="sm" variant="outline" onClick={onResetBearing} className="h-8 w-8 p-0 bg-transparent">
                            <Compass className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onLocateUser}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 bg-transparent"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            ) : (
                                <MapPin className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
