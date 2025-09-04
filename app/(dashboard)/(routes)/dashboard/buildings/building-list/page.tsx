import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Building2, MapPin, Calendar, DollarSign, Star, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"
import { fetchAllBuilding } from "@/lib/actions/building.actions"
import { format } from "date-fns"
import { currentUser } from "@/lib/helpers/session"
import { currentUserRole } from "@/lib/helpers/get-user-role"

export default async function BuildingsPage() {

  const [buildings, user, role] = await Promise.all([
    fetchAllBuilding(),
    currentUser(),
    currentUserRole()
  ])
  //



  // Calculate statistics
  const totalRevenue = buildings.reduce((sum: number, b: any) => sum + (b.totalPaidAmount || 0), 0)
  const totalPending = buildings.reduce((sum: number, b: any) => sum + (b.remainingBalance || 0), 0)
  const avgRating = buildings.reduce((sum: number, b: any) => sum + (b.averageRating || 0), 0) / buildings.length || 0
  const totalComments = buildings.reduce((sum: number, b: any) => sum + (b.comments?.length || 0), 0)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-400",             // Neutral waiting
      quotation_sent: "bg-indigo-500",    // Business/proposal sent
      deal_closed: "bg-blue-600",         // Strong success indicator
      partially_paid: "bg-amber-500",     // Warning but positive
      fully_paid: "bg-emerald-600",       // Solid success
      in_progress: "bg-sky-500",          // Active state
      completed: "bg-green-600",          // Done, positive
      cancelled: "bg-red-600",            // Negative
      archived: "bg-slate-500",           // Muted, inactive
    }

    return colors[status] || "bg-gray-500"
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: "border-red-500 text-red-700",
      high: "border-orange-500 text-orange-700",
      medium: "border-blue-500 text-blue-700",
      low: "border-gray-500 text-gray-700",
    }
    return colors[priority as keyof typeof colors] || "border-gray-500 text-gray-700"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-4">
              <Link href="/dashboard/buildings/building-list">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buildings Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive building management and analytics</p>
            </div>
          </div>

        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {user?.role === 'admin' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₵{totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.role === "admin" && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mr-4" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₵{totalPending.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600 mr-4" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating ({totalComments} reviews)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {["Commercial", "Residential", "Industrial", "Public", "Mixed-Use"].map((category) => {
            const count = buildings.filter((b: any) => b.category === category).length
            return (
              <Card key={category}>
                <CardContent className="p-4 text-center">
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{category}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Buildings List */}
        <Card>
          <CardHeader>
            <CardTitle>All Buildings</CardTitle>
            <CardDescription>Complete list with financial tracking and visitor feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {buildings.map((building: any) => {
                const paymentProgress =
                  building.totalProjectCost > 0 ? (building.totalPaidAmount / building.totalProjectCost) * 100 : 0

                return (
                  <div
                    key={building._id}
                    className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{building.buildingType}</h3>
                          <Badge variant="outline" className={getPriorityColor(building.priority || "medium")}>
                            {building.priority || "medium"}
                          </Badge>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4 mb-2">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {building.address || "No address provided"}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(building.createdAt), "PPP")}
                          </div>
                        </div>

                        {/* Payment Progress */}
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span>Payment Progress</span>
                              <span>
                                ₵{building.totalPaidAmount?.toLocaleString() || 0} / $
                                {building.totalProjectCost?.toLocaleString() || 0}
                              </span>
                            </div>
                            <Progress value={paymentProgress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Rating and Comments */}
                      <div className="text-center">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{building.averageRating?.toFixed(1) || "0.0"}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {building.comments?.length || 0}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col space-y-1">
                        <Badge variant="secondary">{building.category}</Badge>
                        <Badge variant="outline" className={`${getStatusColor(building.status)} text-white border-0`}>
                          {building.status}
                        </Badge>
                      </div>

                      {/* Actions */}
                      {role.permissions.viewBuilding && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/buildings/building-list/${building._id}`}>View Details</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
