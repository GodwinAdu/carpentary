"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Settings, Wifi, WifiOff, Users, Clock, Play, Square, Download, Eye, EyeOff, Navigation } from "lucide-react"

interface LiveTrackingControlsProps {
    isConnected: boolean
    userCount: number
    latency?: number
    isTracking: boolean
    onTrackingToggle: (tracking: boolean) => void
    updateInterval: number
    onUpdateIntervalChange: (interval: number) => void
    showTrails: boolean
    onShowTrailsToggle: (show: boolean) => void
    isRecording: boolean
    onRecordingToggle: (recording: boolean) => void
    onExportData: () => void
    autoFollow: boolean
    onAutoFollowToggle: (enabled: boolean) => void
}

export function LiveTrackingControls({
    isConnected,
    userCount,
    latency,
    isTracking,
    onTrackingToggle,
    updateInterval,
    onUpdateIntervalChange,
    showTrails,
    onShowTrailsToggle,
    isRecording,
    onRecordingToggle,
    onExportData,
    autoFollow,
    onAutoFollowToggle,
}: LiveTrackingControlsProps) {
    return (
        <Card className="w-80">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5" />
                    Live Tracking Controls
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Connection Status */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                            <span className="text-sm font-medium">Connection</span>
                        </div>
                        <Badge variant={isConnected ? "default" : "destructive"}>
                            {isConnected ? "Connected" : "Disconnected"}
                        </Badge>
                    </div>

                    {isConnected && (
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{userCount} users online</span>
                            </div>
                            {latency && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{latency}ms</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <Separator />

                {/* Location Tracking */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4" />
                            <span className="text-sm font-medium">Location Tracking</span>
                        </div>
                        <Switch checked={isTracking} onCheckedChange={onTrackingToggle} disabled={!isConnected} />
                    </div>

                    {isTracking && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Update Interval</span>
                                <Badge variant="outline">{updateInterval}s</Badge>
                            </div>
                            <Slider
                                value={[updateInterval]}
                                onValueChange={(value) => onUpdateIntervalChange(value[0])}
                                min={1}
                                max={30}
                                step={1}
                                className="w-full"
                            />
                        </div>
                    )}
                </div>

                <Separator />

                {/* Trail Visualization */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {showTrails ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="text-sm font-medium">Show Trails</span>
                    </div>
                    <Switch checked={showTrails} onCheckedChange={onShowTrailsToggle} />
                </div>

                {/* Auto Follow */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4" />
                        <span className="text-sm font-medium">Auto Follow</span>
                    </div>
                    <Switch checked={autoFollow} onCheckedChange={onAutoFollowToggle} />
                </div>

                <Separator />

                {/* Route Recording */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isRecording ? <Square className="w-4 h-4 text-red-500" /> : <Play className="w-4 h-4" />}
                            <span className="text-sm font-medium">Route Recording</span>
                        </div>
                        <Button
                            size="sm"
                            variant={isRecording ? "destructive" : "outline"}
                            onClick={() => onRecordingToggle(!isRecording)}
                            disabled={!isTracking}
                        >
                            {isRecording ? (
                                <>
                                    <Square className="w-3 h-3 mr-1" />
                                    Stop
                                </>
                            ) : (
                                <>
                                    <Play className="w-3 h-3 mr-1" />
                                    Start
                                </>
                            )}
                        </Button>
                    </div>

                    {isRecording && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span>Recording active</span>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Data Export */}
                <Button onClick={onExportData} className="w-full bg-transparent" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Tracking Data
                </Button>

                {/* Performance Stats */}
                <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                        <span>Active Users:</span>
                        <span>{userCount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tracking:</span>
                        <span>{isTracking ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Recording:</span>
                        <span>{isRecording ? "Active" : "Inactive"}</span>
                    </div>
                    {latency && (
                        <div className="flex justify-between">
                            <span>Latency:</span>
                            <span>{latency}ms</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
