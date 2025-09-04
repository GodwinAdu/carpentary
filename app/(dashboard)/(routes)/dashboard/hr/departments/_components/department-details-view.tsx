"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Users,
  Calendar,
  Edit,
  UserPlus,
  Mail,
  Briefcase,
  Clock
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { EditDepartmentDialog } from "./edit-department-dialog"
import { AddMemberDialog } from "./add-member-dialog"
import { useRouter } from "next/navigation"

interface Department {
  _id: string
  name: string
  description?: string
  members: Array<{
    _id: string
    fullName: string
    email: string
    jobTitle?: string
    avatarUrl?: string
    isActive: boolean
  }>
  createdBy: {
    _id: string
    fullName: string
    email: string
  }
  modifiedBy?: {
    _id: string
    fullName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface DepartmentDetailsViewProps {
  department: Department
}

export function DepartmentDetailsView({ department }: DepartmentDetailsViewProps) {
  const router = useRouter()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)

  const activeMembers = department.members.filter(member => member.isActive)
  const inactiveMembers = department.members.filter(member => !member.isActive)

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/hr/departments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Departments
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{department.name}</h1>
            <p className="text-slate-600">Department Details</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Department
          </Button>
          <Button onClick={() => setAddMemberDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Department Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Department Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Name</label>
              <p className="text-lg font-semibold">{department.name}</p>
            </div>

            {department.description && (
              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <p className="text-slate-900">{department.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-600">Total Members</label>
              <p className="text-2xl font-bold text-blue-600">{department.members.length}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Active Members</label>
              <p className="text-2xl font-bold text-green-600">{activeMembers.length}</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>Created {format(new Date(department.createdAt), 'PPP')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>Updated {format(new Date(department.updatedAt), 'PPP')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-slate-500" />
                <span>Created by {department.createdBy.fullName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Department Members ({department.members.length})
              </span>
              <Button size="sm" onClick={() => setAddMemberDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </CardTitle>
            <CardDescription>
              Manage department members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {department.members.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No members yet</h3>
                <p className="text-slate-600 mb-4">Start building your team by adding members to this department.</p>
                <Button onClick={() => setAddMemberDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Member
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Members */}
                {activeMembers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                      Active Members ({activeMembers.length})
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Active
                      </Badge>
                    </h4>
                    <div className="space-y-3">
                      {activeMembers.map((member) => (
                        <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">{member.fullName}</p>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </span>
                                {member.jobTitle && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    {member.jobTitle}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Active
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inactive Members */}
                {inactiveMembers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                      Inactive Members ({inactiveMembers.length})
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        Inactive
                      </Badge>
                    </h4>
                    <div className="space-y-3">
                      {inactiveMembers.map((member) => (
                        <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 opacity-75">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                              <AvatarFallback className="bg-gradient-to-r from-slate-400 to-slate-500 text-white">
                                {member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-700">{member.fullName}</p>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </span>
                                {member.jobTitle && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    {member.jobTitle}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                              Inactive
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <EditDepartmentDialog
        department={department}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />
      
      <AddMemberDialog
        departmentId={department._id}
        existingMemberIds={department.members.map(m => m._id)}
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}