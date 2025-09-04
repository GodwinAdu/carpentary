"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge";
import { CellAction } from "@/components/table/cell-action";
import { Edit, Trash2 } from "lucide-react";
import { deleteBuilding } from "@/lib/actions/building.actions";

interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  under_review: { label: "Under Review", className: "bg-blue-100 text-blue-800" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800" },
  payment_started: { label: "Payment Started", className: "bg-indigo-100 text-indigo-800" },
  partially_paid: { label: "Partially Paid", className: "bg-orange-100 text-orange-800" },
  fully_paid: { label: "Fully Paid", className: "bg-emerald-100 text-emerald-800" },
  in_progress: { label: "In Progress", className: "bg-cyan-100 text-cyan-800" },
  completed: { label: "Completed", className: "bg-green-200 text-green-900" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
  archived: { label: "Archived", className: "bg-gray-200 text-gray-800" },
};

const handleDelete = async (id: string): Promise<void> => {
  try {
    await deleteBuilding(id)
    console.log("Item deleted successfully")
  } catch (error) {
    console.error("Delete error:", error)
    throw error // Re-throw to let CellAction handle the error
  }
}


export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badge = statusMap[status];
  console.log(status, "testing status")

  return (
    <Badge className={badge?.className ?? "bg-gray-100 text-gray-700"}>
      {badge?.label ?? status}
    </Badge>
  );
};

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "buildingType",
    header: "Building Type",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "clientName",
    header: "Client Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.status} />
    )
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
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
            href: `/dashboard/buildings/manage-building/${row.original._id}`,
            icon: <Edit className="h-4 w-4" />,
            permissionKey: "editBuilding",
          },
          {
            label: "Delete",
            type: "delete",
            icon: <Trash2 className="h-4 w-4" />,
            permissionKey: "deleteBuilding",
          },
        ]}
      />
  },
];
