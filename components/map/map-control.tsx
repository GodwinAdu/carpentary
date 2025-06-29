"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Navigation, Layers, Satellite, MapIcon, Navigation2, ZoomIn, ZoomOut, RotateCcw, Locate } from "lucide-react"

interface MapControlsProps {
    onStyleChange: (style: string) => void
    onToggleTraffic: (enabled: boolean) => void
    onToggle3D: (enabled: boolean) => void
    onZoomIn: () => void
    onZoomOut: () => void
    onResetBearing: () => void
    onLocateUser: () => void
    currentStyle: string
    trafficEnabled: boolean
    is3DEnabled: boolean
}

const mapStyles = [
    { value: "mapbox://styles/mapbox/streets-v12", label: "Streets", icon: MapIcon },
    { value: "mapbox://styles/mapbox/satellite-streets-v12", label: "Satellite", icon: Satellite },
    { value: "mapbox://styles/mapbox/light-v11", label: "Light", icon: Layers },
    { value: "mapbox://styles/mapbox/dark-v11", label: "Dark", icon: Layers },
    { value: "mapbox://styles/mapbox/outdoors-v12", label: "Outdoors", icon: Navigation },
    { value: "mapbox://styles/mapbox/navigation-day-v1", label: "Navigation", icon: Navigation2 },
]

export function MapControls({
    onStyleChange,
    onToggleTraffic,
    onToggle3D,
    onZoomIn,
    onZoomOut,
    onResetBearing,
    onLocateUser,
    currentStyle,
    trafficEnabled,
    is3DEnabled,
}: MapControlsProps) {
    return (
        <div className="absolute top-4 right-4 z-10 space-y-2">
            {/* Zoom Controls */}
            <Card className="p-2">
                <div className="flex flex-col space-y-1">
                    <Button size="sm" variant="ghost" onClick={onZoomIn}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onZoomOut}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onResetBearing}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onLocateUser}>
                        <Locate className="h-4 w-4" />
                    </Button>
                </div>
            </Card>

            {/* Map Style Selector */}
            <Card className="p-3">
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Map Style</Label>
                    <Select value={currentStyle} onValueChange={onStyleChange}>
                        <SelectTrigger className="w-32">
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
                    </div>
                </div>
            </Card>
        </div>
    )
}
