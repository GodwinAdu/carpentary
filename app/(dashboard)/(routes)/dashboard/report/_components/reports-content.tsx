"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  Users, 
  Building2, 
  Activity, 
  Download, 
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Eye
} from "lucide-react"
import { useState, useEffect } from "react"
import { getUsersReport, getBuildingsReport, getActivityReport } from "@/lib/actions/report.actions"
import { UsersReportTab } from "./users-report-tab"
import { BuildingsReportTab } from "./buildings-report-tab"
import { ActivityReportTab } from "./activity-report-tab"

export function ReportsContent() {
  const [usersData, setUsersData] = useState<any>(null)
  const [buildingsData, setBuildingsData] = useState<any>(null)
  const [activityData, setActivityData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [users, buildings, activities] = await Promise.all([
          getUsersReport(),
          getBuildingsReport(),
          getActivityReport()
        ])
        
        setUsersData(users)
        setBuildingsData(buildings)
        setActivityData(activities)
      } catch (error) {
        console.error('Error loading reports:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  const exportReport = (type: string) => {
    // Implement export functionality
    console.log(`Exporting ${type} report`)
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
            <p className="text-slate-600">Comprehensive insights into users and buildings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('all')}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{usersData?.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Buildings</p>
                <p className="text-2xl font-bold text-green-600">{buildingsData?.totalBuildings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Activities</p>
                <p className="text-2xl font-bold text-purple-600">{activityData?.totalActivities || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₵{(buildingsData?.financialSummary?.totalProjectValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users Report
          </TabsTrigger>
          <TabsTrigger value="buildings" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Buildings Report
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activities Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersReportTab data={usersData} onExport={() => exportReport('users')} />
        </TabsContent>

        <TabsContent value="buildings">
          <BuildingsReportTab data={buildingsData} onExport={() => exportReport('buildings')} />
        </TabsContent>

        <TabsContent value="activities">
          <ActivityReportTab data={activityData} onExport={() => exportReport('activities')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}