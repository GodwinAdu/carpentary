interface WorkSchedule extends Document {
    day: "Monday" | "Tuesday" | " Wednesday " | "Thursday" | "Friday" | "Saturday" | "Sunday";
    startTime: string;
    endTime: string;
}
interface LocationData {
    latitude: number
    longitude: number
    accuracy?: number
    speed?: number
    heading?: number
    timestamp?: string
}
interface User {
    id: string
    name: string
    role: "admin" | "supervisor" | "worker"
    sessionId: string
    joinedAt: string
    lastSeen: string
    status: "online" | "away" | "offline"
    location: LocationData | null
    accuracy?: number
    speed?: number
    heading?: number
    isTyping?: boolean
    isActive?: boolean
    lastActivity?: string
    trail: Array<{
        latitude: number
        longitude: number
        timestamp: string
    }>
}
interface Message {
    id: string
    userId: string
    userName: string
    userRole: string
    message: string
    timestamp: string
    location?: LocationData | null
    messageType?: "text" | "system" | "alert"
    edited?: boolean
    reactions?: Record<string, string[]> // emoji -> array of user IDs
}
interface TypingUser {
    userId: string
    userName: string
    isTyping: boolean
    timestamp: string
}
interface GeofenceAlert {
    id: string
    userId: string
    userName: string
    type: "enter" | "exit"
    geofenceName: string
    location: LocationData
    timestamp: string
    priority?: "low" | "medium" | "high"
}
interface UserPresence {
    userId: string
    isActive: boolean
    lastActivity: string
    timestamp: string
}
