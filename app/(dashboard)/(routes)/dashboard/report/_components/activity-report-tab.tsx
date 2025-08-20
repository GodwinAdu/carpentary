"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Activity, 
  Download, 
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  Eye,
  Edit,
  UserCheck,
  Shield
} from "lucide-react"

interface ActivityReportTabProps {
  data: any
  onExport: () => void
}

export function ActivityReportTab({ data, onExport }: ActivityReportTabProps) {
  if (!data) return null

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="h-4 w-4 text-green-500" />
      case 'building_access': return <Eye className="h-4 w-4 text-blue-500" />
      case 'building_create': return <Edit className="h-4 w-4 text-purple-500" />
      case 'building_update': return <Edit className="h-4 w-4 text-orange-500" />
      case 'profile_update': return <Edit className="h-4 w-4 text-blue-500" />
      case 'password_change': return <Shield className="h-4 w-4 text-red-500" />
      case 'system_access': return <Activity className="h-4 w-4 text-slate-500" />
      default: return <Activity className="h-4 w-4 text-slate-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-green-100 text-green-700 border-green-200'
      case 'building_access': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'building_create': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'building_update': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'profile_update': return 'bg-cyan-100 text-cyan-700 border-cyan-200'
      case 'password_change': return 'bg-red-100 text-red-700 border-red-200'
      case 'system_access': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Activity Overview
          </CardTitle>
          <CardDescription>System activity breakdown by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.activitiesByType?.map((activity: any, index: number) => {
              const percentage = data.totalActivities > 0 ? (activity.count / data.totalActivities) * 100 : 0
              return (
                <div key={index} className="p-4 rounded-lg border bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    {getActivityIcon(activity._id)}
                    <span className="font-medium capitalize">{activity._id.replace('_', ' ')}</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">{activity.count}</div>
                  <div className="text-sm text-slate-600">{percentage.toFixed(1)}% of total</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Daily Activity Trend
              </CardTitle>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <CardDescription>Activity volume over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.dailyActivities?.slice(0, 10).map((day: any, index: number) => {
                const maxCount = Math.max(...data.dailyActivities.map((d: any) => d.count))
                const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{new Date(day._id).toLocaleDateString()}</span>
                      <Badge variant="outline">{day.count} activities</Badge>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activity Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Activity Types
            </CardTitle>
            <CardDescription>Detailed breakdown of activity types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.activitiesByType?.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity._id)}
                    <div>
                      <p className="font-medium capitalize">{activity._id.replace('_', ' ')}</p>
                      <p className="text-sm text-slate-600">{activity.count} occurrences</p>
                    </div>
                  </div>
                  <Badge className={getActivityColor(activity._id)}>
                    {activity.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Recent Activities
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentActivities?.map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{activity.action}</p>
                    <Badge className={getActivityColor(activity.type)}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={activity.userId?.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {activity.userId?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{activity.userId?.fullName || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(activity.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>IP: {activity.ipAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}