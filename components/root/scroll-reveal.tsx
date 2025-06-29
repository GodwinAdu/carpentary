"use client"

import type React from "react"
import { useInView } from "react-intersection-observer"

interface ScrollRevealProps {
    children: React.ReactNode
    direction?: "up" | "down" | "left" | "right"
    delay?: number
    className?: string
}

export function ScrollReveal({ children, direction = "up", delay = 0, className = "" }: ScrollRevealProps) {
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
    })

    const getInitialTransform = () => {
        switch (direction) {
            case "up":
                return "translateY(60px)"
            case "down":
                return "translateY(-60px)"
            case "left":
                return "translateX(60px)"
            case "right":
                return "translateX(-60px)"
            default:
                return "translateY(60px)"
        }
    }

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${className}`}
            style={{
                transform: inView ? "translate(0)" : getInitialTransform(),
                opacity: inView ? 1 : 0,
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    )
}
