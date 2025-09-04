import { fetchUserById } from '@/lib/actions/user.actions'
import { fetchUserActivities, getActivityStats } from '@/lib/actions/activity.actions'
import { StaffActivityView } from '../../_components/staff-activity-view'
import { notFound } from 'next/navigation'

interface StaffActivityPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

const StaffActivityPage = async ({ params, searchParams }: StaffActivityPageProps) => {
  try {
    const { id } = await params
    const { page } = await searchParams
    const currentPage = parseInt(page || '1', 10)
    
    const [staff, activitiesData, stats] = await Promise.all([
      fetchUserById(id),
      fetchUserActivities(id, currentPage),
      getActivityStats(id)
    ])

    if (!staff) {
      notFound()
    }

    return <StaffActivityView staff={staff} activitiesData={activitiesData} stats={stats} />
  } catch (error) {
    notFound()
  }
}

export default StaffActivityPage