import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, MapPin, Calendar, Edit2Icon } from "lucide-react"
import Link from "next/link"
import { fetchAllBuilding } from "@/lib/actions/building.actions"
import build from "next/dist/build"
import { format } from "date-fns"

export default async function BuildingsPage() {

  const buildings = await fetchAllBuilding()
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buildings Lists</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage and organize your building records</p>
            </div>
          </div>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{buildings.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Buildings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold">C</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {buildings.filter((b) => b.category === "Commercial").length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Commercial</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-bold">R</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {buildings.filter((b) => b.category === "Residential").length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Residential</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-bold">P</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {buildings.filter((b) => b.category === "Public").length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Public</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buildings List */}
        <Card>
          <CardHeader>
            <CardTitle>All Buildings</CardTitle>
            <CardDescription>Complete list of captured buildings with management options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {buildings.map((building) => (
                <div
                  key={building.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{building.buildingType}</h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {building.address || "No address provided"}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(building.createdAt, 'PPP')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{building.category}</Badge>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {building.status}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/buildings/building-list/${building.id}`}>View</Link>
                      </Button>
                      {/* <Button size="sm" variant="outline" asChild>
                        <Link href={`/map?building=${building.id}`}>
                          <Edit2Icon className="h-4 w-4" />
                        </Link>
                      </Button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
