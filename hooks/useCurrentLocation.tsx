"use client"

import { useEffect, useState, useCallback } from "react"

interface Location {
    latitude: number
    longitude: number
    accuracy: number
    heading?: number
    speed?: number
    altitude?: number
}

export default function useCurrentLocation(watch = false): {
    location: Location | null
    error: string | null
    loading: boolean
    requestLocation: () => void
} {
    const [location, setLocation] = useState<Location | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const requestLocation = useCallback(() => {
        setLoading(true)
        setError(null)
    }, [])

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.")
            setLoading(false)
            return
        }

        const onSuccess = (position: GeolocationPosition) => {
            const currentLocation: Location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                heading: position.coords.heading || undefined,
                speed: position.coords.speed || undefined,
                altitude: position.coords.altitude || undefined,
            }
            console.log("Current location:", currentLocation)
            setLocation(currentLocation)
            setLoading(false)
        }

        const onError = (error: GeolocationPositionError) => {
            setError(error.message)
            setLoading(false)
        }

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 30000,
        }

        let watcherId: number

        if (watch) {
            watcherId = navigator.geolocation.watchPosition(onSuccess, onError, options)
        } else {
            navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
        }

        return () => {
            if (watch && watcherId) {
                navigator.geolocation.clearWatch(watcherId)
            }
        }
    }, [watch])

    return { location, error, loading, requestLocation }
}
