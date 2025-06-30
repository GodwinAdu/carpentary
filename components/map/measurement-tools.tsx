"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Ruler, Square, Trash2, X, MapPin } from "lucide-react"

interface MeasurementToolsProps {
    isActive: boolean
    onToggle: () => void
    onSelectTool: (tool: string) => void
    onClearAll: () => void
    activeTool: string
    measurements: Array<{
        type: string
        value: string
        unit: string
    }>
}

const measurementTools = [
    { id: "distance", label: "Distance", icon: Ruler, description: "Measure distance between points" },
    { id: "area", label: "Area", icon: Square, description: "Measure area of a polygon" },
    { id: "elevation", label: "Elevation", icon: MapPin, description: "Get elevation at a point" },
]

export function MeasurementTools({
    isActive,
    onToggle,
    onSelectTool,
    onClearAll,
    activeTool,
    measurements,
}: MeasurementToolsProps) {
    if (!isActive) return null

    return (
        <Card className="absolute bottom-20 right-4 z-10 p-3 w-64">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Ruler className="h-4 w-4" />
                        <Label className="text-sm font-medium">Measurement Tools</Label>
                    </div>
                    <Button size="sm" variant="ghost" onClick={onToggle} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                    </Button>
                </div>

                <Separator />

                {/* Measurement Tools */}
                <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Tools</Label>
                    <div className="space-y-2">
                        {measurementTools.map((tool) => (
                            <Button
                                key={tool.id}
                                size="sm"
                                variant={activeTool === tool.id ? "default" : "outline"}
                                onClick={() => onSelectTool(tool.id)}
                                className="w-full justify-start"
                            >
                                <tool.icon className="h-4 w-4 mr-2" />
                                <div className="text-left">
                                    <div>{tool.label}</div>
                                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Measurements Results */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">Results</Label>
                        {measurements.length > 0 && (
                            <Button size="sm" variant="ghost" onClick={onClearAll} className="h-6 text-xs">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>

                    {measurements.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-4">No measurements yet</div>
                    ) : (
                        <ScrollArea className="max-h-32">
                            <div className="space-y-2">
                                {measurements.map((measurement, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                        <div className="text-sm">
                                            <div className="font-medium capitalize">{measurement.type}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {measurement.value} {measurement.unit}
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            #{index + 1}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* Instructions */}
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <strong>Instructions:</strong>
                    <ul className="mt-1 space-y-1">
                        <li>• Distance: Click two or more points</li>
                        <li>• Area: Click to create polygon, double-click to finish</li>
                        <li>• Elevation: Click any point on the map</li>
                        <li>• Press Escape to cancel measurement</li>
                    </ul>
                </div>
            </div>
        </Card>
    )
}
