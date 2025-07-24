"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2 } from "lucide-react";
import { CellAction } from "@/components/table/cell-action";


const handleDelete = async (id: string): Promise<void> => {
    try {
        // await deleteBuilding(id)
        console.log("Item deleted successfully")
    } catch (error) {
        console.error("Delete error:", error)
        throw error // Re-throw to let CellAction handle the error
    }
}

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "fullName",
        header: "Full Name",
        cell: ({ row }) => {
            const name = row.original.fullName;
            return (
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src="" alt={name} />
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p>{name}</p>
                </div>
            );
        }
    },
    {
        accessorKey: "email",
        header: "Email Address",
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone Number",
    },
    {
        id: "actions",
        cell: ({ row }) =>
            <CellAction
                data={row.original}
                onDelete={handleDelete}
                actions={[
                    {
                        label: "Edit",
                        type: "edit",
                        href: `/dashboard/hr//${row.original._id}`,
                        icon: <Edit className="h-4 w-4" />,
                        // permissionKey: "editUser",
                    },
                    {
                        label: "Delete",
                        type: "delete",
                        icon: <Trash2 className="h-4 w-4" />,
                        // permissionKey: "deleteUser",
                    },
                ]}
            />
    },
];
