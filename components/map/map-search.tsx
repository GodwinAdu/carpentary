"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Clock, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { searchBuilding } from "@/lib/actions/building.actions"

interface SearchResult {
    id: string
    place_name: string
    center: [number, number]
    place_type: string[]
    properties: Record<string, unknown>
    context?: Array<{ id: string; text: string }>
    buildingType?: string
    coordinates?: { lat: number; lng: number }
    clientId?: string
    description?: string
    status?: string
    updatedAt?: string | Date
    createdAt?: string | Date
    imgUrlsArray?: string[]
}

interface MapSearchProps {
    onLocationSelect: (coordinates: [number, number], name: string, details?: Record<string, unknown>) => void
}

export function MapSearch({ onLocationSelect }: MapSearchProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    console.log(results, "results map")

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("recentMapSearches")
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved))
            } catch (error) {
                console.error("Failed to load recent searches:", error)
            }
        }
    }, [])

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        if (query.length < 2) {
            setResults([])
            setShowResults(false)
            return
        }

        searchTimeoutRef.current = setTimeout(async () => {
            await performSearch(query)
        }, 300)

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [query])

    const performSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return

        setIsLoading(true)
        try {
            const response = await searchBuilding(searchQuery)
            setResults(response || [])
            setShowResults(true)
        } catch (error) {
            console.error("Search error:", error)
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleResultSelect = (result: SearchResult) => {
        // Save to recent searches
        console.log(result, "result selects")
        const updated = [result, ...recentSearches.filter((r) => r.id !== result.id)].slice(0, 10)
        setRecentSearches(updated)
        localStorage.setItem("recentMapSearches", JSON.stringify(updated))

        // Clear search
        setQuery("")
        setShowResults(false)
        setResults([])

        // Create proper coordinates array
        const coordinates: [number, number] =
            result.center || (result.coordinates ? [result.coordinates.lng, result.coordinates.lat] : [0, 0])

            console.log(result.imgUrlsArray,"images")

        // Create structured location info for the parent component
        const locationInfo = {
            id: result.id,
            buildingType: result.buildingType || result.place_name,
            place_name: result.place_name,
            center: coordinates,
            coordinates: result.coordinates || { lat: coordinates[1], lng: coordinates[0] },
            clientId: result.clientId || "",
            description: result.description || "",
            status: result.status || "unknown",
            updatedAt: result.updatedAt || new Date(),
            createdAt: result.createdAt || new Date(),
            place_type: result.place_type || [],
            properties: result.properties || {},
            imgUrlsArray: result.imgUrlsArray || [],
        }

        // Notify parent with coordinates and structured data
        onLocationSelect(coordinates, result.place_name, locationInfo)
    }

    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem("recentMapSearches")
    }

    const getPlaceIcon = (placeTypes: string[]) => {
        if (placeTypes.includes("poi")) return "🏢"
        if (placeTypes.includes("address")) return "📍"
        if (placeTypes.includes("place")) return "🏙️"
        return "📍"
    }

    const getPlaceCategory = (result: SearchResult) => {
        const category = result.properties?.category
        if (typeof category === "string") return category.replace(/_/g, " ")
        if (result.place_type.includes("poi")) return "Point of Interest"
        if (result.place_type.includes("address")) return "Address"
        if (result.place_type.includes("place")) return "Place"
        return "Location"
    }

    return (
        <div className="absolute top-4 left-4 z-10 w-80">
            <Card className="p-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search places, addresses..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setShowResults(true)}
                        className="pl-10 pr-10"
                    />
                    {query && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setQuery("")
                                setShowResults(false)
                                setResults([])
                            }}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {showResults && (
                    <div className="mt-2 max-h-96 overflow-y-auto">
                        {isLoading && (
                            <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                            </div>
                        )}

                        {!isLoading && results.length > 0 && (
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground px-2 py-1">Search Results</div>
                                {results.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleResultSelect(result)}
                                        className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <span className="text-lg mt-0.5">{getPlaceIcon(result.place_type)}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {result.buildingType || result.place_name.split(",")[0]}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {result.place_name.split(",").slice(1).join(",") || result.description}
                                                </div>
                                                <Badge variant="secondary" className="text-xs mt-1">
                                                    {getPlaceCategory(result)}
                                                </Badge>
                                            </div>
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {!isLoading && results.length === 0 && query.length >= 2 && (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                No results found for &quot;{query}&quot;
                            </div>
                        )}

                        {!query && recentSearches.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between px-2 py-1">
                                    <div className="text-xs font-medium text-muted-foreground">Recent Searches</div>
                                    <Button size="sm" variant="ghost" onClick={clearRecentSearches} className="h-6 text-xs">
                                        Clear
                                    </Button>
                                </div>
                                {recentSearches.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleResultSelect(result)}
                                        className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {result.buildingType || result.place_name.split(",")[0]}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {result.place_name.split(",").slice(1).join(",") || result.description}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    )
}
