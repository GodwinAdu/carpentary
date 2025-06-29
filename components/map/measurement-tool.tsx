"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Ruler, Square, Trash2, X } from "lucide-react"

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
        <Card className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 p-3">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Measurement Tools</Label>
                    <Button size="sm" variant="ghost" onClick={onToggle}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant={activeTool === "distance" ? "default" : "ghost"}
                        onClick={() => onSelectTool("distance")}
                    >
                        <Ruler className="h-4 w-4 mr-2" />
                        Distance
                    </Button>
                    <Button size="sm" variant={activeTool === "area" ? "default" : "ghost"} onClick={() => onSelectTool("area")}>
                        <Square className="h-4 w-4 mr-2" />
                        Area
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onClearAll}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                {measurements.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Results:</Label>
                            {measurements.map((measurement, index) => (
                                <div key={index} className="text-sm">
                                    <span className="capitalize">{measurement.type}:</span>{" "}
                                    <span className="font-medium">
                                        {measurement.value} {measurement.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Card>
    )
}
