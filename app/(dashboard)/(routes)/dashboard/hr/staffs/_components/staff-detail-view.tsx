"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Edit, 
  ArrowLeft,
  Shield,
  Clock,
  Building,
  CheckSquare,
  Flag,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

interface StaffDetailViewProps {
  staff: any
  todos: any[]
}

export function StaffDetailView({ staff, todos }: StaffDetailViewProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/hr/staffs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff List
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Staff Details</h1>
            <p className="text-slate-600">View and manage staff information</p>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
          <Link href={`/dashboard/hr/staffs/${staff._id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Staff
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={staff.avatarUrl} alt={staff.fullName} />
              <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xl font-bold">
                {staff.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{staff.fullName}</CardTitle>
            <CardDescription>{staff.jobTitle || 'Staff Member'}</CardDescription>
            <div className="flex justify-center gap-2 mt-2">
              <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                {staff.status || 'active'}
              </Badge>
              <Badge variant="outline">{staff.role || 'Staff'}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Contact Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-slate-600">{staff.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-slate-600">{staff.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Emergency Contact</p>
                  <p className="text-sm text-slate-600">{staff.emergencyNumber || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-slate-600">
                    {staff.address ? 
                      `${staff.address.street}, ${staff.address.city}, ${staff.address.state}` : 
                      'Not provided'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-500" />
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-slate-600">{staff.department || 'General'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Work Location</p>
                  <p className="text-sm text-slate-600">{staff.workLocation || 'On-site'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Join Date</p>
                  <p className="text-sm text-slate-600">
                    {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Last Active</p>
                  <p className="text-sm text-slate-600">
                    {staff.lastActive ? new Date(staff.lastActive).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Username</p>
              <p className="text-sm text-slate-600">{staff.username}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">User Type</p>
              <p className="text-sm text-slate-600">{staff.userType || 'Worker'}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Account Status</p>
              <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                {staff.status || 'Active'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Todos Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-purple-500" />
            Recent Todos
          </CardTitle>
          <CardDescription>
            Current tasks and assignments for {staff.fullName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todos.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">No todos assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todos.slice(0, 5).map((todo) => (
                <div key={todo._id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${todo.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                        {todo.title}
                      </h4>
                      <Badge className={getPriorityColor(todo.priority)}>
                        <Flag className="h-3 w-3 mr-1" />
                        {todo.priority}
                      </Badge>
                    </div>
                    {todo.description && (
                      <p className="text-sm text-slate-600 truncate">{todo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <Badge className={getStatusColor(todo.status)}>
                        {todo.status.replace('_', ' ')}
                      </Badge>
                      {todo.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {todo.progress > 0 && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {todo.progress}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {todos.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-slate-500">+{todos.length - 5} more todos</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bio Section */}
      {staff.bio && (
        <Card>
          <CardHeader>
            <CardTitle>Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{staff.bio}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}