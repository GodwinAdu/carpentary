"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, Clock, Globe, Smartphone, Activity, Ban, RefreshCw } from "lucide-react"

interface SecurityEvent {
    id: string
    type: "login_attempt" | "verification_attempt" | "suspicious_activity" | "device_change" | "rate_limit"
    severity: "low" | "medium" | "high" | "critical"
    message: string
    timestamp: number
    ip?: string
    userAgent?: string
    location?: string
}

export function SecurityMonitor() {
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
    const [activeThreats, setActiveThreats] = useState(0)
    const [blockedIPs, setBlockedIPs] = useState(0)
    const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low")
    const [isMonitoring, setIsMonitoring] = useState(true)

    // Simulate real-time security monitoring
    useEffect(() => {
        if (!isMonitoring) return

        const interval = setInterval(() => {
            // Simulate security events
            const eventTypes = [
                "login_attempt",
                "verification_attempt",
                "suspicious_activity",
                "device_change",
                "rate_limit",
            ] as const
            const severities = ["low", "medium", "high", "critical"] as const

            if (Math.random() > 0.7) {
                // 30% chance of new event
                const newEvent: SecurityEvent = {
                    id: Math.random().toString(36).substring(7),
                    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                    severity: severities[Math.floor(Math.random() * severities.length)],
                    message: generateEventMessage(),
                    timestamp: Date.now(),
                    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    location: "New York, US",
                }

                setSecurityEvents((prev) => [newEvent, ...prev.slice(0, 49)]) // Keep last 50 events
            }

            // Update metrics
            setActiveThreats(Math.floor(Math.random() * 5))
            setBlockedIPs(Math.floor(Math.random() * 20))
            setRiskLevel(["low", "medium", "high"][Math.floor(Math.random() * 3)] as any)
        }, 5000)

        return () => clearInterval(interval)
    }, [isMonitoring])

    const generateEventMessage = (): string => {
        const messages = [
            "Failed verification attempt detected",
            "New device login from unusual location",
            "Rate limit exceeded for IP address",
            "Suspicious automation patterns detected",
            "Multiple failed login attempts",
            "CAPTCHA challenge failed",
            "Device fingerprint mismatch detected",
            "VPN/Proxy usage detected",
            "Successful verification completed",
            "Trusted device registered",
        ]
        return messages[Math.floor(Math.random() * messages.length)]
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical":
                return "bg-red-500"
            case "high":
                return "bg-orange-500"
            case "medium":
                return "bg-yellow-500"
            case "low":
                return "bg-green-500"
            default:
                return "bg-gray-500"
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case "critical":
                return <Ban className="h-4 w-4" />
            case "high":
                return <AlertTriangle className="h-4 w-4" />
            case "medium":
                return <Clock className="h-4 w-4" />
            case "low":
                return <CheckCircle className="h-4 w-4" />
            default:
                return <Activity className="h-4 w-4" />
        }
    }

    const getRiskLevelColor = (level: string) => {
        switch (level) {
            case "high":
                return "text-red-400 border-red-500/50 bg-red-500/10"
            case "medium":
                return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10"
            case "low":
                return "text-green-400 border-green-500/50 bg-green-500/10"
            default:
                return "text-gray-400 border-gray-500/50 bg-gray-500/10"
        }
    }

    const clearEvents = () => {
        setSecurityEvents([])
    }

    const toggleMonitoring = () => {
        setIsMonitoring(!isMonitoring)
    }

    return (
        <div className="space-y-6">
            {/* Security Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Risk Level</p>
                                <Badge className={getRiskLevelColor(riskLevel)}>{riskLevel.toUpperCase()}</Badge>
                            </div>
                            <Shield className="h-8 w-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Active Threats</p>
                                <p className="text-2xl font-bold text-white">{activeThreats}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Blocked IPs</p>
                                <p className="text-2xl font-bold text-white">{blockedIPs}</p>
                            </div>
                            <Ban className="h-8 w-8 text-red-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Events Today</p>
                                <p className="text-2xl font-bold text-white">{securityEvents.length}</p>
                            </div>
                            <Activity className="h-8 w-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Security Status Alert */}
            {riskLevel === "high" && (
                <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-400">
                        High security risk detected. Enhanced monitoring is active and additional verification may be required.
                    </AlertDescription>
                </Alert>
            )}

            {/* Security Events */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Security Events
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleMonitoring}
                                className="border-slate-600 text-slate-300"
                            >
                                {isMonitoring ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Monitoring
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Paused
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" size="sm" onClick={clearEvents} className="border-slate-600 text-slate-300">
                                Clear Events
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                        {securityEvents.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No security events recorded</p>
                                <p className="text-sm">System monitoring is active</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {securityEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-700/50 border-b border-slate-700 last:border-b-0"
                                    >
                                        <div className={`p-2 rounded-full ${getSeverityColor(event.severity)}`}>
                                            {getSeverityIcon(event.severity)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{event.message}</p>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(event.timestamp).toLocaleTimeString()}
                                                </span>
                                                {event.ip && (
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="h-3 w-3" />
                                                        {event.ip}
                                                    </span>
                                                )}
                                                {event.location && (
                                                    <span className="flex items-center gap-1">
                                                        <Smartphone className="h-3 w-3" />
                                                        {event.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Badge variant="outline" className={`${getSeverityColor(event.severity)} text-white border-0`}>
                                            {event.severity}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
