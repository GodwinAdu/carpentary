"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, UserCheck, UserX, Activity, Building2 } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchUserActivities } from "@/lib/actions/activity.actions"


interface WorkerStats {
    totalWorkers: number;
    activeWorkers: number;
    completedActivities: number;
    avgEfficiency: number;
}

interface TopWorker {
    name: string;
    email: string;
    activitiesCount: number;
    completionRate: number;
    avatar?: string;
    status: string;
}

export function UserAnalytics() {
    const [workerStats, setWorkerStats] = useState<WorkerStats>({
        totalWorkers: 0,
        activeWorkers: 0,
        completedActivities: 0,
        avgEfficiency: 0
    });
    const [topWorkers, setTopWorkers] = useState<TopWorker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWorkerAnalytics = async () => {
            try {
                const activities = await fetchUserActivities();

                if (activities) {
                    // Calculate worker statistics
                    const uniqueWorkers = new Set();
                    const activeWorkers = new Set();
                    const completedCount = activities.filter(a => a.status === 'completed').length;

                    const workerActivityCount: Record<string, { count: number; completed: number; worker: any }> = {};

                    activities.forEach(activity => {
                        activity.assignedTo?.forEach(worker => {
                            uniqueWorkers.add(worker._id);
                            if (activity.status === 'in_progress') {
                                activeWorkers.add(worker._id);
                            }

                            if (!workerActivityCount[worker._id]) {
                                workerActivityCount[worker._id] = {
                                    count: 0,
                                    completed: 0,
                                    worker
                                };
                            }
                            workerActivityCount[worker._id].count++;
                            if (activity.status === 'completed') {
                                workerActivityCount[worker._id].completed++;
                            }
                        });
                    });

                    // Get top workers
                    const topWorkersData = Object.values(workerActivityCount)
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 4)
                        .map(({ worker, count, completed }) => ({
                            name: worker.fullName,
                            email: worker.email,
                            activitiesCount: count,
                            completionRate: count > 0 ? Math.round((completed / count) * 100) : 0,
                            avatar: worker.avatarUrl,
                            status: completed / count > 0.8 ? 'Excellent' : completed / count > 0.6 ? 'Good' : 'Average'
                        }));

                    setWorkerStats({
                        totalWorkers: uniqueWorkers.size,
                        activeWorkers: activeWorkers.size,
                        completedActivities: completedCount,
                        avgEfficiency: activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0
                    });

                    setTopWorkers(topWorkersData);
                }
            } catch (error) {
                console.error('Error loading worker analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        loadWorkerAnalytics();
    }, []);

    const stats = [
        {
            title: "Total Workers",
            value: workerStats.totalWorkers.toString(),
            change: "+5.2%",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900",
        },
        {
            title: "Active Workers",
            value: workerStats.activeWorkers.toString(),
            change: "+12.1%",
            icon: UserCheck,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900",
        },
        {
            title: "Completed Tasks",
            value: workerStats.completedActivities.toString(),
            change: "+18.3%",
            icon: Activity,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900",
        },
        {
            title: "Efficiency Rate",
            value: `${workerStats.avgEfficiency}%`,
            change: "+3.2%",
            icon: Building2,
            color: "text-orange-600",
            bgColor: "bg-orange-100 dark:bg-orange-900",
        },
    ];

    if (loading) {
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Worker Analytics</CardTitle>
                    <CardDescription>Worker performance and productivity insights</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Worker Analytics</CardTitle>
                <CardDescription>Worker performance and productivity insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.title} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs text-green-600 dark:text-green-400">{stat.change}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Top Performers</h4>
                    <div className="space-y-3">
                        {topWorkers.map((worker, index) => (
                            <div
                                key={worker.email}
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                                    <AvatarImage src={worker.avatar} />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                                        {worker.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium truncate">{worker.name}</p>
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs ${worker.status === "Excellent"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                : worker.status === "Good"
                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                                }`}
                                        >
                                            {worker.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{worker.email}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-muted-foreground">{worker.activitiesCount} activities</span>
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">{worker.completionRate}% completion</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold">#{index + 1}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
