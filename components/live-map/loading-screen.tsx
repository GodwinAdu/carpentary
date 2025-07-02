"use client"

import { Card } from "@/components/ui/card"
import { MapPin, Wifi } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  submessage?: string
}

export function LoadingScreen({
  message = "Loading Map...",
  submessage = "Initializing Mapbox GL",
}: LoadingScreenProps) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
      <Card className="p-8 max-w-md">
        <div className="text-center space-y-4">
          <div className="relative">
            <MapPin className="w-12 h-12 text-blue-500 mx-auto animate-bounce" />
            <Wifi className="w-6 h-6 text-green-500 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
            <p className="text-sm text-gray-600 mt-1">{submessage}</p>
          </div>

          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </Card>
    </div>
  )
}
