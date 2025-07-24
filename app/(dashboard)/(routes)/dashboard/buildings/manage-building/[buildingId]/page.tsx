import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import CapturePage from '../_components/create-building-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { fetchBuildingById } from '@/lib/actions/building.actions'


const page = async ({ params }: { params: Promise<{ buildingId: string }> }) => {
    const { buildingId } = await params;
    const buildingData = await fetchBuildingById(buildingId);
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title='Update Building' />
                <Button variant="ghost" size="sm" asChild className="mr-4">
                    <Link href="/dashboard/manage-building">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                </Button>
            </div>
            <Separator />
            <div className="py-4">
                <CapturePage type="update" initialData={buildingData} />
            </div>
        </>
    )
}

export default page