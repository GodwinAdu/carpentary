import { fetchUserById } from '@/lib/actions/user.actions'
import { fetchUserActivities, getActivityStats } from '@/lib/actions/activity.actions'
import { StaffActivityView } from '../../_components/staff-activity-view'
import { notFound } from 'next/navigation'

interface StaffActivityPageProps {
  params:Promise< { id: string }>
}

const StaffActivityPage = async ({ params }: StaffActivityPageProps) => {
  try {
    const {id} =await params
    const [staff, activities, stats] = await Promise.all([
      fetchUserById(id),
      fetchUserActivities(id),
      getActivityStats(id)
    ])
    
    if (!staff) {
      notFound()
    }

    return <StaffActivityView staff={staff} activities={activities} stats={stats} />
  } catch (error) {
    notFound()
  }
}

export default StaffActivityPage