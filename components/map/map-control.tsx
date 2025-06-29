"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Navigation,
    Layers,
    Satellite,
    MapIcon,
    Navigation2,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Locate,
    Ruler,
    Edit3,
    Download,
    Share2,
} from "lucide-react"

interface MapControlsProps {
    onStyleChange: (style: string) => void
    onToggleTraffic: (enabled: boolean) => void
    onToggle3D: (enabled: boolean) => void
    onToggleTerrain: (enabled: boolean) => void
    onToggleWeather: (enabled: boolean) => void
    onToggleClustering: (enabled: boolean) => void
    onToggleHeatmap: (enabled: boolean) => void
    onToggleDrawing: (enabled: boolean) => void
    onToggleMeasurement: (enabled: boolean) => void
    onZoomIn: () => void
    onZoomOut: () => void
    onResetBearing: () => void
    onLocateUser: () => void
    onExportMap: () => void
    onShareLocation: () => void
    currentStyle: string
    trafficEnabled: boolean
    is3DEnabled: boolean
    terrainEnabled: boolean
    weatherEnabled: boolean
    clusteringEnabled: boolean
    heatmapEnabled: boolean
    drawingEnabled: boolean
    measurementEnabled: boolean
}

const mapStyles = [
    { value: "mapbox://styles/mapbox/streets-v12", label: "Streets", icon: MapIcon },
    { value: "mapbox://styles/mapbox/satellite-streets-v12", label: "Satellite", icon: Satellite },
    { value: "mapbox://styles/mapbox/satellite-v9", label: "Satellite HD", icon: Satellite },
    { value: "mapbox://styles/mapbox/light-v11", label: "Light", icon: Layers },
    { value: "mapbox://styles/mapbox/dark-v11", label: "Dark", icon: Layers },
    { value: "mapbox://styles/mapbox/outdoors-v12", label: "Outdoors", icon: Navigation },
    { value: "mapbox://styles/mapbox/navigation-day-v1", label: "Navigation", icon: Navigation2 },
]

export function MapControls({
    onStyleChange,
    onToggleTraffic,
    onToggle3D,
    onToggleTerrain,
    onToggleWeather,
    onToggleClustering,
    onToggleHeatmap,
    onToggleDrawing,
    onToggleMeasurement,
    onZoomIn,
    onZoomOut,
    onResetBearing,
    onLocateUser,
    onExportMap,
    onShareLocation,
    currentStyle,
    trafficEnabled,
    is3DEnabled,
    terrainEnabled,
    weatherEnabled,
    clusteringEnabled,
    heatmapEnabled,
    drawingEnabled,
    measurementEnabled,
}: MapControlsProps) {
    return (
        <div className="absolute top-4 right-4 z-10 space-y-2 max-h-[calc(100vh-2rem)] overflow-y-auto">
            {/* Zoom Controls */}
            <Card className="p-2">
                <div className="flex flex-col space-y-1">
                    <Button size="sm" variant="ghost" onClick={onZoomIn} title="Zoom In">
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onZoomOut} title="Zoom Out">
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onResetBearing} title="Reset North">
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onLocateUser} title="My Location">
                        <Locate className="h-4 w-4" />
                    </Button>
                </div>
            </Card>

            {/* Map Style Selector */}
            <Card className="p-3">
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Map Style</Label>
                    <Select value={currentStyle} onValueChange={onStyleChange}>
                        <SelectTrigger className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {mapStyles.map((style) => (
                                <SelectItem key={style.value} value={style.value}>
                                    <div className="flex items-center space-x-2">
                                        <style.icon className="h-4 w-4" />
                                        <span>{style.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Layer Controls */}
            <Card className="p-3">
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Layers</Label>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="traffic" className="text-sm">
                                Traffic
                            </Label>
                            <Switch id="traffic" checked={trafficEnabled} onCheckedChange={onToggleTraffic} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="3d" className="text-sm">
                                3D Buildings
                            </Label>
                            <Switch id="3d" checked={is3DEnabled} onCheckedChange={onToggle3D} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="terrain" className="text-sm">
                                Terrain
                            </Label>
                            <Switch id="terrain" checked={terrainEnabled} onCheckedChange={onToggleTerrain} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="weather" className="text-sm">
                                Weather
                            </Label>
                            <Switch id="weather" checked={weatherEnabled} onCheckedChange={onToggleWeather} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Advanced Features */}
            <Card className="p-3">
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Advanced</Label>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="clustering" className="text-sm">
                                Clustering
                            </Label>
                            <Switch id="clustering" checked={clusteringEnabled} onCheckedChange={onToggleClustering} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="heatmap" className="text-sm">
                                Heat Map
                            </Label>
                            <Switch id="heatmap" checked={heatmapEnabled} onCheckedChange={onToggleHeatmap} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tools */}
            <Card className="p-2">
                <div className="space-y-2">
                    <Label className="text-sm font-medium px-2">Tools</Label>
                    <div className="flex flex-col space-y-1">
                        <Button
                            size="sm"
                            variant={drawingEnabled ? "default" : "ghost"}
                            onClick={() => onToggleDrawing(!drawingEnabled)}
                            className="justify-start"
                        >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Draw
                        </Button>
                        <Button
                            size="sm"
                            variant={measurementEnabled ? "default" : "ghost"}
                            onClick={() => onToggleMeasurement(!measurementEnabled)}
                            className="justify-start"
                        >
                            <Ruler className="h-4 w-4 mr-2" />
                            Measure
                        </Button>
                        <Separator />
                        <Button size="sm" variant="ghost" onClick={onExportMap} className="justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button size="sm" variant="ghost" onClick={onShareLocation} className="justify-start">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
