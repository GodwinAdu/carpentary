"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  UserCheck, 
  UserX, 
  Download, 
  TrendingUp,
  Building,
  Calendar,
  Activity
} from "lucide-react"

interface UsersReportTabProps {
  data: any
  onExport: () => void
}

export function UsersReportTab({ data, onExport }: UsersReportTabProps) {
  if (!data) return null

  const activePercentage = data.totalUsers > 0 ? (data.activeUsers / data.totalUsers) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Users Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-500" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">{data.totalUsers}</div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5 text-green-500" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">{data.activeUsers}</div>
            <div className="space-y-2">
              <Progress value={activePercentage} className="h-2" />
              <p className="text-sm text-slate-600">{activePercentage.toFixed(1)}% of total users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserX className="h-5 w-5 text-red-500" />
              Inactive Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2">{data.inactiveUsers}</div>
            <div className="space-y-2">
              <Progress value={100 - activePercentage} className="h-2" />
              <p className="text-sm text-slate-600">{(100 - activePercentage).toFixed(1)}% of total users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Users by Department */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-500" />
                Users by Department
              </CardTitle>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <CardDescription>Distribution of users across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.usersByDepartment?.map((dept: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-medium">{dept._id || 'Unassigned'}</p>
                    <p className="text-sm text-slate-600">{dept.count} users</p>
                  </div>
                  <Badge variant="outline">{dept.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Most Active Users
            </CardTitle>
            <CardDescription>Users with highest activity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topActiveUsers?.slice(0, 5).map((user: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                      {user.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      {user.activityCount} activities
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">{user.department || 'No dept'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Recently Added Users
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>
          <CardDescription>Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentUsers?.map((user: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm">
                      {user.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status || 'active'}
                  </Badge>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}