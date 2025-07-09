"use client"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, MapPin, Save, CheckCircle, AlertCircle, Loader2, RotateCcw, ExternalLink } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { createBuilding } from "@/lib/actions/building.actions"
import CustomerForm from "./customer-form"
import { AdvancedCameraCapture } from "./camera-capture"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Customer = {
    _id: string
    fullName: string
}

interface CapturePageProps {
    customers: Customer[]
}


const buildingCategories = [
    { label: "Residential", value: "residential" },
    { label: "Single-Family House", value: "single_family" },
    { label: "Multi-Family House", value: "multi_family" },
    { label: "Apartment", value: "apartment" },
    { label: "Condominium (Condo)", value: "condo" },
    { label: "Townhouse", value: "townhouse" },
    { label: "Bungalow", value: "bungalow" },
    { label: "Duplex / Triplex", value: "duplex_triplex" },
    { label: "Villa", value: "villa" },
    { label: "Cottage", value: "cottage" },

    { label: "Commercial", value: "commercial" },
    { label: "Office Building", value: "office" },
    { label: "Retail Store / Shop", value: "retail" },
    { label: "Shopping Mall", value: "mall" },
    { label: "Hotel / Motel", value: "hotel" },
    { label: "Restaurant / Cafe", value: "restaurant" },
    { label: "Supermarket", value: "supermarket" },
    { label: "Warehouse (Commercial)", value: "commercial_warehouse" },

    { label: "Industrial", value: "industrial" },
    { label: "Factory", value: "factory" },
    { label: "Distribution Center", value: "distribution_center" },
    { label: "Workshop", value: "workshop" },

    { label: "Institutional / Public", value: "public" },
    { label: "School / University", value: "school" },
    { label: "Hospital / Clinic", value: "hospital" },
    { label: "Library", value: "library" },
    { label: "Police Station", value: "police" },
    { label: "Religious Building", value: "religious" },

    { label: "Mixed-Use", value: "mixed_use" },
    { label: "Residential & Commercial", value: "residential_commercial" },

    { label: "Other", value: "other" },
    { label: "Construction Site", value: "construction" },
    { label: "Parking Garage", value: "parking" },
    { label: "Event Center", value: "event_center" },
    { label: "Cinema / Theater", value: "cinema" },
    { label: "Agricultural Barn / Shed", value: "barn" },
]
export default function CapturePage({ customers }: CapturePageProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [buildingType, setBuildingType] = useState("")
    const [description, setDescription] = useState("")
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

    const handleCapture = (uploadedImageUrl: string) => {
        console.log("Image uploaded to:", uploadedImageUrl)
        setImageUrl(uploadedImageUrl)
        toast.success("Photo uploaded successfully!", {
            description: "Your high-quality photo has been saved to the cloud",
        })
    }

    const handleError = (error: string) => {
        toast.error("Camera Error", {
            description: error,
        })
    }

    const handleReset = () => {
        setImageUrl(null)
        toast.info("Ready for new capture", {
            description: "Camera is ready to capture a new photo.",
        })
    }

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
                toast.success("Location captured", {
                    description: "GPS coordinates have been recorded",
                })
            },
            (error) => {
                setLocationError(error.message)
                toast.error("Location Error", {
                    description: "Unable to retrieve location. Please check permissions.",
                })
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
        )
    }, [])

    const handleSave = async () => {
        if (!imageUrl || !location || !buildingType.trim()) {
            toast.error("Missing Information", {
                description: "Please capture an image, get location, and enter a building type",
            })
            return
        }

        setIsSaving(true)
        try {
            const values = {
                image: imageUrl, // Now this is the UploadThing URL
                location,
                buildingType,
                description,
                clientId: selectedCustomer?._id || "",
            }

            await createBuilding(values)
            toast.success("Building saved successfully!", {
                description: "Your building data has been saved to the database",
            })

            // Reset form
            setImageUrl(null)
            setLocation(null)
            setBuildingType("")
            setDescription("")
            setSelectedCustomer(null)
        } catch (error) {
            console.error("Error saving building:", error)
            toast.error("Save Error", {
                description: "There was an error saving your building data",
            })
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
                            <CardDescription>
                                Capture or upload a photo of the building (automatically saved to cloud)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!imageUrl ? (
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg">
                                    <AdvancedCameraCapture onCapture={handleCapture} onError={handleError} />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <Image
                                            src={imageUrl || "/placeholder.svg"}
                                            alt="Captured building photo"
                                            className="w-full h-auto max-h-96 object-contain"
                                            height={400}
                                            width={600}
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="secondary" className="bg-green-500/80 text-white">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Uploaded
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 justify-center">
                                        <Button onClick={handleReset} variant="outline">
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Capture New Photo
                                        </Button>

                                        <Button variant="outline" onClick={() => window.open(imageUrl, "_blank")}>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Full Size
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                    <p className="text-muted-foreground text-sm">Select Client</p>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-[200px] justify-start bg-transparent">
                                                {selectedCustomer ? <>{selectedCustomer.fullName}</> : <>+ Set client</>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search clients..." />
                                                <CommandList>
                                                    <CommandEmpty>No clients found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {customers.map((customer) => (
                                                            <CommandItem
                                                                key={customer._id}
                                                                value={customer._id}
                                                                onSelect={(value) => {
                                                                    setSelectedCustomer(customers.find((c) => c._id === value) || null)
                                                                    setOpen(false)
                                                                }}
                                                            >
                                                                {customer.fullName}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <CustomerForm />
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
                                        <Button variant="outline" size="sm" onClick={getCurrentLocation} className="w-full bg-transparent">
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
                                    <Label htmlFor="building-category">Building Category</Label>
                                    <Select onValueChange={(value) => setCategory(value)}>
                                        <SelectTrigger id="building-category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-64 overflow-y-auto">
                                            {buildingCategories.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                            disabled={!imageUrl || !location || !buildingType.trim() || isSaving}
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
