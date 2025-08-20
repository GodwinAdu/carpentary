"use client"

import { ArrowDownIcon, ArrowUpIcon, DollarSign, Package, ShoppingCart, TrendingUp, Users, Target, Building2, Activity, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { fetchAllBuilding } from "@/lib/actions/building.actions"
import { getActivityStats } from "@/lib/actions/activity.actions"

interface MetricData {
    title: string;
    value: string;
    change: string;
    changeType: "positive" | "negative";
    icon: any;
    description: string;
    gradient: string;
    bgGradient: string;
}

export function MetricsCards() {
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const [buildings, activityStats] = await Promise.all([
                    fetchAllBuilding(),
                    getActivityStats()
                ]);

                const buildingCount = buildings?.length || 0;
                const completionRate = activityStats?.total > 0 
                    ? Math.round((activityStats.completed / activityStats.total) * 100)
                    : 0;
                const totalCost = activityStats?.totalEstimatedCost || 0;
                const actualCost = activityStats?.totalActualCost || 0;
                const costSavings = totalCost > 0 
                    ? Math.round(((totalCost - actualCost) / totalCost) * 100)
                    : 0;

                setMetrics([
                    {
                        title: "Total Buildings",
                        value: buildingCount.toString(),
                        change: "+2.1%",
                        changeType: "positive",
                        icon: Building2,
                        description: "vs last month",
                        gradient: "from-blue-500 to-cyan-600",
                        bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
                    },
                    {
                        title: "Total Activities",
                        value: (activityStats?.total || 0).toString(),
                        change: "+12.5%",
                        changeType: "positive",
                        icon: Activity,
                        description: "vs last month",
                        gradient: "from-green-500 to-emerald-600",
                        bgGradient: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
                    },
                    {
                        title: "Completion Rate",
                        value: `${completionRate}%`,
                        change: "+8.2%",
                        changeType: "positive",
                        icon: Target,
                        description: "vs last month",
                        gradient: "from-purple-500 to-pink-600",
                        bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950",
                    },
                    {
                        title: "Active Workers",
                        value: (activityStats?.inProgress || 0).toString(),
                        change: "+15.3%",
                        changeType: "positive",
                        icon: Users,
                        description: "currently working",
                        gradient: "from-indigo-500 to-purple-600",
                        bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950",
                    },
                    {
                        title: "Cost Savings",
                        value: `${costSavings}%`,
                        change: "+3.2%",
                        changeType: "positive",
                        icon: DollarSign,
                        description: "vs estimated",
                        gradient: "from-teal-500 to-green-600",
                        bgGradient: "from-teal-50 to-green-50 dark:from-teal-950 dark:to-green-950",
                    },
                    {
                        title: "Overdue Tasks",
                        value: (activityStats?.overdue || 0).toString(),
                        change: "-2.1%",
                        changeType: activityStats?.overdue > 0 ? "negative" : "positive",
                        icon: AlertTriangle,
                        description: "need attention",
                        gradient: "from-orange-500 to-red-600",
                        bgGradient: "from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950",
                    },
                ]);
            } catch (error) {
                console.error('Error loading metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();
    }, []);

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric, index) => (
                <Card
                    key={metric.title}
                    className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-float bg-gradient-to-br ${metric.bgGradient}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.gradient} shadow-lg`}>
                            <metric.icon className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-2">{metric.value}</div>
                        <div className="flex items-center text-sm">
                            <span
                                className={`flex items-center font-medium ${metric.changeType === "positive"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                            >
                                {metric.changeType === "positive" ? (
                                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                                ) : (
                                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                                )}
                                {metric.change}
                            </span>
                            <span className="ml-2 text-muted-foreground">{metric.description}</span>
                        </div>
                    </CardContent>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
                </Card>
            ))}
        </div>
    )
}
