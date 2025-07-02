"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseCurrentLocationOptions {
    enableHighAccuracy?: boolean
    timeout?: number
    maximumAge?: number
    watchPosition?: boolean
    autoStart?: boolean
}

interface UseCurrentLocationReturn {
    location: LocationData | null
    isLoading: boolean
    error: string | null
    permissionStatus: "prompt" | "granted" | "denied" | "unknown"
    getCurrentLocation: () => Promise<LocationData | null>
    startWatching: () => void
    stopWatching: () => void
    isWatching: boolean
}

export default function useCurrentLocation(options: UseCurrentLocationOptions = {}): UseCurrentLocationReturn {
    const {
        enableHighAccuracy = true,
        timeout = 15000,
        maximumAge = 10000,
        watchPosition = false,
        autoStart = true,
    } = options

    const [location, setLocation] = useState<LocationData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied" | "unknown">("unknown")
    const [isWatching, setIsWatching] = useState(false)

    const watchIdRef = useRef<number | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Check geolocation support
    const isSupported = typeof navigator !== "undefined" && "geolocation" in navigator

    const handleSuccess = useCallback((position: GeolocationPosition) => {
        const newLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            timestamp: new Date().toISOString(),
        }

        console.log("📍 Location updated:", newLocation)
        setLocation(newLocation)
        setIsLoading(false)
        setError(null)
        setPermissionStatus("granted")
    }, [])

    const handleError = useCallback((error: GeolocationPositionError) => {
        let errorMessage = "Unknown location error"
        let permission: "prompt" | "granted" | "denied" | "unknown" = "unknown"

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location access denied. Please enable location permissions."
                permission = "denied"
                break
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information unavailable. Please check your GPS."
                break
            case error.TIMEOUT:
                errorMessage = "Location request timed out. Please try again."
                break
        }

        console.warn("⚠️ Location error:", errorMessage)
        setError(errorMessage)
        setIsLoading(false)
        setPermissionStatus(permission)
    }, [])

    const getCurrentLocation = useCallback((): Promise<LocationData | null> => {
        return new Promise((resolve, reject) => {
            if (!isSupported) {
                const error = "Geolocation is not supported by this browser"
                setError(error)
                setIsLoading(false)
                reject(new Error(error))
                return
            }

            setIsLoading(true)
            setError(null)

            const options: PositionOptions = {
                enableHighAccuracy,
                timeout,
                maximumAge,
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    handleSuccess(position)
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        speed: position.coords.speed || undefined,
                        heading: position.coords.heading || undefined,
                        timestamp: new Date().toISOString(),
                    })
                },
                (error) => {
                    handleError(error)
                    reject(error)
                },
                options,
            )
        })
    }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, isSupported])

    const startWatching = useCallback(() => {
        if (!isSupported || isWatching) return

        console.log("👀 Starting location watching...")
        setIsWatching(true)
        setIsLoading(true)

        const options: PositionOptions = {
            enableHighAccuracy,
            timeout,
            maximumAge,
        }

        watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options)
    }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, isSupported, isWatching])

    const stopWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            console.log("🛑 Stopping location watching...")
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
            setIsWatching(false)
            setIsLoading(false)
        }
    }, [])

    // Check permission status
    useEffect(() => {
        if (!isSupported) return

        const checkPermission = async () => {
            try {
                if ("permissions" in navigator) {
                    const permission = await navigator.permissions.query({ name: "geolocation" })
                    setPermissionStatus(permission.state as "prompt" | "granted" | "denied" | "unknown")

                    permission.addEventListener("change", () => {
                        setPermissionStatus(permission.state as "prompt" | "granted" | "denied" | "unknown")
                    })
                }
            } catch (error) {
                console.warn("Could not check geolocation permission:", error)
            }
        }

        checkPermission()
    }, [isSupported])

    // Auto-start location watching
    useEffect(() => {
        if (!autoStart || !isSupported) return

        // Delay to ensure proper initialization
        timeoutRef.current = setTimeout(() => {
            if (watchPosition) {
                startWatching()
            } else {
                getCurrentLocation().catch(console.warn)
            }
        }, 1000) // 1 second delay

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [autoStart, watchPosition, startWatching, getCurrentLocation, isSupported])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopWatching()
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [stopWatching])

    return {
        location,
        isLoading,
        error,
        permissionStatus,
        getCurrentLocation,
        startWatching,
        stopWatching,
        isWatching,
    }
}
