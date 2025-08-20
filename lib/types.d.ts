interface WorkSchedule {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
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

interface ActivityTask {
    id: string
    title: string
    description?: string
    completed: boolean
    completedAt?: Date
    estimatedDuration?: number
    actualDuration?: number
    priority: "low" | "medium" | "high" | "urgent"
    assignedTo?: string
    dependencies?: string[]
    attachments?: string[]
    notes?: string
}

interface Activity {
    _id: string
    title: string
    description: string
    scheduledDate: string
    startTime: string
    endTime: string
    estimatedDuration: number
    actualDuration?: number
    buildingId: {
        _id: string
        buildingType: string
        address: string
        clientName: string
    }
    location: string
    coordinates?: {
        lat: number
        lng: number
    }
    assignedTo: Array<{
        _id: string
        fullName: string
        email: string
        avatarUrl?: string
    }>
    assignedBy: {
        _id: string
        fullName: string
        email: string
    }
    teamLead?: {
        _id: string
        fullName: string
        email: string
    }
    category: "inspection" | "maintenance" | "repair" | "installation" | "cleaning" | "security" | "documentation" | "meeting" | "training" | "emergency" | "routine_check" | "other"
    priority: "low" | "medium" | "high" | "urgent" | "critical"
    status: "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed" | "on_hold" | "overdue" | "pending_approval"
    progress: number
    tasks: ActivityTask[]
    completionRate: number
    requiredTools?: string[]
    requiredMaterials?: Array<{
        name: string
        quantity: number
        unit: string
        cost?: number
    }>
    requiredSkills?: string[]
    safetyRequirements?: string[]
    beforeImages?: string[]
    afterImages?: string[]
    documents?: string[]
    notes?: string
    workReport?: string
    qualityChecks?: Array<{
        checkName: string
        passed: boolean
        checkedBy: string
        checkedAt: Date
        notes?: string
    }>
    actualStartTime?: Date
    actualEndTime?: Date
    breakTime?: number
    overtimeHours?: number
    weatherConditions?: {
        temperature?: number
        humidity?: number
        conditions?: string
        windSpeed?: number
    }
    workingConditions?: "excellent" | "good" | "fair" | "poor" | "hazardous"
    reminderSet: boolean
    reminderTime?: Date
    notificationsSent?: Array<{
        type: string
        sentAt: Date
        recipient: string
    }>
    isRecurring: boolean
    recurrencePattern?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly" | "custom"
        interval: number
        daysOfWeek?: number[]
        endDate?: Date
        maxOccurrences?: number
    }
    parentActivityId?: string
    estimatedCost?: number
    actualCost?: number
    budgetCode?: string
    costCenter?: string
    requiresApproval: boolean
    approvalStatus: "pending" | "approved" | "rejected" | "not_required"
    approvedBy?: string
    approvedAt?: Date
    rejectionReason?: string
    performanceRating?: number
    customerSatisfaction?: number
    isEmergency: boolean
    safetyIncidents?: Array<{
        description: string
        severity: "minor" | "moderate" | "major" | "critical"
        reportedBy: string
        reportedAt: Date
        resolved: boolean
    }>
    createdBy: string
    modifiedBy?: string
    completedBy?: string
    completedAt?: Date
    tags: string[]
    isActive: boolean
    version: number
    createdAt: string
    updatedAt: string
}
