"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Edit3, Circle, Square, Minus, MapPin, Trash2, Download, Palette, X } from "lucide-react"

interface DrawingToolsProps {
    isActive: boolean
    onToggle: () => void
    onSelectTool: (tool: string) => void
    onClearAll: () => void
    onExport: () => void
    activeTool: string
    onColorChange: (color: string) => void
    currentColor: string
}

const drawingTools = [
    { id: "point", label: "Point", icon: MapPin },
    { id: "line", label: "Line", icon: Minus },
    { id: "polygon", label: "Polygon", icon: Square },
    { id: "circle", label: "Circle", icon: Circle },
]

const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#64748b", // slate
    "#000000", // black
]

export function DrawingTools({
    isActive,
    onToggle,
    onSelectTool,
    onClearAll,
    onExport,
    activeTool,
    onColorChange,
    currentColor,
}: DrawingToolsProps) {
    if (!isActive) return null

    return (
        <Card className="absolute bottom-4 right-4 z-10 p-3 w-64">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Edit3 className="h-4 w-4" />
                        <Label className="text-sm font-medium">Drawing Tools</Label>
                    </div>
                    <Button size="sm" variant="ghost" onClick={onToggle} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                    </Button>
                </div>

                <Separator />

                {/* Drawing Tools */}
                <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Tools</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {drawingTools.map((tool) => (
                            <Button
                                key={tool.id}
                                size="sm"
                                variant={activeTool === tool.id ? "default" : "outline"}
                                onClick={() => onSelectTool(tool.id)}
                                className="justify-start"
                            >
                                <tool.icon className="h-4 w-4 mr-2" />
                                {tool.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Color Picker */}
                <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Color</Label>
                    <div className="grid grid-cols-5 gap-2">
                        {colors.map((color) => (
                            <button
                                key={color}
                                onClick={() => onColorChange(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${currentColor === color ? "border-gray-400 scale-110" : "border-gray-200"
                                    }`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                            {currentColor}
                        </Badge>
                    </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={onClearAll} className="flex-1 bg-transparent">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                    <Button size="sm" variant="outline" onClick={onExport} className="flex-1 bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                {/* Instructions */}
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <strong>Instructions:</strong>
                    <ul className="mt-1 space-y-1">
                        <li>• Select a tool and click on the map</li>
                        <li>• For polygons: click to add points, double-click to finish</li>
                        <li>• For lines: click to add points, double-click to finish</li>
                        <li>• Press Escape to cancel current drawing</li>
                    </ul>
                </div>
            </div>
        </Card>
    )
}
