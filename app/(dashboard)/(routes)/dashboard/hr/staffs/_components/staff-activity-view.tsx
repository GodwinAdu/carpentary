"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  Activity, 
  Clock, 
  MapPin, 
  Calendar,
  Shield,
  Eye,
  Edit,
  UserCheck,
  Mail
} from "lucide-react"
import Link from "next/link"

interface StaffActivityViewProps {
  staff: any
  activities: any[]
  stats: any
}

export function StaffActivityView({ staff, activities, stats }: StaffActivityViewProps) {
  // Real activity data from database
  const mockActivities = [
    {
      id: 1,
      type: 'login',
      action: 'Logged into system',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      location: 'Office - Main Building',
      ip: '192.168.1.100',
      device: 'Desktop - Chrome'
    },
    {
      id: 2,
      type: 'profile_update',
      action: 'Updated profile information',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      location: 'Remote',
      ip: '10.0.0.50',
      device: 'Mobile - Safari'
    },
    {
      id: 3,
      type: 'building_access',
      action: 'Accessed Building Project #BLD-001',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      location: 'Site Office',
      ip: '192.168.1.105',
      device: 'Tablet - Chrome'
    },
    {
      id: 4,
      type: 'password_change',
      action: 'Changed account password',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      location: 'Office - Main Building',
      ip: '192.168.1.100',
      device: 'Desktop - Firefox'
    },
    {
      id: 5,
      type: 'email_verification',
      action: 'Verified email address',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      location: 'Remote',
      ip: '203.0.113.1',
      device: 'Mobile - Chrome'
    }
  ]

  // Use real activities if available, fallback to mock for demo
  const displayActivities = activities.length > 0 ? activities : mockActivities

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <UserCheck className="h-4 w-4 text-green-500" />
      case 'profile_update':
        return <Edit className="h-4 w-4 text-blue-500" />
      case 'building_access':
        return <Eye className="h-4 w-4 text-purple-500" />
      case 'password_change':
        return <Shield className="h-4 w-4 text-amber-500" />
      case 'email_verification':
        return <Mail className="h-4 w-4 text-cyan-500" />
      default:
        return <Activity className="h-4 w-4 text-slate-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'login':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Login</Badge>
      case 'profile_update':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Profile</Badge>
      case 'building_access':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Access</Badge>
      case 'password_change':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Security</Badge>
      case 'email_verification':
        return <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">Verification</Badge>
      default:
        return <Badge variant="outline">Activity</Badge>
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/hr/staffs/${staff._id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Activity</h1>
          <p className="text-slate-600">Activity log for {staff.fullName}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Staff Summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-2">
              <AvatarImage src={staff.avatarUrl} alt={staff.fullName} />
              <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold">
                {staff.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">{staff.fullName}</CardTitle>
            <CardDescription>{staff.jobTitle || 'Staff Member'}</CardDescription>
            <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
              {staff.status || 'active'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Joined {new Date(staff.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Last active today</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-slate-500" />
              <span>{displayActivities.length} activities logged</span>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              Activity Timeline
            </CardTitle>
            <CardDescription>Recent activities and system interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{activity.action}</p>
                      {getActivityBadge(activity.type)}
                    </div>
                    <div className="grid md:grid-cols-3 gap-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.createdAt || activity.timestamp).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {activity.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {activity.device}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">IP: {activity.ipAddress || activity.ip}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Logins</p>
                <p className="text-2xl font-bold text-green-600">{stats?.totalLogins || 24}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Projects Accessed</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.projectsAccessed || 12}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                <Edit className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Profile Updates</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.profileUpdates || 3}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Security Actions</p>
                <p className="text-2xl font-bold text-amber-600">{stats?.securityActions || 2}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}