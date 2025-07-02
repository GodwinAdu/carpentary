"use client"

import { useState, useEffect, useCallback } from "react"


interface UseCurrentLocationOptions {
    enableHighAccuracy?: boolean
    timeout?: number
    maximumAge?: number
    watchPosition?: boolean
}

interface UseCurrentLocationReturn {
    location: LocationData | null
    isLoading: boolean
    error: string | null
    getCurrentLocation: () => void
}

export default function useCurrentLocation(options: UseCurrentLocationOptions = {}): UseCurrentLocationReturn {
    const { enableHighAccuracy = true, timeout = 10000, maximumAge = 5000, watchPosition = true } = options

    const [location, setLocation] = useState<LocationData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const handleSuccess = useCallback((position: GeolocationPosition) => {
        const newLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            timestamp: new Date().toISOString(),
        }

        setLocation(newLocation)
        setIsLoading(false)
        setError(null)
    }, [])

    const handleError = useCallback((error: GeolocationPositionError) => {
        let errorMessage = "Unknown location error"

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location access denied by user"
                break
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information unavailable"
                break
            case error.TIMEOUT:
                errorMessage = "Location request timed out"
                break
        }

        setError(errorMessage)
        setIsLoading(false)
    }, [])

    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser")
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        const options: PositionOptions = {
            enableHighAccuracy,
            timeout,
            maximumAge,
        }

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options)
    }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError])

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser")
            setIsLoading(false)
            return
        }

        const options: PositionOptions = {
            enableHighAccuracy,
            timeout,
            maximumAge,
        }

        let watchId: number | null = null

        if (watchPosition) {
            watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options)
        } else {
            getCurrentLocation()
        }

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId)
            }
        }
    }, [watchPosition, getCurrentLocation, handleSuccess, handleError, enableHighAccuracy, timeout, maximumAge])

    return {
        location,
        isLoading,
        error,
        getCurrentLocation,
    }
}
