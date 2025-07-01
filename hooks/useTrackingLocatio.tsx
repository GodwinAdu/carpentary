"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface LocationData {
    latitude: number
    longitude: number
    accuracy: number
    altitude?: number
    altitudeAccuracy?: number
    heading?: number
    speed?: number
    timestamp: number
}

interface UseCurrentLocationOptions {
    enableHighAccuracy?: boolean
    timeout?: number
    maximumAge?: number
}

interface UseCurrentLocationReturn {
    location: LocationData | null
    accuracy?: number
    speed?: number
    heading?: number
    error: string | null
    isLoading: boolean
    requestLocation: () => void
}

export function useCurrentLocation(options: UseCurrentLocationOptions = {}): UseCurrentLocationReturn {
    const [location, setLocation] = useState<LocationData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const watchIdRef = useRef<number | null>(null)
    const optionsRef = useRef(options)

    // Update options ref when options change
    useEffect(() => {
        optionsRef.current = options
    }, [options])

    const handleSuccess = useCallback((position: GeolocationPosition) => {
        const { coords } = position
        setLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: coords.altitude || undefined,
            altitudeAccuracy: coords.altitudeAccuracy || undefined,
            heading: coords.heading || undefined,
            speed: coords.speed || undefined,
            timestamp: position.timestamp,
        })
        setError(null)
        setIsLoading(false)
    }, [])

    const handleError = useCallback((error: GeolocationPositionError) => {
        let errorMessage = "An unknown error occurred."
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location access denied by user."
                break
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable."
                break
            case error.TIMEOUT:
                errorMessage = "Location request timed out."
                break
        }
        setError(errorMessage)
        setIsLoading(false)
    }, [])

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser.")
            return
        }

        setIsLoading(true)
        setError(null)

        const { enableHighAccuracy = false, timeout = 10000, maximumAge = 60000 } = optionsRef.current

        const positionOptions: PositionOptions = {
            enableHighAccuracy,
            timeout,
            maximumAge,
        }

        // Clear existing watch
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
        }

        // Start watching position
        watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, positionOptions)
    }, [handleSuccess, handleError])

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
            }
        }
    }, [])

    return {
        location,
        accuracy: location?.accuracy,
        speed: location?.speed,
        heading: location?.heading,
        error,
        isLoading,
        requestLocation,
    }
}

export default useCurrentLocation
