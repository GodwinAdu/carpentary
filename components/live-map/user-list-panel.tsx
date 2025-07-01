"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, MapPin, Clock, Zap, Navigation } from "lucide-react"

interface User {
    id: string
    name: string
    role: "admin" | "supervisor" | "worker"
    location: {
        latitude: number
        longitude: number
        accuracy?: number
        heading?: number
        speed?: number
    }
    status: "online" | "away" | "offline"
    lastSeen: Date
    trail: Array<{
        latitude: number
        longitude: number
        timestamp: Date
    }>
}

interface UserListPanelProps {
    users: User[]
    selectedUser: string | null
    onSelectUser: (userId: string | null) => void
    autoFollow: boolean
    onToggleAutoFollow: (enabled: boolean) => void
}

export function UserListPanel({
    users,
    selectedUser,
    onSelectUser,
    autoFollow,
    onToggleAutoFollow,
}: UserListPanelProps) {
    const roleColors = {
        admin: "bg-red-500",
        supervisor: "bg-yellow-500",
        worker: "bg-green-500",
    }

    const roleIcons = {
        admin: "👑",
        supervisor: "👷‍♂️",
        worker: "🔨",
    }

    const statusColors = {
        online: "bg-green-500",
        away: "bg-yellow-500",
        offline: "bg-gray-500",
    }

    const formatLastSeen = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)

        if (minutes < 1) return "Just now"
        if (minutes < 60) return `${minutes}m ago`

        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`

        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <h3 className="font-semibold">Live Users</h3>
                    <Badge variant="secondary">{users.length}</Badge>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    <span className="text-sm font-medium">Auto Follow</span>
                </div>
                <Switch checked={autoFollow} onCheckedChange={onToggleAutoFollow} />
            </div>

            <ScrollArea className="h-96">
                <div className="space-y-2">
                    {users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No users online</p>
                        </div>
                    ) : (
                        users?.map((user) => (
                            <div
                                key={user.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedUser === user.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                                    }`}
                                onClick={() => onSelectUser(selectedUser === user.id ? null : user.id)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-8 h-8 rounded-full ${roleColors[user.role]} flex items-center justify-center text-white text-sm`}
                                        >
                                            {roleIcons[user.role]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{user.name}</div>
                                            <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${statusColors[user.status]}`} />
                                        <span className="text-xs text-gray-500 capitalize">{user.status}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>
                                            {user.location.latitude.toFixed(6)}, {user.location.longitude.toFixed(6)}
                                        </span>
                                    </div>

                                    {user.location.accuracy && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded-full border border-gray-400" />
                                            <span>±{Math.round(user.location.accuracy)}m accuracy</span>
                                        </div>
                                    )}

                                    {user.location.speed && user.location.speed > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Zap className="w-3 h-3" />
                                            <span>{Math.round(user.location.speed * 3.6)} km/h</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Last seen {formatLastSeen(user.lastSeen)}</span>
                                    </div>

                                    {user.trail.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Navigation className="w-3 h-3" />
                                            <span>{user.trail.length} trail points</span>
                                        </div>
                                    )}
                                </div>

                                {selectedUser === user.id && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full text-xs bg-transparent"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                            }}
                                        >
                                            <MapPin className="w-3 h-3 mr-1" />
                                            Center on Map
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </Card>
    )
}
