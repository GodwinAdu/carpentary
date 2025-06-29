'use client';

import { useEffect, useState } from 'react';

interface Location {
    latitude: number;
    longitude: number;
    accuracy: number;
}

export default function useCurrentLocation(
    watch: boolean = false
): {
    location: Location | null;
    error: string | null;
    loading: boolean;
} {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        const onSuccess = (position: GeolocationPosition) => {
            const currentLocation: Location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
            };
            console.log('Current location:', currentLocation);

            setLocation(currentLocation);
            setLoading(false);

            // // 🔁 Send to API
            // fetch('/api/location', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(currentLocation),
            // }).catch((err) => console.error('Location send failed:', err));
        };

        const onError = (error: GeolocationPositionError) => {
            setError(error.message);
            setLoading(false);
        };

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };

        let watcherId: number;

        if (watch) {
            watcherId = navigator.geolocation.watchPosition(onSuccess, onError, options);
        } else {
            navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
        }

        return () => {
            if (watch && watcherId) {
                navigator.geolocation.clearWatch(watcherId);
            }
        };
    }, [watch]);

    return { location, error, loading };
}
