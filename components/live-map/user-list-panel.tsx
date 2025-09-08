"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MapPin, Clock } from "lucide-react"
import type { User } from "@/lib/types"

interface UserListPanelProps {
  users: User[]
  selectedUser: string | null
  onSelectUser: (userId: string | null) => void
  autoFollow: boolean
  onToggleAutoFollow: (enabled: boolean) => void
}

const roleColors = {
  admin: "bg-red-500",
  moderator: "bg-yellow-500",
  worker: "bg-green-500",
}

const roleIcons = {
  admin: "👑",
  moderator: "👷‍♂️",
  worker: "🔨",
}

export function UserListPanel({
  users,
  selectedUser,
  onSelectUser,
  autoFollow,
  onToggleAutoFollow,
}: UserListPanelProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <h3 className="font-semibold">Active Users</h3>
          <Badge variant="secondary">{users.length}</Badge>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm">Auto Follow</span>
        <Switch checked={autoFollow} onCheckedChange={onToggleAutoFollow} />
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedUser === user.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => onSelectUser(selectedUser === user.id ? null : user.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={`text-white ${roleColors[user.role as keyof typeof roleColors]}`}>
                    {roleIcons[user.role as keyof typeof roleIcons]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{user.name}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        user.status === "online"
                          ? "bg-green-500"
                          : user.status === "away"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs capitalize">
                      {user.role}
                    </Badge>
                  </div>

                  {user.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {user.location.latitude.toFixed(4)}, {user.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(user.lastSeen).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No users connected</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
