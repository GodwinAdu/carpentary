"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Activity, AlertTriangle, CheckCircle } from "lucide-react"
import { useSocket } from "@/providers/socket-provider"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import useCurrentLocation from "@/hooks/useTrackingLocatio"


export function ConnectionStatus() {
  const { isConnected, connectionCount, users, connectionError, latency, connectionStatus } = useSocket()
  const { user, isLoading: userLoading } = useCurrentUser()
  const { location, isLoading: locationLoading } = useCurrentLocation()

  const handleReconnect = () => {
    window.location.reload()
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600"
      case "connecting":
      case "reconnecting":
        return "text-yellow-600"
      case "disconnected":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "connecting":
      case "reconnecting":
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
      case "disconnected":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />
    }
  }

  const getLatencyColor = () => {
    if (!latency) return "text-gray-500"
    if (latency < 100) return "text-green-600"
    if (latency < 300) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="absolute top-4 left-4 z-10 space-y-2">
      {/* Main Connection Status */}
      <Card className="p-3">
        <div className="flex items-center gap-2">
          {getConnectionStatusIcon()}
          <span className={`text-sm font-medium capitalize ${getConnectionStatusColor()}`}>{connectionStatus}</span>
          {isConnected && (
            <Badge variant="secondary" className="text-xs">
              {connectionCount} online
            </Badge>
          )}
          {latency !== null && (
            <Badge variant="outline" className={`text-xs ${getLatencyColor()}`}>
              {latency}ms
            </Badge>
          )}
        </div>
      </Card>

      {/* Detailed Status */}
      <Card className="p-3 max-w-sm">
        <div className="text-xs space-y-2">
          <div className="font-semibold flex items-center gap-1">
            <Activity className="w-3 h-3" />
            System Status:
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Connection:</span>
              <span className={getConnectionStatusColor()}>{connectionStatus}</span>
            </div>

            <div className="flex justify-between">
              <span>User:</span>
              <span className={userLoading ? "text-yellow-600" : user ? "text-green-600" : "text-red-600"}>
                {userLoading ? "Loading..." : user ? "Ready" : "Not loaded"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Location:</span>
              <span className={locationLoading ? "text-yellow-600" : location ? "text-green-600" : "text-red-600"}>
                {locationLoading ? "Getting..." : location ? "Available" : "Unavailable"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="text-blue-600">{users.length}</span>
            </div>

            {latency !== null && (
              <div className="flex justify-between">
                <span>Latency:</span>
                <span className={getLatencyColor()}>{latency}ms</span>
              </div>
            )}
          </div>

          {connectionError && (
            <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-xs">
              <div className="font-medium">Connection Error:</div>
              <div>{connectionError}</div>
            </div>
          )}

          {user && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <div className="font-medium">Your Info:</div>
              <div>Name: {user.fullName}</div>
              <div>Role: {user.role}</div>
              <div>ID: {user.id.slice(0, 8)}...</div>
            </div>
          )}

          {(connectionStatus === "disconnected" || connectionError) && (
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
