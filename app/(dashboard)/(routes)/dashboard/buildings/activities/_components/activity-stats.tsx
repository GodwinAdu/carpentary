"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
} from "lucide-react";

interface ActivityStatsProps {
  stats: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    overdue: number;
    cancelled: number;
    avgProgress: number;
    totalEstimatedCost: number;
    totalActualCost: number;
  };
}

export default function ActivityStats({ stats }: ActivityStatsProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const costEfficiency = stats.totalEstimatedCost > 0 
    ? Math.round(((stats.totalEstimatedCost - stats.totalActualCost) / stats.totalEstimatedCost) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="flex gap-2 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {stats.scheduled} Scheduled
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              {stats.inProgress} Active
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <Progress value={completionRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.completed} of {stats.total} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(stats.avgProgress)}%</div>
          <Progress value={stats.avgProgress} className="mt-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span className="text-red-600">{stats.overdue} Overdue</span>
            <span className="text-green-600">{stats.completed} Done</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {costEfficiency > 0 ? '+' : ''}{costEfficiency}%
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            <div>Est: ${stats.totalEstimatedCost.toLocaleString()}</div>
            <div>Act: ${stats.totalActualCost.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}