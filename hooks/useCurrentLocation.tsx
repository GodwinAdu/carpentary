"use client"

import { useEffect, useState } from "react"

interface Location {
    latitude: number
    longitude: number
    accuracy: number
    timestamp?: number
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

    const requestLocation = () => {
        setLoading(true)
        setError(null)
    }

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
                timestamp: position.timestamp,
            }
            console.log("Current location:", currentLocation)
            setLocation(currentLocation)
            setLoading(false)
        }

        const onError = (error: GeolocationPositionError) => {
            let errorMessage = "Unknown error occurred"
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
    }, [watch, loading])

    return { location, error, loading, requestLocation }
}
