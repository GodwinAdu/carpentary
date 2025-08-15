"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Clock,
    CreditCard,
    Edit,
    Globe,
    Home,
    Mail,
    MapPin,
    Phone,
    Shield,
    Users,
    Briefcase,
    Calendar,
    Building,
    CheckCircle,
    XCircle,
    AlertCircle,
    UserCheck,
    History,
    Settings,
} from "lucide-react"
import { format } from "date-fns"

interface WorkSchedule {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
    startTime: string
    endTime: string
}

interface Address {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
}

interface AdvancedProfileProps {
    user: {
        _id: string
        username: string
        fullName: string
        email: string
        phoneNumber?: string
        emergencyNumber?: string
        dob?: Date
        password: string
        role: string
        avatarUrl?: string
        isActive: boolean
        availableAllSchedule: boolean
        address?: Address
        isVerified: boolean
        jobTitle?: string
        departmentId: string
        workSchedule: WorkSchedule[]
        workLocation: "on-site" | "remote" | "hybrid"
        warehouse: string[]
        cardDetails?: {
            idCardType?: string
            idCardNumber?: string
        }
        accountDetails?: {
            accountName?: string
            accountNumber?: string
            accountType?: string
        }
        startDate?: Date
        gender: "male" | "female" | "other" | "prefer-not-to-say"
        bio?: string
        requirePasswordChange: boolean
        isBanned: boolean
        onLeave: boolean
        createdBy?: string
        modifiedBy?: string
        del_flag: boolean
        mod_flag: boolean
        action_type: "created" | "updated" | "deleted" | "restored"
        createdAt: Date
        updatedAt: Date
    }
}

export function AdvancedProfile({ user }: AdvancedProfileProps) {
    const [isEditing, setIsEditing] = useState(false)

    const getStatusColor = () => {
        if (user.del_flag) return "destructive"
        if (user.isBanned) return "destructive"
        if (user.onLeave) return "secondary"
        if (!user.isActive) return "outline"
        return "default"
    }

    const getStatusText = () => {
        if (user.del_flag) return "Deleted"
        if (user.isBanned) return "Banned"
        if (user.onLeave) return "On Leave"
        if (!user.isActive) return "Inactive"
        return "Active"
    }

    const getWorkLocationIcon = () => {
        switch (user.workLocation) {
            case "remote":
                return <Globe className="h-4 w-4" />
            case "hybrid":
                return <Building className="h-4 w-4" />
            default:
                return <Home className="h-4 w-4" />
        }
    }

    const formatAddress = () => {
        if (!user.address) return "No address provided"
        const { street, city, state, country, zipCode } = user.address
        return [street, city, state, zipCode, country].filter(Boolean).join(", ")
    }

 
    const calculateTenure = () => {
        if (!user.startDate) return "Unknown"
        const now = new Date()
        const start = new Date(user.startDate)
        const diffTime = Math.abs(now.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const years = Math.floor(diffDays / 365)
        const months = Math.floor((diffDays % 365) / 30)

        if (years > 0) {
            return `${years} year${years > 1 ? "s" : ""}, ${months} month${months > 1 ? "s" : ""}`
        }
        return `${months} month${months > 1 ? "s" : ""}`
    }

    const getActionTypeBadgeColor = () => {
        switch (user.action_type) {
            case "created":
                return "default"
            case "updated":
                return "secondary"
            case "deleted":
                return "destructive"
            case "restored":
                return "outline"
            default:
                return "default"
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Section */}
            <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
                <CardContent className="relative pt-0 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-12">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.fullName} />
                                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    {user.fullName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user.fullName}</h1>
                                    {user.isVerified && <CheckCircle className="h-6 w-6 text-blue-500" />}
                                    {user.mod_flag && <Settings className="h-5 w-5 text-orange-500" title="Modified" />}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
                                    <Badge variant="outline">{user.role}</Badge>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        {getWorkLocationIcon()}
                                        {user.workLocation}
                                    </Badge>
                                    <Badge variant={getActionTypeBadgeColor()} className="capitalize">
                                        {user.action_type}
                                    </Badge>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                            </div>
                        </div>
                        <Button onClick={() => setIsEditing(!isEditing)} className="mt-4 md:mt-0">
                            <Edit className="h-4 w-4 mr-2" />
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </Button>
                    </div>
                    {user.bio && (
                        <div className="mt-6">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{user.bio}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="work">Work Details</TabsTrigger>
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                {user.phoneNumber && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{user.phoneNumber}</p>
                                        </div>
                                    </div>
                                )}
                                {user.emergencyNumber && (
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Emergency Contact</p>
                                            <p className="font-medium">{user.emergencyNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300">{formatAddress()}</p>
                            </CardContent>
                        </Card>

                        {/* Employment Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Employment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Start Date</p>
                                    <p className="font-medium">{format(user?.startDate,"PPP")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tenure</p>
                                    <p className="font-medium">{calculateTenure()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Job Title</p>
                                    <p className="font-medium">{user.jobTitle || "Not specified"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="work" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Work Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Work Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user.availableAllSchedule ? (
                                    <p className="text-gray-600 dark:text-gray-400">Available all schedule</p>
                                ) : (
                                    <div className="space-y-3">
                                        {user.workSchedule.map((schedule, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                                            >
                                                <span className="font-medium">{schedule.day}</span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {schedule.startTime} - {schedule.endTime}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Work Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Work Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Department ID</p>
                                    <p className="font-medium font-mono text-sm">{user.departmentId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Work Location</p>
                                    <div className="flex items-center gap-2">
                                        {getWorkLocationIcon()}
                                        <span className="font-medium capitalize">{user.workLocation}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Warehouses</p>
                                    <p className="font-medium">
                                        {user.warehouse.length > 0 ? `${user.warehouse.length} assigned` : "None assigned"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="personal" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Date of Birth</p>
                                    <p className="font-medium">{format(user?.dob,"PPP")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="font-medium capitalize">{user.gender.replace("-", " ")}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Account & ID Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {user.cardDetails?.idCardType && (
                                    <div>
                                        <p className="text-sm text-gray-500">ID Card Type</p>
                                        <p className="font-medium">{user.cardDetails.idCardType}</p>
                                    </div>
                                )}
                                {user.cardDetails?.idCardNumber && (
                                    <div>
                                        <p className="text-sm text-gray-500">ID Card Number</p>
                                        <p className="font-medium font-mono">{user.cardDetails.idCardNumber}</p>
                                    </div>
                                )}
                                {user.accountDetails?.accountType && (
                                    <div>
                                        <p className="text-sm text-gray-500">Account Type</p>
                                        <p className="font-medium">{user.accountDetails.accountType}</p>
                                    </div>
                                )}
                                {user.accountDetails?.accountNumber && (
                                    <div>
                                        <p className="text-sm text-gray-500">Account Number</p>
                                        <p className="font-medium font-mono">{user.accountDetails.accountNumber}</p>
                                    </div>
                                )}
                                {user.accountDetails?.accountName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Account Name</p>
                                        <p className="font-medium">{user.accountDetails.accountName}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Security Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Security Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span>Email Verified</span>
                                    {user.isVerified ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Password Change Required</span>
                                    {user.requirePasswordChange ? (
                                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Account Status</span>
                                    <Badge variant={user.isBanned ? "destructive" : "default"}>
                                        {user.isBanned ? "Banned" : "Good Standing"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Deletion Status</span>
                                    <Badge variant={user.del_flag ? "destructive" : "default"}>
                                        {user.del_flag ? "Marked for Deletion" : "Active"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Account Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Created</p>
                                    <p className="font-medium">{format(user.createdAt,"PPP")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Updated</p>
                                    <p className="font-medium">{format(user.updatedAt,"PPP")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">User ID</p>
                                    <p className="font-medium font-mono text-sm">{user._id}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="audit" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Audit Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Audit Trail
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Last Action</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getActionTypeBadgeColor()} className="capitalize">
                                            {user.action_type}
                                        </Badge>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{format(user.updatedAt,"PPP")}</span>
                                    </div>
                                </div>
                                {user.createdBy && (
                                    <div>
                                        <p className="text-sm text-gray-500">Created By</p>
                                        <p className="font-medium font-mono text-sm">{user.createdBy}</p>
                                    </div>
                                )}
                                {user.modifiedBy && (
                                    <div>
                                        <p className="text-sm text-gray-500">Last Modified By</p>
                                        <p className="font-medium font-mono text-sm">{user.modifiedBy}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* System Flags */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCheck className="h-5 w-5" />
                                    System Flags
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span>Modification Flag</span>
                                    {user.mod_flag ? (
                                        <Badge variant="secondary">Modified</Badge>
                                    ) : (
                                        <Badge variant="outline">Original</Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Deletion Flag</span>
                                    {user.del_flag ? (
                                        <Badge variant="destructive">Marked for Deletion</Badge>
                                    ) : (
                                        <Badge variant="default">Active</Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Leave Status</span>
                                    {user.onLeave ? (
                                        <Badge variant="secondary">On Leave</Badge>
                                    ) : (
                                        <Badge variant="default">Available</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
