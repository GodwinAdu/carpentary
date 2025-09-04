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
  Mail,
  Building2,
  Upload,
  FileText
} from "lucide-react"
import Link from "next/link"

interface StaffActivityViewProps {
  staff: any
  activitiesData: {
    activities: any[]
    pagination: {
      currentPage: number
      totalPages: number
      total: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  stats: any
}

export function StaffActivityView({ staff, activitiesData, stats }: StaffActivityViewProps) {
  const { activities, pagination } = activitiesData
  
  const mockActivities = [
    {
      id: 1,
      type: 'login',
      action: 'Logged into system',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: 'Office - Main Building',
      ip: '192.168.1.100',
      device: 'Desktop - Chrome'
    },
    {
      id: 2,
      type: 'profile_update',
      action: 'Updated profile information',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: 'Remote',
      ip: '10.0.0.50',
      device: 'Mobile - Safari'
    },
    {
      id: 3,
      type: 'building_access',
      action: 'Accessed Building Project #BLD-001',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: 'Site Office',
      ip: '192.168.1.105',
      device: 'Tablet - Chrome'
    },
    {
      id: 4,
      type: 'password_change',
      action: 'Changed account password',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      location: 'Office - Main Building',
      ip: '192.168.1.100',
      device: 'Desktop - Firefox'
    },
    {
      id: 5,
      type: 'email_verification',
      action: 'Verified email address',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      location: 'Remote',
      ip: '203.0.113.1',
      device: 'Mobile - Chrome'
    }
  ]

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

      <div className="grid lg:grid-cols-4 gap-4 lg:gap-6">
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
              <span>{pagination.total || displayActivities.length} activities logged</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              Activity Timeline
            </CardTitle>
            <CardDescription>Recent activities and system interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayActivities.map((activity) => (
                <div key={activity._id || activity.id} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{activity.action}</p>
                      {getActivityBadge(activity.type)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-slate-600">
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
            
            {pagination.totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-600">
                    Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} activities
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!pagination.hasPrev}
                      asChild={pagination.hasPrev}
                      className="px-3 py-2"
                    >
                      {pagination.hasPrev ? (
                        <Link href={`?page=${pagination.currentPage - 1}`}>Previous</Link>
                      ) : (
                        <span>Previous</span>
                      )}
                    </Button>
                    
                    <div className="hidden sm:flex items-center gap-1 mx-2">
                      {(() => {
                        const { currentPage, totalPages } = pagination
                        const pages = []
                        const showEllipsis = totalPages > 7
                        
                        if (!showEllipsis) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else {
                          if (currentPage <= 4) {
                            pages.push(1, 2, 3, 4, 5, '...', totalPages)
                          } else if (currentPage >= totalPages - 3) {
                            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
                          } else {
                            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
                          }
                        }
                        
                        return pages.map((pageNum, index) => {
                          if (pageNum === '...') {
                            return <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === currentPage ? "default" : "outline"}
                              size="sm"
                              asChild
                              className="w-10 h-10 p-0"
                            >
                              <Link href={`?page=${pageNum}`}>{pageNum}</Link>
                            </Button>
                          )
                        })
                      })()}
                    </div>
                    
                    <div className="sm:hidden text-sm text-slate-600 mx-3">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!pagination.hasNext}
                      asChild={pagination.hasNext}
                      className="px-3 py-2"
                    >
                      {pagination.hasNext ? (
                        <Link href={`?page=${pagination.currentPage + 1}`}>Next</Link>
                      ) : (
                        <span>Next</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(() => {
          const activityTypes = [
            { key: 'login', label: 'Logins', icon: UserCheck, color: 'green' },
            { key: 'logout', label: 'Logouts', icon: UserCheck, color: 'red' },
            { key: 'profile_update', label: 'Profile Updates', icon: Edit, color: 'blue' },
            { key: 'password_change', label: 'Password Changes', icon: Shield, color: 'amber' },
            { key: 'building_access', label: 'Building Access', icon: Eye, color: 'purple' },
            { key: 'building_create', label: 'Buildings Created', icon: Building2, color: 'indigo' },
            { key: 'building_update', label: 'Buildings Updated', icon: Building2, color: 'cyan' },
            { key: 'email_verification', label: 'Email Verifications', icon: Mail, color: 'teal' },
            { key: 'status_change', label: 'Status Changes', icon: Activity, color: 'orange' },
            { key: 'role_change', label: 'Role Changes', icon: Shield, color: 'pink' },
            { key: 'file_upload', label: 'File Uploads', icon: Upload, color: 'lime' },
            { key: 'report_generate', label: 'Reports Generated', icon: FileText, color: 'violet' },
            { key: 'system_access', label: 'System Access', icon: Activity, color: 'slate' }
          ]
          
          return activityTypes.map(({ key, label, icon: Icon, color }) => {
            const count = displayActivities.filter(activity => activity.type === key).length
            if (count === 0) return null
            
            return (
              <Card key={key}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-${color}-100`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${color}-600`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{label}</p>
                      <p className={`text-lg sm:text-2xl font-bold text-${color}-600`}>{count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }).filter(Boolean)
        })()
        }
      </div>
    </div>
  )
}
