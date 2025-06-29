'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface WorkerLocation {
    userId: string;
    latitude: number;
    longitude: number;
}

export default function AdminMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // 1. Init map
        mapRef.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [0, 0], // default center
            zoom: 2,
        });

        // 2. Connect socket
        socketRef.current = io('http://localhost:3001'); // Update if hosted

        // 3. Listen for location updates
        socketRef.current.on('location-update', (data: WorkerLocation) => {
            const { userId, latitude, longitude } = data;
            const lngLat = [longitude, latitude] as [number, number];

            if (markersRef.current[userId]) {
                // Update existing marker position
                markersRef.current[userId].setLngLat(lngLat);
            } else {
                // Create a new marker
                const el = document.createElement('div');
                el.className = 'marker';
                el.style.backgroundColor = 'red';
                el.style.width = '16px';
                el.style.height = '16px';
                el.style.borderRadius = '999px';

                const marker = new mapboxgl.Marker(el)
                    .setLngLat(lngLat)
                    .setPopup(new mapboxgl.Popup().setText(`Worker: ${userId}`))
                    .addTo(mapRef.current!);

                markersRef.current[userId] = marker;
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            mapRef.current?.remove();
        };
    }, []);

    return (
        <div className="w-full h-screen">
            <div ref={mapContainer} className="w-full h-full" />
        </div>
    );
}
