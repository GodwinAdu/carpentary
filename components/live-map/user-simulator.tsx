"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Minus } from "lucide-react"

interface SimulatedUser {
    id: string
    name: string
    role: "admin" | "supervisor" | "worker"
    lat: number
    lng: number
    socket: any
}

export function UserSimulator() {
    const [simulatedUsers, setSimulatedUsers] = useState<SimulatedUser[]>([])
    const [isSimulating, setIsSimulating] = useState(false)

    const createSimulatedUser = () => {
        // Create random location around NYC
        const baseLat = 40.7128
        const baseLng = -74.006
        const randomLat = baseLat + (Math.random() - 0.5) * 0.01
        const randomLng = baseLng + (Math.random() - 0.5) * 0.01

        const roles: Array<"admin" | "supervisor" | "worker"> = ["admin", "supervisor", "worker"]
        const role = roles[Math.floor(Math.random() * roles.length)]

        const user: SimulatedUser = {
            id: `sim_${Math.random().toString(36).substr(2, 9)}`,
            name: `Simulated ${role} ${Math.floor(Math.random() * 100)}`,
            role,
            lat: randomLat,
            lng: randomLng,
            socket: null,
        }

        // Create socket connection for simulated user
        import("socket.io-client").then(({ io }) => {
            const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:4000")

            socket.on("connect", () => {
                console.log(`🤖 Simulated user ${user.name} connected`)

                // Join tracking session
                socket.emit("join-tracking", {
                    name: user.name,
                    role: user.role,
                    sessionId: "tracking-users",
                    location: {
                        latitude: user.lat,
                        longitude: user.lng,
                    },
                    speed: Math.random() * 10,
                    accuracy: 5 + Math.random() * 10,
                    heading: Math.random() * 360,
                })

                // Send periodic location updates
                const interval = setInterval(
                    () => {
                        if (socket.connected) {
                            // Simulate movement
                            user.lat += (Math.random() - 0.5) * 0.0001
                            user.lng += (Math.random() - 0.5) * 0.0001

                            socket.emit("location-update", {
                                location: {
                                    latitude: user.lat,
                                    longitude: user.lng,
                                },
                                accuracy: 5 + Math.random() * 10,
                                speed: Math.random() * 15,
                                heading: Math.random() * 360,
                                timestamp: new Date().toISOString(),
                            })
                        }
                    },
                    3000 + Math.random() * 2000,
                ) // Random interval between 3-5 seconds

                user.socket = { connection: socket, interval }
            })
        })

        setSimulatedUsers((prev) => [...prev, user])
    }

    const removeSimulatedUser = () => {
        if (simulatedUsers.length > 0) {
            const userToRemove = simulatedUsers[simulatedUsers.length - 1]
            if (userToRemove.socket) {
                userToRemove.socket.connection.disconnect()
                clearInterval(userToRemove.socket.interval)
            }
            setSimulatedUsers((prev) => prev.slice(0, -1))
        }
    }

    const toggleSimulation = () => {
        if (isSimulating) {
            // Stop all simulated users
            simulatedUsers.forEach((user) => {
                if (user.socket) {
                    user.socket.connection.disconnect()
                    clearInterval(user.socket.interval)
                }
            })
            setSimulatedUsers([])
        } else {
            // Start with 3 simulated users
            for (let i = 0; i < 3; i++) {
                setTimeout(() => createSimulatedUser(), i * 1000)
            }
        }
        setIsSimulating(!isSimulating)
    }

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">User Simulator</span>
                        <Badge variant="secondary">{simulatedUsers.length}</Badge>
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={createSimulatedUser} disabled={!isSimulating}>
                            <Plus className="w-4 h-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={removeSimulatedUser}
                            disabled={!isSimulating || simulatedUsers.length === 0}
                        >
                            <Minus className="w-4 h-4" />
                        </Button>

                        <Button size="sm" variant={isSimulating ? "destructive" : "default"} onClick={toggleSimulation}>
                            {isSimulating ? "Stop Simulation" : "Start Simulation"}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
