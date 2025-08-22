"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Camera,
  MapPin,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Building2,
  Calendar,
  Users,
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { createBuilding, updateBuilding } from "@/lib/actions/building.actions"
import { AdvancedCameraCapture } from "./camera-capture"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePathname, useRouter } from "next/navigation"

const buildingCategories = [
  { label: "Commercial", value: "Commercial" },
  { label: "Residential", value: "Residential" },
  { label: "Industrial", value: "Industrial" },
  { label: "Public", value: "Public" },
  { label: "Mixed-Use", value: "Mixed-Use" },
  { label: "Other", value: "Other" },
]

const buildingTypes = [
  "Single-Family House",
  "Multi-Family House",
  "Apartment",
  "Condominium",
  "Townhouse",
  "Bungalow",
  "Duplex/Triplex",
  "Villa",
  "Cottage",
  "Office Building",
  "Retail Store",
  "Shopping Mall",
  "Hotel/Motel",
  "Restaurant/Cafe",
  "Supermarket",
  "Warehouse",
  "Factory",
  "Distribution Center",
  "Workshop",
  "School/University",
  "Hospital/Clinic",
  "Library",
  "Police Station",
  "Religious Building",
  "Construction Site",
  "Parking Garage",
  "Event Center",
  "Cinema/Theater",
  "Agricultural Barn",
]

// const statusOptions = [
//   { label: "Pending", value: "pending" },
//   { label: "Quotation", value: "quotation_sent" },
//   { label: "Deal Closed", value: "deal_closed" },
//   { label: "Partially Paid", value: "partially_paid" },
//   { label: "Fully Paid", value: "fully_paid" },
//   { label: "In Progress", value: "in_progress" },
//   { label: "Completed", value: "completed" },
//   { label: "Cancelled", value: "cancelled" },
//   { label: "Archived", value: "archived" },
// ]

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
]


export default function CapturePage({ type, initialData }: { type: "create" | "update"; initialData?: any }) {
  // Existing state
  const [imageUrls, setImageUrls] = useState<string[]>([]) // Changed from single imageUrl to array
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [buildingType, setBuildingType] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [category, setCategory] = useState("")

  // Client Information
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientCompany, setClientCompany] = useState("") // New field


  // Building Details - New fields
  const [floors, setFloors] = useState("")
  const [totalArea, setTotalArea] = useState("")
  const [yearBuilt, setYearBuilt] = useState("")
  const [architect, setArchitect] = useState("")
  const [contractor, setContractor] = useState("")
  const [parkingSpaces, setParkingSpaces] = useState("")


  // Project Management - New fields
  const [priority, setPriority] = useState("medium")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const path = usePathname()
  const router = useRouter()

  // Initialize state with initialData when in "update" mode
  useEffect(() => {
    if (type === "update" && initialData) {
      setImageUrls(initialData.imgUrls || [])
      setLocation(initialData.coordinates || null)
      setBuildingType(initialData.buildingType || "")
      setDescription(initialData.description || "")
      setCategory(initialData.category || "")
      setAddress(initialData.address || "")

      // Client info
      setClientName(initialData.clientName || "")
      setClientEmail(initialData.clientEmail || "")
      setClientPhone(initialData.clientPhone || "")
      setClientCompany(initialData.clientCompany || "")


      // Building details
      setFloors(initialData.buildingDetails?.floors?.toString() || "")
      setTotalArea(initialData.buildingDetails?.totalArea?.toString() || "")
      setYearBuilt(initialData.buildingDetails?.yearBuilt?.toString() || "")
      setArchitect(initialData.buildingDetails?.architect || "")
      setContractor(initialData.buildingDetails?.contractor || "")
      setParkingSpaces(initialData.buildingDetails?.parkingSpaces?.toString() || "")


      // Project management
      setPriority(initialData.priority || "medium")
      setTags(initialData.tags || [])
    }
  }, [type, initialData])

  const handleCapture = (uploadedImageUrl: string) => {
    console.log("Image uploaded to:", uploadedImageUrl)
    setImageUrls((prev) => [...prev, uploadedImageUrl]) // Add to array instead of replacing
    toast.success("Photo uploaded successfully!", {
      description: "Your high-quality photo has been saved to the cloud",
    })
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
    toast.info("Image removed")
  }

  const handleError = (error: string) => {
    toast.error("Camera Error", {
      description: error,
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


  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async () => {
    // Enhanced validation
    if (imageUrls.length === 0 || !location || !buildingType.trim() || !description.trim()) {
      toast.error("Missing Required Information", {
        description: "Please capture at least one image, get location, and enter building type and description",
      })
      return
    }
    setIsSaving(true)
    try {
      const values = {
        imgUrls: imageUrls, // Array of image URLs
        coordinates: location,
        address,
        category,
        buildingType,
        description,

        // Client Information
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,

        // Building Details
        buildingDetails: {
          floors: floors ? Number.parseInt(floors) : undefined,
          totalArea: totalArea ? Number.parseFloat(totalArea) : undefined,
          yearBuilt: yearBuilt ? Number.parseInt(yearBuilt) : undefined,
          architect,
          contractor,
          parkingSpaces: parkingSpaces ? Number.parseInt(parkingSpaces) : undefined,
        },

        // Project Management
        priority,
        tags,
      }

      if (type === "create") {
        await createBuilding(values, path)
        toast.success("Building created successfully!", {
          description: "Your building data has been saved to the database",
        })

        // Reset form only for create operations
        setImageUrls([])
        setLocation(null)
        setBuildingType("")
        setDescription("")
        setAddress("")
        setCategory("")
        setClientName("")
        setClientEmail("")
        setClientPhone("")
        setClientCompany("")
        setFloors("")
        setTotalArea("")
        setYearBuilt("")
        setArchitect("")
        setContractor("")
        setParkingSpaces("")
        setPriority("medium")
        setTags([])
      } else {
        await updateBuilding(initialData._id, values)
        toast.success("Building updated successfully!", {
          description: "Your building data has been updated in the database",
        })
      }

      router.push("/dashboard/buildings/manage-building")
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Image Capture Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Building Photos
                </CardTitle>
                <CardDescription>Capture or upload multiple photos of the building</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Gallery */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`Building photo ${index + 1}`}
                          className="w-full h-32 object-cover"
                          height={128}
                          width={200}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Camera Capture */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg">
                  <AdvancedCameraCapture onCapture={handleCapture} onError={handleError} />
                </div>
              </CardContent>
            </Card>

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

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter building address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Basic Building Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buildingType">Building Type *</Label>
                    <Select onValueChange={setBuildingType} value={buildingType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select building type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 overflow-y-auto">
                        {buildingTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={setCategory} value={category}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {buildingCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Add detailed description about the building..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select onValueChange={setPriority} value={priority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      placeholder="Enter client full name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientCompany">Company</Label>
                    <Input
                      id="clientCompany"
                      placeholder="Enter company name"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="Enter client email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input
                      id="clientPhone"
                      placeholder="Enter client phone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Building Details */}
            <Card>
              <CardHeader>
                <CardTitle>Building Specifications (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floors">Number of Floors</Label>
                    <Input
                      id="floors"
                      type="number"
                      placeholder="Enter number of floors"
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalArea">Total Area (sq ft)</Label>
                    <Input
                      id="totalArea"
                      type="number"
                      placeholder="Enter total area"
                      value={totalArea}
                      onChange={(e) => setTotalArea(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearBuilt">Year Built</Label>
                    <Input
                      id="yearBuilt"
                      type="number"
                      placeholder="Enter year built"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                    <Input
                      id="parkingSpaces"
                      type="number"
                      placeholder="Enter parking spaces"
                      value={parkingSpaces}
                      onChange={(e) => setParkingSpaces(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="architect">Architect</Label>
                    <Input
                      id="architect"
                      placeholder="Enter architect name"
                      value={architect}
                      onChange={(e) => setArchitect(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractor">Contractor</Label>
                    <Input
                      id="contractor"
                      placeholder="Enter contractor name"
                      value={contractor}
                      onChange={(e) => setContractor(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to categorize and organize this building</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={
                imageUrls.length === 0 ||
                !location ||
                !description.trim() ||
                !buildingType.trim() ||
                isSaving
              }
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
                  {type === "create" ? "Create Building" : "Update Building"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
