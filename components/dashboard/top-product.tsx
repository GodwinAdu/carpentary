"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Building2 } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchAllBuilding } from "@/lib/actions/building.actions"

interface TopBuilding {
    _id: string;
    buildingType: string;
    clientName: string;
    totalPaidAmount: number;
    totalProjectCost: number;
    status: string;
    completionPercentage: number;
    trend: 'up' | 'down';
    change: string;
}

export function TopProducts() {
    const [topBuildings, setTopBuildings] = useState<TopBuilding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTopBuildings = async () => {
            try {
                const buildings = await fetchAllBuilding();
                
                if (buildings) {
                    const processedBuildings = buildings
                        .map((building: any) => {
                            const completionPercentage = building.totalProjectCost > 0 
                                ? Math.round((building.totalPaidAmount / building.totalProjectCost) * 100)
                                : 0;
                            
                            return {
                                _id: building._id,
                                buildingType: building.buildingType,
                                clientName: building.clientName,
                                totalPaidAmount: building.totalPaidAmount || 0,
                                totalProjectCost: building.totalProjectCost || 0,
                                status: building.status,
                                completionPercentage,
                                trend: Math.random() > 0.3 ? 'up' : 'down' as 'up' | 'down',
                                change: Math.random() > 0.3 ? `+${Math.floor(Math.random() * 15) + 1}%` : `-${Math.floor(Math.random() * 5) + 1}%`
                            };
                        })
                        .sort((a: TopBuilding, b: TopBuilding) => b.totalPaidAmount - a.totalPaidAmount)
                        .slice(0, 5);
                    
                    setTopBuildings(processedBuildings);
                }
            } catch (error) {
                console.error('Error loading top buildings:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadTopBuildings();
    }, []);

    if (loading) {
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Top Buildings</CardTitle>
                    <CardDescription>Highest value building projects</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse space-y-3 p-3 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="h-2 bg-gray-200 rounded"></div>
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
                <CardTitle className="text-lg font-bold">Top Buildings</CardTitle>
                <CardDescription>Highest value building projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {topBuildings.map((building, index) => (
                    <div key={building._id} className="space-y-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-sm">
                                #{index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{building.buildingType}</span>
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${building.trend === "up"
                                                ? "text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:text-green-400"
                                                : "text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:text-red-400"
                                            }`}
                                    >
                                        {building.trend === "up" ? (
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                        )}
                                        {building.change}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                                    <span>{building.clientName}</span>
                                    <span className="font-medium text-foreground">₵{building.totalPaidAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <Progress value={building.completionPercentage} className="h-2" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
