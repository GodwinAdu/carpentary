"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, MapPin, Save, CheckCircle, AlertCircle, Loader2, PlusCircle } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { CameraCapture } from "./camera-capture"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { createBuilding } from "@/lib/actions/building.actions"

type Status = {
    value: string
    label: string
}
const statuses: Status[] = [
    {
        value: "backlog",
        label: "Backlog",
    },
    {
        value: "todo",
        label: "Todo",
    },
    {
        value: "in progress",
        label: "In Progress",
    },
    {
        value: "done",
        label: "Done",
    },
    {
        value: "canceled",
        label: "Canceled",
    },
]



export default function CapturePage() {
    const [image, setImage] = useState<string | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [buildingType, setBuildingType] = useState("")
    const [description, setDescription] = useState("")
    const [open, setOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<Status | null>(
        null
    )


    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by this browser")
            return
        }

        setLocationError(null)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
                toast("Location captured", {
                    description: "GPS coordinates have been recorded",
                })
            },
            (error) => {
                setLocationError(error.message)
                toast(error.message, {
                    description: "Unable to retrieve location. Please check permissions.",
                })
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
        )
    }, [])


    const handleSave = async () => {
        if (!image || !location || !buildingType.trim()) {
            toast("Please capture an image, get location, and enter a building type")
            return
        }

        setIsSaving(true)
        try {
            const values = {
                image,
                location,
                buildingType,
                description,
                clientId: ""
            };

            await createBuilding(values)

            toast("Building saved successfully!")

            // Reset form
            setImage(null)
            setLocation(null)
            setBuildingType("")
            setDescription("")
        } catch (error) {
            console.error("Error saving building:", error)
            toast("There was an error saving your building",)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Capture Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Camera className="h-5 w-5 mr-2" />
                                Building Photo
                            </CardTitle>
                            <CardDescription>Capture or upload a photo of the building</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!image ? (
                                <CameraCapture
                                    onCapture={(imageDataUrl) => {
                                        setImage(imageDataUrl)
                                        getCurrentLocation()
                                    }}
                                    onError={(error) => {
                                        toast.error("Camera Error", {
                                            description: error,
                                        })
                                    }}
                                />
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative aspect-video rounded-lg overflow-hidden">
                                        <Image src={image || "/placeholder.svg"} alt="Captured building" fill className="object-cover" />
                                    </div>
                                    <Button variant="outline" onClick={() => setImage(null)} className="w-full">
                                        <Camera className="h-4 w-4 mr-2" />
                                        Take New Photo
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                    <p className="text-muted-foreground text-sm">Select Client</p>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-[200px] justify-start">
                                                {selectedStatus ? <>{selectedStatus.label}</> : <>+ Set client</>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0" side="right" align="start">
                                            <Command>
                                                <CommandInput placeholder="Change status..." />
                                                <CommandList>
                                                    <CommandEmpty>No results found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {statuses.map((status) => (
                                                            <CommandItem
                                                                key={status.value}
                                                                value={status.value}
                                                                onSelect={(value) => {
                                                                    setSelectedStatus(
                                                                        statuses.find((priority) => priority.value === value) ||
                                                                        null
                                                                    )
                                                                    setOpen(false)
                                                                }}
                                                            >
                                                                {status.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Button><PlusCircle className="w-4 h-4" /> Create Client</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location & Details Section */}
                    <div className="space-y-6">
                        {/* Location Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Location
                                </CardTitle>
                                <CardDescription>GPS coordinates for precise mapping</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!location ? (
                                    <div className="text-center py-4">
                                        <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">Location not captured yet</p>
                                        <Button onClick={getCurrentLocation}>
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Get Current Location
                                        </Button>
                                        {locationError && (
                                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                <div className="flex items-center text-red-600 dark:text-red-400">
                                                    <AlertCircle className="h-4 w-4 mr-2" />
                                                    <span className="text-sm">{locationError}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            <span className="font-medium">Location captured</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs text-gray-500">Latitude</Label>
                                                <Badge variant="secondary" className="w-full justify-center">
                                                    {location.lat.toFixed(6)}
                                                </Badge>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-gray-500">Longitude</Label>
                                                <Badge variant="secondary" className="w-full justify-center">
                                                    {location.lng.toFixed(6)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={getCurrentLocation} className="w-full">
                                            Update Location
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Building Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Building Details</CardTitle>
                                <CardDescription>Add information about the building</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="buildingType">Building Type *</Label>
                                    <Input
                                        id="buildingType"
                                        placeholder="Enter building type"
                                        value={buildingType}
                                        onChange={(e) => setBuildingType(e.target.value)}
                                    />
                                </div>
                               
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Add notes about the building..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <Button
                            onClick={handleSave}
                            disabled={!image || !location || !buildingType.trim() || isSaving}
                            className="w-full"
                            size="lg"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving Building...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Building
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
