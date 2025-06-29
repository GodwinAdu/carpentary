'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import useCurrentLocation from '@/hooks/useCurrentLocation';


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function AdminMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);

    const { location, error, loading } = useCurrentLocation(true);

    useEffect(() => {
        if (!mapRef.current && mapContainer.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [0, 0],
                zoom: 2,
            });
        }
    }, []);

    useEffect(() => {
        if (!mapRef.current || !location) return;

        const lngLat: [number, number] = [location.longitude, location.latitude];

        // Center the map on your location
        mapRef.current.setCenter(lngLat);
        mapRef.current.setZoom(15);

        if (markerRef.current) {
            markerRef.current.setLngLat(lngLat);
        } else {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = 'blue';
            el.style.width = '16px';
            el.style.height = '16px';
            el.style.borderRadius = '999px';

            markerRef.current = new mapboxgl.Marker(el)
                .setLngLat(lngLat)
                .setPopup(new mapboxgl.Popup().setText(`Your Location`))
                .addTo(mapRef.current);
        }
    }, [location]);

    return (
        <div className="w-full h-screen">
            {loading && <p>Getting your location...</p>}
            {error && <p>Error: {error}</p>}
            <div ref={mapContainer} className="w-full h-full" />
        </div>
    );
}
