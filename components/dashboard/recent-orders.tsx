"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal, MapPin } from "lucide-react"
import { useEffect, useState } from "react"

import { format, isValid } from "date-fns"
import { fetchUserActivities } from "@/lib/actions/activity.actions"

interface RecentActivity {
    _id: string;
    userId: string;
    type: string;
    action: string;
    details?: {
        entityId?: string;
        entityType?: string;
        oldValue?: string;
        newValue?: string;
        metadata?: any;
    };
    ipAddress: string;
    userAgent: string;
    location: string;
    device: string;
    success: boolean;
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
}

const getTypeColor = (type: string) => {
    switch (type) {
        case "login":
            return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
        case "building_create":
        case "building_update":
            return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
        case "profile_update":
            return "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
        case "password_change":
            return "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
        case "logout":
            return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
        default:
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
    }
}

const formatSafeDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return isValid(date) ? format(date, "MMM d, yyyy") : "N/A"
}

export function RecentOrders() {
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadActivities = async () => {
            try {
                const data = await fetchUserActivities();
                setActivities((data || []).slice(0, 5));
            } catch (error) {
                console.error('Error loading activities:', error);
            } finally {
                setLoading(false);
            }
        };
        loadActivities();
    }, []);

    if (loading) {
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Recent Activities</CardTitle>
                    <CardDescription>Latest worker activities and their status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 animate-pulse">
                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">Recent Activities</CardTitle>
                        <CardDescription>Latest worker activities and their status</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Eye className="h-4 w-4" />
                        View All
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50">
                            <TableHead>Type</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity) => (
                            <TableRow key={activity._id} className="border-border/50 hover:bg-muted/30">
                                <TableCell>
                                    <Badge className={getTypeColor(activity.type)}>
                                        {activity.type.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{activity.action}</div>
                                    {activity.details?.entityType && (
                                        <div className="text-sm text-muted-foreground">
                                            {activity.details.entityType}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{activity.device}</div>
                                    <div className="text-sm text-muted-foreground">{activity.ipAddress}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {activity.location}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={activity.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                        {activity.success ? "SUCCESS" : "FAILED"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatSafeDate(activity.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
