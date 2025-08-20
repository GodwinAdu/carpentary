"use client"

import { AlertTriangle, Package, Clock, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { fetchUserActivities } from "@/lib/actions/activity.actions"
import { format } from "date-fns"

interface OverdueActivity {
    _id: string;
    title: string;
    buildingId: {
        buildingType: string;
        clientName: string;
    };
    scheduledDate: string;
    status: string;
    priority: string;
    assignedTo: Array<{
        fullName: string;
    }>;
    daysOverdue: number;
}

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "critical":
        case "urgent":
            return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
        case "high":
            return "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
        case "medium":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
}

export function LowStockAlerts() {
    const [overdueActivities, setOverdueActivities] = useState<OverdueActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOverdueActivities = async () => {
            try {
                const activities = await fetchUserActivities('all'); // Pass 'all' or specific userId
                
                if (activities) {
                    const today = new Date();
                    const overdue = activities
                        .filter((activity: any) => {
                            const scheduledDate = new Date(activity.scheduledDate);
                            return scheduledDate < today && activity.status !== 'completed' && activity.status !== 'cancelled';
                        })
                        .map((activity: any) => {
                            const scheduledDate = new Date(activity.scheduledDate);
                            const daysOverdue = Math.ceil((today.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
                            
                            return {
                                _id: activity._id,
                                title: activity.title,
                                buildingId: activity.buildingId,
                                scheduledDate: activity.scheduledDate,
                                status: activity.status,
                                priority: activity.priority,
                                assignedTo: activity.assignedTo,
                                daysOverdue
                            };
                        })
                        .sort((a: OverdueActivity, b: OverdueActivity) => b.daysOverdue - a.daysOverdue)
                        .slice(0, 4);
                    
                    setOverdueActivities(overdue);
                }
            } catch (error) {
                console.error('Error loading overdue activities:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadOverdueActivities();
    }, []);

    if (loading) {
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900">
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        Overdue Tasks
                    </CardTitle>
                    <CardDescription>Activities that need immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse p-3 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
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
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    Overdue Tasks
                </CardTitle>
                <CardDescription>Activities that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {overdueActivities.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 w-fit mx-auto mb-3">
                            <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">No overdue activities!</p>
                        <p className="text-xs text-muted-foreground mt-1">All tasks are on track.</p>
                    </div>
                ) : (
                    overdueActivities.map((activity) => (
                        <div
                            key={activity._id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                                    <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">{activity.title}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        {activity.buildingId?.buildingType}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Due: {format(new Date(activity.scheduledDate), "MMM d, yyyy")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Assigned: {activity.assignedTo[0]?.fullName || "Unassigned"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right space-y-2">
                                <Badge className={getPriorityColor(activity.priority)}>
                                    {activity.daysOverdue} days overdue
                                </Badge>
                                <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                                    Reschedule
                                </Button>
                            </div>
                        </div>
                    ))
                )}
                {overdueActivities.length > 0 && (
                    <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
                        View All Overdue
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
