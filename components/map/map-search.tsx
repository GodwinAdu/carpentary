"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, X, Clock, Star, Phone, Globe } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchResult {
    id: string
    place_name: string
    center: [number, number]
    place_type: string[]
    properties: {
        category?: string
        address?: string
        tel?: string
        website?: string
        landmark?: boolean
    }
    context?: Array<{
        id: string
        text: string
    }>
}

interface MapSearchProps {
    onLocationSelect: (location: [number, number], name: string, details?: Record<string, unknown>) => void
    accessToken: string
}

export function MapSearch({ onLocationSelect, accessToken }: MapSearchProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    const categories = [
        { value: "all", label: "All" },
        { value: "poi", label: "Places" },
        { value: "address", label: "Addresses" },
        { value: "place", label: "Cities" },
        { value: "postcode", label: "Postal" },
        { value: "region", label: "Regions" },
    ]

    useEffect(() => {
        const saved = localStorage.getItem("mapRecentSearches")
        if (saved) {
            setRecentSearches(JSON.parse(saved))
        }
    }, [])

    const saveToRecent = (result: SearchResult) => {
        const updated = [result, ...recentSearches.filter((r) => r.id !== result.id)].slice(0, 8)
        setRecentSearches(updated)
        localStorage.setItem("mapRecentSearches", JSON.stringify(updated))
    }

    const searchPlaces = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([])
            return
        }

        setIsLoading(true)
        try {
            const types = selectedCategory === "all" ? "poi,address,place,postcode,region" : selectedCategory
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    searchQuery,
                )}.json?access_token=${accessToken}&limit=10&types=${types}&language=en`,
            )
            const data = await response.json()
            setResults(data.features || [])
        } catch (error) {
            console.error("Search error:", error)
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (value: string) => {
        setQuery(value)
        setShowResults(true)

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchPlaces(value)
        }, 300)
    }

    const handleResultSelect = (result: SearchResult) => {
        setQuery(result.place_name)
        setShowResults(false)
        saveToRecent(result)

        const details = {
            category: result.properties.category,
            address: result.properties.address,
            tel: result.properties.tel,
            website: result.properties.website,
            landmark: result.properties.landmark,
            context: result.context,
        }

        onLocationSelect(result.center, result.place_name, details)
    }

    const clearSearch = () => {
        setQuery("")
        setResults([])
        setShowResults(false)
    }

    const getPlaceIcon = (placeType: string[], category?: string) => {
        if (category?.includes("restaurant") || category?.includes("food")) return "🍽️"
        if (category?.includes("hotel") || category?.includes("lodging")) return "🏨"
        if (category?.includes("gas") || category?.includes("fuel")) return "⛽"
        if (category?.includes("hospital") || category?.includes("medical")) return "🏥"
        if (category?.includes("school") || category?.includes("education")) return "🏫"
        if (category?.includes("bank") || category?.includes("finance")) return "🏦"
        if (placeType.includes("poi")) return "📍"
        if (placeType.includes("address")) return "🏠"
        if (placeType.includes("place")) return "🏙️"
        return "📍"
    }

    return (
        <div className="absolute top-4 left-4 z-10 w-96">
            <Card className="p-3">
                <div className="space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search places, addresses, coordinates..."
                            value={query}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onFocus={() => setShowResults(true)}
                            className="pl-10 pr-10"
                        />
                        {query && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={clearSearch}
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-1">
                        {categories.map((category) => (
                            <Badge
                                key={category.value}
                                variant={selectedCategory === category.value ? "default" : "secondary"}
                                className="cursor-pointer text-xs"
                                onClick={() => {
                                    setSelectedCategory(category.value)
                                    if (query) searchPlaces(query)
                                }}
                            >
                                {category.label}
                            </Badge>
                        ))}
                    </div>
                </div>

                {showResults && (
                    <Card className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-hidden shadow-lg">
                        <ScrollArea className="h-full">
                            {isLoading ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    Searching...
                                </div>
                            ) : (
                                <div className="p-2">
                                    {query === "" && recentSearches.length > 0 && (
                                        <div className="mb-2">
                                            <div className="flex items-center space-x-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>Recent Searches</span>
                                            </div>
                                            {recentSearches.map((result) => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleResultSelect(result)}
                                                    className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors"
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <span className="text-lg flex-shrink-0 mt-0.5">
                                                            {getPlaceIcon(result.place_type, result.properties.category)}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-medium truncate">{result.place_name.split(",")[0]}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{result.place_name}</div>
                                                            {result.properties.category && (
                                                                <Badge variant="outline" className="text-xs mt-1">
                                                                    {result.properties.category}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {results.length > 0 ? (
                                        <div className="space-y-1">
                                            {results.map((result) => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleResultSelect(result)}
                                                    className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors"
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <span className="text-lg flex-shrink-0 mt-0.5">
                                                            {getPlaceIcon(result.place_type, result.properties.category)}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-medium truncate">{result.place_name.split(",")[0]}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{result.place_name}</div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                {result.properties.category && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {result.properties.category}
                                                                    </Badge>
                                                                )}
                                                                {result.properties.landmark && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        <Star className="h-2 w-2 mr-1" />
                                                                        Landmark
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {(result.properties.tel || result.properties.website) && (
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    {result.properties.tel && (
                                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                                            <Phone className="h-2 w-2 mr-1" />
                                                                            <span className="truncate">{result.properties.tel}</span>
                                                                        </div>
                                                                    )}
                                                                    {result.properties.website && (
                                                                        <div className="flex items-center text-xs text-blue-600">
                                                                            <Globe className="h-2 w-2 mr-1" />
                                                                            <span>Website</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : query && !isLoading ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">No results found for &quot;{query}&quot;</div>
                                    ) : null}
                                </div>
                            )}
                        </ScrollArea>
                    </Card>
                )}
            </Card>
        </div>
    )
}
