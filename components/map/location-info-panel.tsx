"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    X,
    Navigation,
    Phone,
    Globe,
    Clock,
    Star,
    MapPin,
    Share2,
    Heart,
    Camera,
    MessageCircle,
    ExternalLink,
} from "lucide-react"

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
    onShareLocation?: () => void
}

export function LocationInfoPanel({
    location,
    onClose,
    onGetDirections,
    onSaveLocation,
    onShareLocation,
}: LocationInfoPanelProps) {
    if (!location) return null

    const formatCoordinates = (coords: [number, number]) => {
        return `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`
    }

    const getCategoryIcon = (category?: string) => {
        if (!category) return "📍"
        const cat = category.toLowerCase()
        if (cat.includes("restaurant") || cat.includes("food")) return "🍽️"
        if (cat.includes("hotel") || cat.includes("lodging")) return "🏨"
        if (cat.includes("gas") || cat.includes("fuel")) return "⛽"
        if (cat.includes("hospital") || cat.includes("medical")) return "🏥"
        if (cat.includes("school") || cat.includes("education")) return "🏫"
        if (cat.includes("bank") || cat.includes("atm")) return "🏦"
        if (cat.includes("shop") || cat.includes("store")) return "🛍️"
        if (cat.includes("park") || cat.includes("recreation")) return "🌳"
        return "📍"
    }

    const renderStars = (rating: number) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 !== 0

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
        }

        if (hasHalfStar) {
            stars.push(
                <div key="half" className="relative">
                    <Star className="h-4 w-4 text-gray-300" />
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                </div>,
            )
        }

        const emptyStars = 5 - Math.ceil(rating)
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
        }

        return stars
    }

    return (
        <Card className="absolute bottom-4 left-4 z-10 w-96 max-h-[calc(100vh-8rem)] shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xl">{getCategoryIcon(location.category)}</span>
                            <CardTitle className="text-lg truncate">{location.name}</CardTitle>
                        </div>
                        {location.category && (
                            <Badge variant="secondary" className="text-xs">
                                {location.category.replace(/_/g, " ")}
                            </Badge>
                        )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <ScrollArea className="max-h-80">
                    <div className="space-y-4">
                        {/* Address */}
                        <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-muted-foreground">
                                <div>{location.address}</div>
                                <div className="text-xs font-mono mt-1">{formatCoordinates(location.coordinates)}</div>
                            </div>
                        </div>

                        {/* Rating */}
                        {location.rating && (
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">{renderStars(location.rating)}</div>
                                <span className="text-sm font-medium">{location.rating.toFixed(1)}</span>
                                {location.reviews && (
                                    <span className="text-xs text-muted-foreground">({location.reviews.length} reviews)</span>
                                )}
                            </div>
                        )}

                        {/* Contact Info */}
                        {(location.phone || location.website || location.hours) && (
                            <>
                                <Separator />
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
                                                className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                                            >
                                                <span>Visit website</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    )}
                                    {location.hours && (
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{location.hours}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Description */}
                        {location.description && (
                            <>
                                <Separator />
                                <div className="text-sm text-muted-foreground">{location.description}</div>
                            </>
                        )}

                        {/* Photos */}
                        {location.photos && location.photos.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Camera className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Photos</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {location.photos.slice(0, 6).map((photo, index) => (
                                            <div key={index} className="aspect-square rounded-md overflow-hidden bg-muted">
                                                <img
                                                    src={photo || "/placeholder.svg"}
                                                    alt={`${location.name} photo ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Reviews */}
                        {location.reviews && location.reviews.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Recent Reviews</span>
                                    </div>
                                    <div className="space-y-3">
                                        {location.reviews.slice(0, 3).map((review, index) => (
                                            <div key={index} className="text-sm">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium">{review.author}</span>
                                                    <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                                                    <span className="text-xs text-muted-foreground">{review.date}</span>
                                                </div>
                                                <p className="text-muted-foreground">{review.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4 pt-4 border-t">
                    <Button onClick={() => onGetDirections(location.coordinates)} className="flex-1" size="sm">
                        <Navigation className="h-4 w-4 mr-2" />
                        Directions
                    </Button>
                    {onSaveLocation && (
                        <Button onClick={() => onSaveLocation(location)} variant="outline" size="sm">
                            <Heart className="h-4 w-4" />
                        </Button>
                    )}
                    {onShareLocation && (
                        <Button onClick={onShareLocation} variant="outline" size="sm">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
