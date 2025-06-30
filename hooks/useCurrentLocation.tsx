"use client"

import { useEffect, useState, useCallback } from "react"

interface Location {
    latitude: number
    longitude: number
    accuracy: number
    altitude?: number | null
    altitudeAccuracy?: number | null
    heading?: number | null
    speed?: number | null
    timestamp: number
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
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
                timestamp: position.timestamp,
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
            maximumAge: 60000,
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
