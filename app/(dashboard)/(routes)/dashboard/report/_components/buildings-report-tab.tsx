"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  DollarSign, 
  Download, 
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  PieChart
} from "lucide-react"

interface BuildingsReportTabProps {
  data: any
  onExport: () => void
}

export function BuildingsReportTab({ data, onExport }: BuildingsReportTabProps) {
  if (!data) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'approved': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Commercial': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Residential': return 'bg-green-100 text-green-700 border-green-200'
      case 'Industrial': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Public': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const paymentPercentage = data.financialSummary?.totalProjectValue > 0 
    ? (data.financialSummary.totalPaidAmount / data.financialSummary.totalProjectValue) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ₵{(data.financialSummary?.totalProjectValue || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Total project value</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-blue-500" />
              Paid Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ₵{(data.financialSummary?.totalPaidAmount || 0).toLocaleString()}
            </div>
            <div className="space-y-2">
              <Progress value={paymentPercentage} className="h-2" />
              <p className="text-sm text-slate-600">{paymentPercentage.toFixed(1)}% collected</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-red-500" />
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2">
              ₵{(data.financialSummary?.totalOutstanding || 0).toLocaleString()}
            </div>
            <div className="space-y-2">
              <Progress value={100 - paymentPercentage} className="h-2" />
              <p className="text-sm text-slate-600">{(100 - paymentPercentage).toFixed(1)}% pending</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-purple-500" />
              Avg Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              ₵{(data.financialSummary?.avgProjectValue || 0).toLocaleString()}
            </div>
            <p className="text-sm text-slate-600">Per project</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Buildings by Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-500" />
                Buildings by Status
              </CardTitle>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <CardDescription>Project status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.buildingsByStatus?.map((status: any, index: number) => {
                const percentage = data.totalBuildings > 0 ? (status.count / data.totalBuildings) * 100 : 0
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{status._id || 'Unknown'}</span>
                      <Badge className={getStatusColor(status._id)}>
                        {status.count}
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-slate-500">{percentage.toFixed(1)}% of total</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Buildings by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Buildings by Category
            </CardTitle>
            <CardDescription>Project type distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.buildingsByCategory?.map((category: any, index: number) => {
                const percentage = data.totalBuildings > 0 ? (category.count / data.totalBuildings) * 100 : 0
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category._id || 'Other'}</span>
                      <Badge className={getCategoryColor(category._id)}>
                        {category.count}
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-slate-500">{percentage.toFixed(1)}% of total</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Value Buildings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Highest Value Projects
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>
          <CardDescription>Top 10 projects by value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topValueBuildings?.slice(0, 10).map((building: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{building.buildingType}</p>
                    <p className="text-sm text-slate-600">{building.clientName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(building.status)}>
                        {building.status}
                      </Badge>
                      <Badge className={getCategoryColor(building.category)}>
                        {building.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    ₵{(building.totalProjectCost || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600">
                    Paid: ₵{(building.totalPaidAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {building.address || 'No address'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Buildings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Recently Added Projects
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>
          <CardDescription>Latest building projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentBuildings?.map((building: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-slate-400" />
                  <div>
                    <p className="font-medium">{building.buildingType}</p>
                    <p className="text-sm text-slate-600">{building.clientName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(building.status)}>
                    {building.status}
                  </Badge>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(building.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}