"use client"

import dynamic from 'next/dynamic';

const AdminMap = dynamic(() => import('@/components/AdminMap'), {
    ssr: false,
});

export default function MapPage() {
    return (
        <div className="w-full h-screen">
            <AdminMap />
        </div>
    );
}
