"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Loader2,
  Activity as ActivityIcon,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CreateActivityDialog from "./create-activity-dialog";
import ActivityCard from "./activity-card";
import ActivityStats from "./activity-stats";
import { fetchActivities, getActivityStats } from "@/lib/actions/activity.actions";
import { fetchAllBuilding } from "@/lib/actions/building.actions";

interface Activity {
  _id: string;
  title: string;
  description: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  estimatedDuration: number;
  actualDuration?: number;
  buildingId: {
    _id: string;
    buildingType: string;
    address: string;
    clientName: string;
  };
  location: string;
  assignedTo: Array<{
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  }>;
  assignedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  category: string;
  priority: string;
  status: string;
  progress: number;
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    priority: string;
  }>;
  requiredTools?: string[];
  requiredMaterials?: Array<{
    name: string;
    quantity: number;
    unit: string;
    cost?: number;
  }>;
  estimatedCost?: number;
  actualCost?: number;
  isEmergency: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Building {
  _id: string;
  buildingType: string;
  address: string;
  clientName: string;
}

interface ActivityStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
  cancelled: number;
  avgProgress: number;
  totalEstimatedCost: number;
  totalActualCost: number;
}

export default function ActivityDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    cancelled: 0,
    avgProgress: 0,
    totalEstimatedCost: 0,
    totalActualCost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitiesData, buildingsData, statsData] = await Promise.all([
        fetchActivities(),
        fetchAllBuilding(),
        getActivityStats(),
      ]);

      setActivities(activitiesData || []);
      setBuildings(buildingsData || []);
      setStats(statsData || {
        total: 0,
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        cancelled: 0,
        avgProgress: 0,
        totalEstimatedCost: 0,
        totalActualCost: 0,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBuilding = selectedBuilding === "all" || activity.buildingId._id === selectedBuilding;
    const matchesStatus = selectedStatus === "all" || activity.status === selectedStatus;
    const matchesCategory = selectedCategory === "all" || activity.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || activity.priority === selectedPriority;

    let matchesTab = true;
    if (activeTab === "today") {
      const today = format(new Date(), "yyyy-MM-dd");
      matchesTab = format(new Date(activity.scheduledDate), "yyyy-MM-dd") === today;
    } else if (activeTab === "upcoming") {
      const today = new Date();
      const activityDate = new Date(activity.scheduledDate);
      matchesTab = activityDate > today && activity.status !== "completed";
    } else if (activeTab === "overdue") {
      matchesTab = activity.status === "overdue";
    } else if (activeTab === "completed") {
      matchesTab = activity.status === "completed";
    }

    return matchesSearch && matchesBuilding && matchesStatus && matchesCategory && matchesPriority && matchesTab;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ActivityIcon className="h-8 w-8" />
            Activity Management
          </h1>
          <p className="text-muted-foreground">
            Schedule, track, and manage worker activities across all buildings
          </p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Activity
        </Button>
      </div>

      <Separator />

      {/* Stats Cards */}
      <ActivityStats stats={stats} />

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>

          <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Buildings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {buildings.map((building) => (
                <SelectItem key={building._id} value={building._id}>
                  {building.buildingType} - {building.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="installation">Installation</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredActivities.length === 0 ? (
            <Card className="p-12 text-center">
              <ActivityIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activities found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedBuilding !== "all" || selectedStatus !== "all" 
                  ? "Try adjusting your filters or search terms"
                  : "Get started by creating your first activity"
                }
              </p>
              {!searchTerm && selectedBuilding === "all" && selectedStatus === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Activity
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity._id}
                  activity={activity}
                  onUpdate={loadData}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateActivityDialog
        buildings={buildings}
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadData}
      />
    </div>
  );
}