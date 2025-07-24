import Heading from '@/components/commons/Header'
import { DataTable } from '@/components/table/data-table'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { fetchAllBuilding } from '@/lib/actions/building.actions'
import { cn } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { columns } from './_components/column'

const page = async () => {

    const buildings = await fetchAllBuilding()

    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title='Manage Building Tracking' />
                <Link href="manage-building/create" className={cn(buttonVariants({ size: "sm" }))}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New
                </Link>
            </div>
            <Separator />
            <div className="py-4">
                <DataTable searchKey='buildingType' columns={columns} data={buildings} />
            </div>
        </>
    )
}

export default page