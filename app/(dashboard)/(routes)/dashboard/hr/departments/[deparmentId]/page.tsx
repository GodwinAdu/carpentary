import { notFound } from "next/navigation"
import { fetchDepartmentById } from "@/lib/actions/department.actions"
import { DepartmentDetailsView } from "../_components/department-details-view"

interface DepartmentPageProps {
  params: Promise<{ deparmentId: string }>
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  try {
    const { deparmentId } = await params
    const department = await fetchDepartmentById(deparmentId)

    if (!department) {
      notFound()
    }

    return <DepartmentDetailsView department={department} />
  } catch (error) {
    console.error("Error loading department:", error)
    notFound()
  }
}