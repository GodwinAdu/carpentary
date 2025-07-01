import Heading from '@/components/commons/Header'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const page = async () => {

    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title='Manage Building Tracking' />
                <Link href="/dashboard/manage-building/create" className={cn(buttonVariants({ size: "sm" }))}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New
                </Link>
            </div>
            <Separator />
        </>
    )
}

export default page