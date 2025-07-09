"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Navigation, Clock, Star, MapPin, Share2, Heart, Building, Calendar, ImageIcon, Phone, Mail } from "lucide-react"
import Image from "next/image"

interface LocationInfo {
    id: string
    imgUrlsArray: string[]
    coordinates: { lat: number; lng: number } | [number, number]
    buildingType: string
    description: string
    clientId: string
    place_name: string
    center: [number, number]
    status: string
    createdAt: Date | string
    updatedAt: Date | string
    place_type: string[]
    properties: {
        buildingType: string
        status: string
    }
}

interface LocationInfoPanelProps {
    location: LocationInfo | null
    onClose: () => void
    onGetDirections: (coordinates: [number, number]) => void
    onSaveLocation?: (location: LocationInfo) => void
    onShareLocation?: () => void
    onCall?: (clientId: string) => void
    onEmail?: (clientId: string) => void
}

export function LocationInfoPanel({
    location,
    onClose,
    onGetDirections,
    onSaveLocation,
    onShareLocation,
    onCall,
    onEmail
}: LocationInfoPanelProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    if (!location) return null

    console.log(location, "testing locations ")

    const formatCoordinates = (coords: [number, number] | { lat: number; lng: number }) => {
        if (Array.isArray(coords)) {
            return `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`
        } else {
            return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-200"
            case "in-progress":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
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

    // Get coordinates in the correct format for directions
    const getDirectionsCoordinates = (): [number, number] => {
        if (Array.isArray(location.coordinates)) {
            return location.coordinates
        } else if (location.center) {
            return location.center
        } else {
            return [location.coordinates.lng, location.coordinates.lat]
        }
    }

    return (
        <Card className="absolute bottom-4 left-4 z-10 w-96 shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <Building className="h-5 w-5" />
                            <span>{location?.details.buildingType || location?.place_name}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(location?.details.status || "unknown")}>{location?.details.status || "Unknown"}</Badge>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-0 h-[50%]">
                <ScrollArea className="h-[50%]">
                    {/* Images */}
                    {location.details.imgUrlsArray && location.details.imgUrlsArray.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <ImageIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">Images</span>
                            </div>
                            <div className="relative">
                                <Image
                                    src={location.details.imgUrlsArray[selectedImageIndex] || "/placeholder.svg?height=200&width=300"}
                                    alt={`${location.details.buildingType || location.details.place_name} image`}
                                    width={300}
                                    height={200}
                                    className="w-full h-48 object-cover rounded-lg"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = "/placeholder.svg?height=200&width=300&text=Image+Not+Found"
                                    }}
                                />
                                {location.details.imgUrlsArray.length > 0 && (
                                    <div className="flex space-x-1 mt-2 overflow-x-auto">
                                        {location.details.imgUrlsArray.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden ${selectedImageIndex === index ? "border-blue-500" : "border-gray-200"
                                                    }`}
                                            >
                                                <Image
                                                    src={img || "/placeholder.svg?height=48&width=48"}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    width={48}
                                                    height={48}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        target.src = "/placeholder.svg?height=48&width=48"
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Description</h4>
                        <p className="text-sm text-muted-foreground">{location.details.description || "No description available"}</p>
                    </div>

                    <Separator />

                    {/* Location */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm font-medium">Location</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatCoordinates(location.coordinates)}</p>
                    </div>

                    {/* Timestamps */}
                    {location.details.createdAt && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">Created</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{formatDate(location.details.createdAt)}</p>
                            {location.details.updatedAt && location.details.updatedAt !== location.details.createdAt && (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm font-medium">Last Updated</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{formatDate(location.details.updatedAt)}</p>
                                </>
                            )}
                        </div>
                    )}

                    <Separator />

                    <div className="grid grid-cols-2 gap-2 py-2">
                        {onCall && (
                            <Button variant="outline" size="sm" onClick={() => onCall(location.details.clientId)}>
                                <Phone className="h-4 w-4 mr-1" />
                                Call
                            </Button>
                        )}

                        {onEmail && (
                            <Button variant="outline" size="sm" onClick={() => onEmail(location.details.clientId)}>
                                <Mail className="h-4 w-4 mr-1" />
                                Email
                            </Button>
                        )}
                    </div>
                     {/* Action Buttons */}
                <div className="flex space-x-2 mt-4 pt-4 border-t">
                    <Button onClick={() => onGetDirections(getDirectionsCoordinates())} className="flex-1" size="sm">
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
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
