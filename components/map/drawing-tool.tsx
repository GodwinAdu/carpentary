"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Edit3, Square, Circle, Minus, MapPin, Trash2, Download, Palette } from "lucide-react"

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
    { value: "#ef4444", label: "Red" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#10b981", label: "Green" },
    { value: "#f59e0b", label: "Yellow" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#06b6d4", label: "Cyan" },
    { value: "#f97316", label: "Orange" },
    { value: "#84cc16", label: "Lime" },
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
        <Card className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 p-3">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                    <Label className="text-sm font-medium">Draw:</Label>
                    {drawingTools.map((tool) => (
                        <Button
                            key={tool.id}
                            size="sm"
                            variant={activeTool === tool.id ? "default" : "ghost"}
                            onClick={() => onSelectTool(tool.id)}
                            title={tool.label}
                        >
                            <tool.icon className="h-4 w-4" />
                        </Button>
                    ))}
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <Select value={currentColor} onValueChange={onColorChange}>
                        <SelectTrigger className="w-20">
                            <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: currentColor }} />
                        </SelectTrigger>
                        <SelectContent>
                            {colors.map((color) => (
                                <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.value }} />
                                        <span>{color.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center space-x-1">
                    <Button size="sm" variant="ghost" onClick={onExport} title="Export">
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onClearAll} title="Clear All">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onToggle} title="Close">
                        <Edit3 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
