import { fetchBuildingById } from '@/lib/actions/building.actions'
import { notFound } from 'next/navigation'
import BuildingDetailPage from './_components/building-detail'
import { currentUser } from '@/lib/helpers/session'
import { currentUserRole } from '@/lib/helpers/get-user-role'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: PageProps) {

  const { id } = await params;
  const [building,user,role] = await Promise.all([
    fetchBuildingById(id),
    currentUser(),
    currentUserRole()
  ])

  return <BuildingDetailPage building={building} user={user} role={role} />

}