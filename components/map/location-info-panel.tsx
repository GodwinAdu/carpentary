"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    X,
    Navigation,
    Phone,
    Globe,
    MapPin,
    Star,
    Clock,
    Share2,
    Bookmark,
    Camera,
    MoreHorizontal,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

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
    photos?: string[]
    reviews?: Array<{
        author: string
        rating: number
        text: string
        date: string
    }>
    details?: Record<string, unknown>
}

interface LocationInfoPanelProps {
    location: LocationInfo | null
    onClose: () => void
    onGetDirections: (coordinates: [number, number]) => void
    onSaveLocation?: (location: LocationInfo) => void
    onShareLocation?: (location: LocationInfo) => void
}

export function LocationInfoPanel({
    location,
    onClose,
    onGetDirections,
    onSaveLocation,
    onShareLocation,
}: LocationInfoPanelProps) {
    if (!location) return null

    const handleDirections = () => {
        onGetDirections(location.coordinates)
    }

    const handleSave = () => {
        onSaveLocation?.(location)
    }

    const handleShare = () => {
        onShareLocation?.(location)
    }

    const formatCoordinates = (coords: [number, number]) => {
        return `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`
    }

    return (
        <Card className="absolute bottom-4 left-4 z-10 w-96 max-h-[60vh] overflow-hidden">
            <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate">{location.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{location.address}</p>
                        {location.category && (
                            <Badge variant="secondary" className="mt-2">
                                {location.category}
                            </Badge>
                        )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {location.rating && (
                    <div className="flex items-center space-x-1 mt-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.floor(location.rating!) ? "text-yellow-400 fill-current" : "text-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium">{location.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {/* Contact Information */}
                    {(location.phone || location.website) && (
                        <div className="space-y-2">
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
                                        Visit Website
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hours */}
                    {location.hours && (
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Hours</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">{location.hours}</p>
                        </div>
                    )}

                    {/* Description */}
                    {location.description && (
                        <div>
                            <p className="text-sm">{location.description}</p>
                        </div>
                    )}

                    {/* Coordinates */}
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Coordinates</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono pl-6">{formatCoordinates(location.coordinates)}</p>
                    </div>

                    {/* Photos */}
                    {location.photos && location.photos.length > 0 && (
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <Camera className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Photos</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {location.photos.slice(0, 4).map((photo, index) => (
                                    <img
                                        key={index}
                                        src={photo || "/placeholder.svg"}
                                        alt={`${location.name} photo ${index + 1}`}
                                        className="w-full h-20 object-cover rounded-md"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    {location.reviews && location.reviews.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Recent Reviews</h4>
                            <div className="space-y-3">
                                {location.reviews.slice(0, 2).map((review, index) => (
                                    <div key={index} className="border-l-2 border-muted pl-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm font-medium">{review.author}</span>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3 w-3 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">{review.text}</p>
                                        <p className="text-xs text-muted-foreground">{review.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <Separator />

            {/* Action Buttons */}
            <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleDirections} className="w-full">
                        <Navigation className="h-4 w-4 mr-2" />
                        Directions
                    </Button>
                    <Button variant="outline" onClick={handleShare} className="w-full bg-transparent">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" onClick={handleSave} className="w-full bg-transparent">
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                        More
                    </Button>
                </div>
            </div>
        </Card>
    )
}
