'use client';

import useCurrentLocation from "@/hooks/useCurrentLocation";
import { useEffect } from "react";

export default function WorkerPage() {
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                alert(`Lat: ${pos.coords.latitude}, Lon: ${pos.coords.longitude}`);
            },
            (err) => {
                alert(`Error: ${err.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    return <p>Testing geolocation...</p>;
    // const { location, error, loading } = useCurrentLocation();

    // if (loading) return <p>Loading location…</p>;
    // if (error) return <p className="text-red-500">Error: {error}</p>;

    // return (
    //     <div>
    //         <p>Latitude: {location?.latitude}</p>
    //         <p>Longitude: {location?.longitude}</p>
    //         <p>Accuracy: ±{location?.accuracy} m</p>
    //     </div>
    // );
}
