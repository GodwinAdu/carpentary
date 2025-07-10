"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Calendar, Camera, Navigation, Edit, Trash2, Share } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock building data - in a real app, this would come from your database
const mockBuilding = {
    id: 1,
    name: "Modern Office Complex",
    address: "123 Business Ave, Downtown District",
    description:
        "A state-of-the-art office complex featuring modern architecture, sustainable design elements, and premium amenities. The building serves as headquarters for multiple tech companies and startups.",
    category: "Commercial",
    capturedAt: "2024-01-15",
    capturedBy: "John Doe",
    coordinates: {
        lat: 40.7128,
        lng: -74.006,
    },
    imageUrl: "/placeholder.svg?height=400&width=600",
    additionalImages: [
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
    ],
    details: {
        floors: 25,
        yearBuilt: 2020,
        architect: "Smith & Associates",
        area: "150,000 sq ft",
        parking: "500 spaces",
    },
    status: "Active",
}

export default function BuildingDetailPage({ params }: { params: { id: string } }) {
    const handleNavigate = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${mockBuilding.coordinates.lat},${mockBuilding.coordinates.lng}`
        window.open(url, "_blank")
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: mockBuilding.name,
                text: `Check out this building: ${mockBuilding.name}`,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" asChild className="mr-4">
                            <Link href="/buildings">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{mockBuilding.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{mockBuilding.address}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={handleShare}>
                            <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Image */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="aspect-video relative rounded-lg overflow-hidden">
                                    <Image
                                        src={mockBuilding.imageUrl || "/placeholder.svg"}
                                        alt={mockBuilding.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <Badge className="absolute top-4 left-4">{mockBuilding.category}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{mockBuilding.description}</p>
                            </CardContent>
                        </Card>

                        {/* Additional Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Photos</CardTitle>
                                <CardDescription>More views of this building</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {mockBuilding.additionalImages.map((image, index) => (
                                        <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                                            <Image
                                                src={image || "/placeholder.svg"}
                                                alt={`${mockBuilding.name} view ${index + 1}`}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform cursor-pointer"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Building Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Building Specifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold mb-2">Physical Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Floors:</span>
                                                <span>{mockBuilding.details.floors}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Total Area:</span>
                                                <span>{mockBuilding.details.area}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Year Built:</span>
                                                <span>{mockBuilding.details.yearBuilt}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Additional Info</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Architect:</span>
                                                <span>{mockBuilding.details.architect}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Parking:</span>
                                                <span>{mockBuilding.details.parking}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                                <Badge variant="outline" className="text-green-600 border-green-600">
                                                    {mockBuilding.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button onClick={handleNavigate} className="w-full">
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Navigate Here
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/map?building=${mockBuilding.id}`}>
                                        <MapPin className="h-4 w-4 mr-2" />
                                        View on Map
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Add Photos
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Location Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</Label>
                                    <p className="text-sm">{mockBuilding.address}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Latitude</Label>
                                        <Badge variant="secondary" className="w-full justify-center text-xs">
                                            {mockBuilding.coordinates.lat.toFixed(6)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Longitude</Label>
                                        <Badge variant="secondary" className="w-full justify-center text-xs">
                                            {mockBuilding.coordinates.lng.toFixed(6)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Capture Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Capture Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Captured on:</span>
                                    <span className="ml-2 font-medium">{mockBuilding.capturedAt}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Camera className="h-4 w-4 mr-2 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Captured by:</span>
                                    <span className="ml-2 font-medium">{mockBuilding.capturedBy}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={className}>{children}</div>
}
