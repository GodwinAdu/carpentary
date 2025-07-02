"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, Users, RefreshCw } from "lucide-react"
import { useSocket } from "@/providers/socket-provider"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import useCurrentLocation from "@/hooks/useTrackingLocatio"


export function ConnectionStatus() {
    const { isConnected, connectionCount, users, connectionError } = useSocket()
    const { user, isLoading: userLoading } = useCurrentUser()
    const { location, isLoading: locationLoading } = useCurrentLocation()
    console.log(location,"location")

    const handleReconnect = () => {
        window.location.reload()
    }

    return (
        <div className="absolute top-4 left-4 z-10 space-y-2">
            {/* Main Connection Status */}
            <Card className="p-3">
                <div className="flex items-center gap-2">
                    {isConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                    <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
                    {isConnected && (
                        <Badge variant="secondary" className="text-xs">
                            {connectionCount} online
                        </Badge>
                    )}
                </div>
            </Card>

            {/* Detailed Status */}
            <Card className="p-3 max-w-sm">
                <div className="text-xs space-y-2">
                    <div className="font-semibold flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Status Details:
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>User:</span>
                            <span className={userLoading ? "text-yellow-600" : user ? "text-green-600" : "text-red-600"}>
                                {userLoading ? "Loading..." : user ? user.fullName : "Not loaded"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Location:</span>
                            <span className={locationLoading ? "text-yellow-600" : location ? "text-green-600" : "text-red-600"}>
                                {locationLoading ? "Getting..." : location ? "Available" : "Not available"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Socket:</span>
                            <span className={isConnected ? "text-green-600" : "text-red-600"}>
                                {isConnected ? "Connected" : "Disconnected"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Users:</span>
                            <span className="text-blue-600">{users.length} active</span>
                        </div>
                    </div>

                    {connectionError && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-xs">Error: {connectionError}</div>
                    )}

                    {user && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                            <div className="font-medium">Your Info:</div>
                            <div>Name: {user.fullName}</div>
                            <div>Role: {user.role}</div>
                            <div>ID: {user._id}</div>
                        </div>
                    )}

                    {!isConnected && (
                        <Button size="sm" onClick={handleReconnect} className="w-full mt-2">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Reconnect
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    )
}
