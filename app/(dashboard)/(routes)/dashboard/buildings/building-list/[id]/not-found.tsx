import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Building } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Building className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <CardTitle className="text-2xl">Building Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            The building you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard/buildings/building-list">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buildings
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}