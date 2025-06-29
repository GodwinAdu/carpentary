import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const data = await req.json();
    const { latitude, longitude, accuracy } = data;

    // Store in DB, log to console, or send to external system
    console.log('Received location:', { latitude, longitude, accuracy });

    return NextResponse.json({ success: true });
}
