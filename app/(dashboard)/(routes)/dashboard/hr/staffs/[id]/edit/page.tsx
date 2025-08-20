import { fetchUserById } from '@/lib/actions/user.actions'
import { EditStaffForm } from '../../_components/edit-staff-form'
import { notFound } from 'next/navigation'

interface EditStaffPageProps {
  params: { id: string }
}

const EditStaffPage = async ({ params }: EditStaffPageProps) => {
  try {
    const staff = await fetchUserById(params.id)
    
    if (!staff) {
      notFound()
    }

    return <EditStaffForm staff={staff} />
  } catch (error) {
    notFound()
  }
}

export default EditStaffPage