"use client"

import { useEffect, useState } from "react"

export function FloatingElements() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {/* Floating geometric shapes */}
            <div
                className="absolute w-64 h-64 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-full blur-3xl"
                style={{
                    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
                    top: "10%",
                    left: "10%",
                }}
            />
            <div
                className="absolute w-96 h-96 bg-gradient-to-r from-slate-200/10 to-gray-200/10 rounded-full blur-3xl"
                style={{
                    transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
                    top: "60%",
                    right: "10%",
                }}
            />
            <div
                className="absolute w-48 h-48 bg-gradient-to-r from-amber-300/15 to-yellow-200/15 rounded-full blur-2xl"
                style={{
                    transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
                    bottom: "20%",
                    left: "20%",
                }}
            />
        </div>
    )
}
