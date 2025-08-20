"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
    Edit, 
    Trash2, 
    Eye, 
    UserX, 
    UserCheck, 
    Key, 
    Mail, 
    Shield, 
    Clock,
    MapPin
} from "lucide-react";
import { CellAction } from "@/components/table/cell-action";
import { toast } from "sonner";
import { deleteStaff, updateUserStatus, resetUserPassword, sendInviteEmail } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";


const handleDelete = async (id: string): Promise<void> => {
    try {
        await deleteStaff(id)
    } catch (error) {
        console.error("Delete error:", error)
        throw error
    }
}

const handleDeactivate = async (staff: any) => {
    try {
        const result = await updateUserStatus(staff._id, 'inactive')
        if (result.success) {
            toast.success(`${staff.fullName} has been deactivated`)
        }
    } catch (error) {
        toast.error("Failed to deactivate staff")
    }
}

const handleActivate = async (staff: any) => {
    try {
        const result = await updateUserStatus(staff._id, 'active')
        if (result.success) {
            toast.success(`${staff.fullName} has been activated`)
        }
    } catch (error) {
        toast.error("Failed to activate staff")
    }
}

const handleResetPassword = async (staff: any) => {
    try {
        const result = await resetUserPassword(staff._id)
        if (result.success) {
            toast.success(`Password reset email sent to ${staff.email}`)
        }
    } catch (error) {
        toast.error("Failed to send password reset")
    }
}

const handleSendInvite = async (staff: any) => {
    try {
        const result = await sendInviteEmail(staff._id)
        if (result.success) {
            toast.success(`Invitation sent to ${staff.email}`)
        }
    } catch (error) {
        toast.error("Failed to send invitation")
    }
}

const handleViewActivity = (staff: any) => {
    window.open(`/dashboard/hr/staffs/${staff._id}/activity`, '_blank')
}

const handleTrackLocation = (staff: any) => {
    window.open(`/live-map?user=${staff._id}`, '_blank')
}

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "fullName",
        header: "Staff Member",
        cell: ({ row }) => {
            const name = row.original.fullName;
            const role = row.original.role || "Staff";
            const status = row.original.status || "active";
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={row.original.avatar} alt={name} />
                        <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
                            {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-slate-900">{name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{role}</Badge>
                            <Badge 
                                variant={status === 'active' ? 'default' : 'secondary'}
                                className={`text-xs ${
                                    status === 'active' 
                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                        : 'bg-red-100 text-red-700 border-red-200'
                                }`}
                            >
                                {status}
                            </Badge>
                        </div>
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: "email",
        header: "Contact Info",
        cell: ({ row }) => {
            const email = row.original.email;
            const phone = row.original.phoneNumber;
            return (
                <div className="space-y-1">
                    <p className="text-sm font-medium">{email}</p>
                    <p className="text-xs text-slate-500">{phone}</p>
                </div>
            );
        }
    },
    {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => {
            const dept = row.original.department || "General";
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {dept}
                </Badge>
            );
        }
    },
    {
        accessorKey: "lastActive",
        header: "Last Active",
        cell: ({ row }) => {
            const lastActive = row.original.lastActive || new Date();
            const timeAgo = new Date(lastActive).toLocaleDateString();
            return (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-3 w-3" />
                    {timeAgo}
                </div>
            );
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const staff = row.original;
            const isActive = staff.status === 'active';
            
            return (
                <CellAction
                    data={staff}
                    onDelete={handleDelete}
                    actions={[
                        {
                            label: "View Details",
                            type: "view",
                            href: `/dashboard/hr/staffs/${staff._id}`,
                            icon: <Eye className="h-4 w-4" />,
                        },
                        {
                            label: "Edit Profile",
                            type: "edit",
                            href: `/dashboard/hr/staffs/${staff._id}/edit`,
                            icon: <Edit className="h-4 w-4" />,
                        },
                        {
                            label: isActive ? "Deactivate" : "Activate",
                            type: "custom",
                            onClick: isActive ? handleDeactivate : handleActivate,
                            icon: isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />,
                        },
                        {
                            label: "Reset Password",
                            type: "custom",
                            onClick: handleResetPassword,
                            icon: <Key className="h-4 w-4" />,
                        },
                        {
                            label: "Send Invite",
                            type: "custom",
                            onClick: handleSendInvite,
                            icon: <Mail className="h-4 w-4" />,
                        },
                        {
                            label: "View Activity",
                            type: "custom",
                            onClick: handleViewActivity,
                            icon: <Shield className="h-4 w-4" />,
                        },
                        {
                            label: "Track Location",
                            type: "custom",
                            onClick: handleTrackLocation,
                            icon: <MapPin className="h-4 w-4" />,
                        },
                        {
                            label: "Delete Staff",
                            type: "delete",
                            icon: <Trash2 className="h-4 w-4" />,
                        },
                    ]}
                />
            )
        }
    },
];
