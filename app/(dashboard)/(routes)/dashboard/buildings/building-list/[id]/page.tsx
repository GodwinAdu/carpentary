import { fetchBuildingById } from '@/lib/actions/building.actions'
import { notFound } from 'next/navigation'
import BuildingDetailPage from './_components/building-detail'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: PageProps) {

  const { id } = await params;
  const building = await fetchBuildingById(id)
  console.log(building, "building")

  return <BuildingDetailPage building={building} />

}