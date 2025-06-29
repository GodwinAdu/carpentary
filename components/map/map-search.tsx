"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, X, MapPin, Clock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchResult {
    id: string
    place_name: string
    center: [number, number]
    place_type: string[]
    properties: {
        category?: string
        address?: string
    }
}

interface MapSearchProps {
    onLocationSelect: (location: [number, number], name: string) => void
    accessToken: string
}

export function MapSearch({ onLocationSelect, accessToken }: MapSearchProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Load recent searches from localStorage
        const saved = localStorage.getItem("mapRecentSearches")
        if (saved) {
            setRecentSearches(JSON.parse(saved))
        }
    }, [])

    const saveToRecent = (result: SearchResult) => {
        const updated = [result, ...recentSearches.filter((r) => r.id !== result.id)].slice(0, 5)
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
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    searchQuery,
                )}.json?access_token=${accessToken}&limit=8&types=poi,address,place`,
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
        onLocationSelect(result.center, result.place_name)
    }

    const clearSearch = () => {
        setQuery("")
        setResults([])
        setShowResults(false)
    }

    return (
        <div className="absolute top-4 left-4 z-10 w-80">
            <Card className="p-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search places, addresses..."
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

                {showResults && (
                    <Card className="absolute top-full left-0 right-0 mt-1 max-h-80 overflow-hidden">
                        <ScrollArea className="h-full">
                            {isLoading ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                            ) : (
                                <div className="p-2">
                                    {query === "" && recentSearches.length > 0 && (
                                        <div className="mb-2">
                                            <div className="flex items-center space-x-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>Recent</span>
                                            </div>
                                            {recentSearches.map((result) => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleResultSelect(result)}
                                                    className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors"
                                                >
                                                    <div className="flex items-start space-x-2">
                                                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-medium truncate">{result.place_name.split(",")[0]}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{result.place_name}</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {results.length > 0 ? (
                                        results.map((result) => (
                                            <button
                                                key={result.id}
                                                onClick={() => handleResultSelect(result)}
                                                className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors"
                                            >
                                                <div className="flex items-start space-x-2">
                                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-medium truncate">{result.place_name.split(",")[0]}</div>
                                                        <div className="text-xs text-muted-foreground truncate">{result.place_name}</div>
                                                        {result.properties.category && (
                                                            <div className="text-xs text-blue-600 mt-1">{result.properties.category}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    ) : query && !isLoading ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
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
