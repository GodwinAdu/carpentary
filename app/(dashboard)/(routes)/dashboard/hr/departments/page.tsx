import Heading from '@/components/commons/Header'
import React from 'react'
import { DepartmentModal } from './_components/DepartmentModal'
import { Separator } from '@/components/ui/separator'

import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/column'
import { fetchAllDepartments } from '@/lib/actions/department.actions'
import { currentUserRole } from '@/lib/helpers/get-user-role'


// type Params = Promise<{ branchId: string }>
const page = async () => {

  const [data,role] = await Promise.all([
    fetchAllDepartments(),
    currentUserRole()
 
  ])

  console.log(data)

  return (
    <>
      <div className="flex justify-between items-center px-3">
        <Heading title="Manage Department" />
        <div className="flex gap-4">
          {role?.permissions?.addDepartment && (
            <DepartmentModal />
          )}
        </div>
      </div>
      <Separator />
      <div className="py-4">
        <DataTable searchKey='name' data={data} columns={columns} />
      </div>
    </>
  )
}

export default page
