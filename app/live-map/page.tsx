import { LiveMap } from "@/components/live-map/live-map"
import { createRole } from "@/lib/actions/role.actions"

export default async function LiveMapPage() {
  await createRole()
  return (
    <div className="h-screen w-full">
      <LiveMap />
    </div>
  )
}
