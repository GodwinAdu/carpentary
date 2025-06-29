"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Navigation, Phone, Globe, Clock, Star, X, Share, Bookmark } from "lucide-react"

interface LocationInfo {
    name: string
    address: string
    coordinates: [number, number]
    category?: string
    rating?: number
    phone?: string
    website?: string
    hours?: string
    description?: string
}

interface LocationInfoPanelProps {
    location: LocationInfo | null
    onClose: () => void
    onGetDirections: (destination: [number, number]) => void
}

export function LocationInfoPanel({ location, onClose, onGetDirections }: LocationInfoPanelProps) {
    if (!location) return null

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: location.name,
                    text: location.address,
                    url: `https://maps.google.com/?q=${location.coordinates[1]},${location.coordinates[0]}`,
                })
            } catch (error) {
                console.log("Share failed:", error)
            }
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(
                `${location.name} - ${location.address}\nhttps://maps.google.com/?q=${location.coordinates[1]},${location.coordinates[0]}`,
            )
        }
    }

    return (
        <Card className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 z-10 p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{location.name}</h3>
                    {location.category && (
                        <Badge variant="secondary" className="mt-1">
                            {location.category}
                        </Badge>
                    )}
                </div>
                <Button size="sm" variant="ghost" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-3">
                <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{location.address}</span>
                </div>

                {location.rating && (
                    <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{location.rating}</span>
                        <span className="text-sm text-muted-foreground">rating</span>
                    </div>
                )}

                {location.phone && (
                    <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${location.phone}`} className="text-sm text-blue-600 hover:underline">
                            {location.phone}
                        </a>
                    </div>
                )}

                {location.website && (
                    <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                            href={location.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate"
                        >
                            Visit website
                        </a>
                    </div>
                )}

                {location.hours && (
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{location.hours}</span>
                    </div>
                )}

                {location.description && (
                    <div>
                        <Separator className="my-3" />
                        <p className="text-sm text-muted-foreground">{location.description}</p>
                    </div>
                )}

                <Separator className="my-3" />

                <div className="flex space-x-2">
                    <Button onClick={() => onGetDirections(location.coordinates)} className="flex-1">
                        <Navigation className="h-4 w-4 mr-2" />
                        Directions
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
