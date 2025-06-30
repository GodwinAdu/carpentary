import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Card } from "@/components/ui/card"

// Dynamically import the map component to avoid SSR issues
const AdvancedMap = dynamic(() => import("@/components/map/advanced-map"), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex items-center justify-center">
            <Card className="p-6">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <div>
                        <div className="font-medium">Loading Advanced Map</div>
                        <div className="text-sm text-muted-foreground">Initializing satellite imagery and features...</div>
                    </div>
                </div>
            </Card>
        </div>
    ),
})

export default function MapPage() {
    return (
        <div className="h-screen w-full">
            <Suspense
                fallback={
                    <div className="h-screen flex items-center justify-center">
                        <Card className="p-6">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <div>
                                    <div className="font-medium">Loading Map Application</div>
                                    <div className="text-sm text-muted-foreground">
                                        Please wait while we load the advanced mapping features...
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                }
            >
                <AdvancedMap />
            </Suspense>
        </div>
    )
}
