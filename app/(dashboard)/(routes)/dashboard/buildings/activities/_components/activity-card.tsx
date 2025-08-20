"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Loader2,
  Building2,
  AlertTriangle,
  Edit,
  Eye,
  Play,
  Pause,
  CheckSquare,
  X,
  Wrench,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { updateActivity } from "@/lib/actions/activity.actions";

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

interface ActivityCardProps {
  activity: Activity;
  onUpdate: () => void;
}

export default function ActivityCard({ activity, onUpdate }: ActivityCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-green-100 text-green-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "urgent": return "bg-red-100 text-red-800";
      case "critical": return "bg-red-200 text-red-900";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      case "on_hold": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <Clock3 className="h-4 w-4" />;
      case "in_progress": return <Loader2 className="h-4 w-4" />;
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "overdue": return <AlertTriangle className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock3 className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inspection": return <Eye className="h-4 w-4" />;
      case "maintenance": return <Wrench className="h-4 w-4" />;
      case "repair": return <Wrench className="h-4 w-4" />;
      case "installation": return <CheckSquare className="h-4 w-4" />;
      case "cleaning": return <CheckCircle2 className="h-4 w-4" />;
      case "security": return <AlertTriangle className="h-4 w-4" />;
      case "documentation": return <Edit className="h-4 w-4" />;
      case "meeting": return <Users className="h-4 w-4" />;
      case "training": return <Users className="h-4 w-4" />;
      case "emergency": return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckSquare className="h-4 w-4" />;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateActivity(activity._id, { status: newStatus }, window.location.pathname);
      toast.success(`Activity status updated to ${newStatus}`);
      onUpdate();
    } catch (error) {
      toast.error("Failed to update activity status");
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = activity.tasks.filter(task => task.completed).length;
  const totalTasks = activity.tasks.length;

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${activity.isEmergency ? 'border-red-500 border-2' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                {getCategoryIcon(activity.category)}
                <CardTitle className="text-lg">{activity.title}</CardTitle>
                {activity.isEmergency && (
                  <Badge variant="destructive" className="text-xs">
                    EMERGENCY
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {activity.description}
              </CardDescription>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={loading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Activity
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {activity.status === "scheduled" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Activity
                  </DropdownMenuItem>
                )}
                {activity.status === "in_progress" && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange("on_hold")}>
                      <Pause className="h-4 w-4 mr-2" />
                      Put on Hold
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => handleStatusChange("cancelled")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Activity
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status and Priority Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(activity.status)}>
              {getStatusIcon(activity.status)}
              <span className="ml-1 capitalize">
                {activity.status.replace('_', ' ')}
              </span>
            </Badge>
            <Badge className={getPriorityColor(activity.priority)}>
              {activity.priority.toUpperCase()} Priority
            </Badge>
            <Badge variant="outline" className="capitalize">
              {activity.category}
            </Badge>
          </div>

          {/* Building and Location */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{activity.buildingId.buildingType}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{activity.location}</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(activity.scheduledDate), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{activity.startTime} - {activity.endTime}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{activity.progress}%</span>
            </div>
            <Progress value={activity.progress} className="h-2" />
            {totalTasks > 0 && (
              <div className="text-xs text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </div>
            )}
          </div>

          {/* Assigned Workers */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {activity.assignedTo.slice(0, 3).map((worker) => (
                  <Avatar key={worker._id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={worker.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {worker.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {activity.assignedTo.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                    +{activity.assignedTo.length - 3}
                  </div>
                )}
              </div>
            </div>

            {activity.estimatedCost && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>${activity.estimatedCost.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {activity.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {activity.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{activity.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getCategoryIcon(activity.category)}
              {activity.title}
              {activity.isEmergency && (
                <Badge variant="destructive">EMERGENCY</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Activity details and progress tracking
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Building Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Type:</strong> {activity.buildingId.buildingType}</p>
                  <p><strong>Client:</strong> {activity.buildingId.clientName}</p>
                  <p><strong>Address:</strong> {activity.buildingId.address}</p>
                  <p><strong>Location:</strong> {activity.location}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Schedule</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Date:</strong> {format(new Date(activity.scheduledDate), "PPP")}</p>
                  <p><strong>Time:</strong> {activity.startTime} - {activity.endTime}</p>
                  <p><strong>Duration:</strong> {activity.estimatedDuration} minutes</p>
                  {activity.actualDuration && (
                    <p><strong>Actual:</strong> {activity.actualDuration} minutes</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>

            {/* Tasks */}
            {activity.tasks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tasks ({completedTasks}/{totalTasks})</h4>
                <div className="space-y-2">
                  {activity.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 border rounded">
                      <CheckSquare className={`h-4 w-4 ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Tools and Materials */}
            <div className="grid grid-cols-2 gap-4">
              {activity.requiredTools && activity.requiredTools.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Required Tools</h4>
                  <div className="flex flex-wrap gap-1">
                    {activity.requiredTools.map((tool) => (
                      <Badge key={tool} variant="outline" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {activity.requiredMaterials && activity.requiredMaterials.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Required Materials</h4>
                  <div className="space-y-1 text-sm">
                    {activity.requiredMaterials.map((material, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{material.name}</span>
                        <span>{material.quantity} {material.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Assigned Workers */}
            <div>
              <h4 className="font-semibold mb-2">Assigned Workers</h4>
              <div className="space-y-2">
                {activity.assignedTo.map((worker) => (
                  <div key={worker._id} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={worker.avatarUrl} />
                      <AvatarFallback>
                        {worker.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{worker.fullName}</p>
                      <p className="text-xs text-muted-foreground">{worker.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}