"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { addMemberToDepartment } from "@/lib/actions/department.actions"
import { fetchAllUsers } from "@/lib/actions/user.actions"

interface AddMemberDialogProps {
  departmentId: string
  existingMemberIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface User {
  _id: string
  fullName: string
  email: string
  jobTitle?: string
  avatarUrl?: string
  status: string
}

export function AddMemberDialog({ 
  departmentId, 
  existingMemberIds,
  open, 
  onOpenChange, 
  onSuccess 
}: AddMemberDialogProps) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const allUsers = await fetchAllUsers()
      // Filter out users who are already members
      const availableUsers = allUsers.filter(
        (user: User) => !existingMemberIds.includes(user._id) && user.status === 'active'
      )
      setUsers(availableUsers)
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) {
      toast.error("Please select a user to add")
      return
    }

    setLoading(true)
    try {
      await addMemberToDepartment(departmentId, selectedUserId)
      toast.success("Member added successfully")
      onSuccess()
      onOpenChange(false)
      setSelectedUserId("")
    } catch (error: any) {
      toast.error(error.message || "Failed to add member")
    } finally {
      setLoading(false)
    }
  }

  const selectedUser = users.find(user => user._id === selectedUserId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Select a user to add to this department.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user">Select User</Label>
              {loadingUsers ? (
                <div className="text-sm text-slate-600">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-sm text-slate-600">No available users to add</div>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                            <AvatarFallback className="text-xs">
                              {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-xs text-slate-600">{user.email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {selectedUser && (
              <div className="p-3 border rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.fullName} />
                    <AvatarFallback>
                      {selectedUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.fullName}</p>
                    <p className="text-sm text-slate-600">{selectedUser.email}</p>
                    {selectedUser.jobTitle && (
                      <p className="text-xs text-slate-500">{selectedUser.jobTitle}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedUserId || users.length === 0}
            >
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}