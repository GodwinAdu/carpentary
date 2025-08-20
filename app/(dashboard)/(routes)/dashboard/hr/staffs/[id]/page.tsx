import { fetchUserById } from '@/lib/actions/user.actions'
import { fetchTodosByUserId } from '@/lib/actions/todo.actions'
import { StaffDetailView } from '../_components/staff-detail-view'
import { notFound } from 'next/navigation'

interface StaffDetailPageProps {
  params: { id: string }
}

const StaffDetailPage = async ({ params }: StaffDetailPageProps) => {
  try {
    const [staff, todos] = await Promise.all([
      fetchUserById(params.id),
      fetchTodosByUserId(params.id)
    ])
    
    if (!staff) {
      notFound()
    }

    return <StaffDetailView staff={staff} todos={todos} />
  } catch (error) {
    notFound()
  }
}

export default StaffDetailPage