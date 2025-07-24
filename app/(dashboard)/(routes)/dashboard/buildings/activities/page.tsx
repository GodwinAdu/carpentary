"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CalendarIcon,
  Clock,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  BookOpen,
  Briefcase,
  FileText,
  Lightbulb,
  Award,
  Target,
  Bookmark,
  CheckSquare,
  Clock3,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"


// Types
type GoalCategory = "academic" | "career" | "research" | "exam" | "project" | "reading" | "skill" | "other"
type GoalPriority = "low" | "medium" | "high" | "urgent"
type GoalStatus = "not-started" | "in-progress" | "completed" | "overdue"

interface Task {
  id: string
  title: string
  completed: boolean
}

interface Goal {
  id: string
  title: string
  description: string
  deadline: string
  priority: GoalPriority
  category: GoalCategory
  progress: number
  status: GoalStatus
  tasks: Task[]
  reminderSet: boolean
  reminderDate?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 9)

const getCategoryIcon = (category: GoalCategory) => {
  switch (category) {
    case "academic":
      return <BookOpen className="h-4 w-4" />
    case "career":
      return <Briefcase className="h-4 w-4" />
    case "research":
      return <Lightbulb className="h-4 w-4" />
    case "exam":
      return <FileText className="h-4 w-4" />
    case "project":
      return <Target className="h-4 w-4" />
    case "reading":
      return <BookOpen className="h-4 w-4" />
    case "skill":
      return <Award className="h-4 w-4" />
    default:
      return <Bookmark className="h-4 w-4" />
  }
}

const getPriorityColor = (priority: GoalPriority) => {
  switch (priority) {
    case "low":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "medium":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "high":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200"
    case "urgent":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

const getStatusColor = (status: GoalStatus) => {
  switch (status) {
    case "not-started":
      return "bg-gray-100 text-gray-800"
    case "in-progress":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "overdue":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusIcon = (status: GoalStatus) => {
  switch (status) {
    case "not-started":
      return <Clock3 className="h-4 w-4" />
    case "in-progress":
      return <Loader2 className="h-4 w-4" />
    case "completed":
      return <CheckSquare className="h-4 w-4" />
    case "overdue":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Clock3 className="h-4 w-4" />
  }
}

// Sample data
const initialGoals: Goal[] = [
  {
    id: "g1",
    title: "Complete Research Paper",
    description: "Finish the literature review and methodology sections of my research paper on renewable energy.",
    deadline: "2023-12-15",
    priority: "high",
    category: "research",
    progress: 65,
    status: "in-progress",
    tasks: [
      { id: "t1", title: "Literature review", completed: true },
      { id: "t2", title: "Methodology section", completed: true },
      { id: "t3", title: "Results analysis", completed: false },
      { id: "t4", title: "Conclusion", completed: false },
    ],
    reminderSet: true,
    reminderDate: "2023-12-10",
    createdAt: "2023-11-01",
    updatedAt: "2023-11-20",
  },
  {
    id: "g2",
    title: "Study for Final Exams",
    description: "Prepare for final exams in Calculus, Physics, and Computer Science.",
    deadline: "2023-12-20",
    priority: "urgent",
    category: "exam",
    progress: 30,
    status: "in-progress",
    tasks: [
      { id: "t5", title: "Review Calculus chapters 1-5", completed: true },
      { id: "t6", title: "Practice Physics problems", completed: false },
      { id: "t7", title: "Review CS algorithms", completed: false },
    ],
    reminderSet: true,
    reminderDate: "2023-12-15",
    createdAt: "2023-11-10",
    updatedAt: "2023-11-25",
  },
  {
    id: "g3",
    title: "Complete Online Course",
    description: "Finish the Machine Learning course on Coursera.",
    deadline: "2024-01-15",
    priority: "medium",
    category: "skill",
    progress: 50,
    status: "in-progress",
    tasks: [
      { id: "t8", title: "Week 1-3 lectures", completed: true },
      { id: "t9", title: "Week 4-6 lectures", completed: true },
      { id: "t10", title: "Final project", completed: false },
    ],
    reminderSet: false,
    createdAt: "2023-11-05",
    updatedAt: "2023-11-28",
  },
  {
    id: "g4",
    title: "Apply for Summer Internship",
    description: "Prepare resume and apply for software engineering internships.",
    deadline: "2024-02-28",
    priority: "medium",
    category: "career",
    progress: 25,
    status: "in-progress",
    tasks: [
      { id: "t11", title: "Update resume", completed: true },
      { id: "t12", title: "Research companies", completed: false },
      { id: "t13", title: "Submit applications", completed: false },
    ],
    reminderSet: true,
    reminderDate: "2024-01-15",
    createdAt: "2023-11-15",
    updatedAt: "2023-11-22",
  },
]

export default function AcademicPlannerPage() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>(initialGoals)
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: "",
    description: "",
    deadline: "",
    priority: "medium",
    category: "academic",
    progress: 0,
    status: "not-started",
    tasks: [],
    reminderSet: false,
  })
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("deadline")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [newTask, setNewTask] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [calendarView, setCalendarView] = useState<"month" | "week">("month")
  const [isLoading, setIsLoading] = useState(false)

  // Apply filters and sorting
  useEffect(() => {
    let result = [...goals]

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (goal) =>
          goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          goal.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply category filter
    if (filterCategory !== "all") {
      result = result.filter((goal) => goal.category === filterCategory)
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      result = result.filter((goal) => goal.priority === filterPriority)
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((goal) => goal.status === filterStatus)
    }

    // Apply tab filter
    if (activeTab === "upcoming") {
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)

      result = result.filter((goal) => {
        const deadline = new Date(goal.deadline)
        return deadline >= today && deadline <= nextWeek && goal.status !== "completed"
      })
    } else if (activeTab === "overdue") {
      const today = new Date()
      result = result.filter((goal) => {
        const deadline = new Date(goal.deadline)
        return deadline < today && goal.status !== "completed"
      })
    } else if (activeTab === "completed") {
      result = result.filter((goal) => goal.status === "completed")
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "deadline":
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          break
        case "priority":
          const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case "progress":
          comparison = a.progress - b.progress
          break
        default:
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredGoals(result)
  }, [goals, searchTerm, filterCategory, filterPriority, filterStatus, sortBy, sortOrder, activeTab])

  // Handle adding a new goal
  const addGoal = () => {
    if (!newGoal.title || !newGoal.description || !newGoal.deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const now = new Date().toISOString()
      const goal: Goal = {
        id: generateId(),
        title: newGoal.title || "",
        description: newGoal.description || "",
        deadline: newGoal.deadline || "",
        priority: (newGoal.priority as GoalPriority) || "medium",
        category: (newGoal.category as GoalCategory) || "academic",
        progress: 0,
        status: "not-started",
        tasks: newGoal.tasks || [],
        reminderSet: newGoal.reminderSet || false,
        reminderDate: newGoal.reminderDate,
        createdAt: now,
        updatedAt: now,
      }

      setGoals([...goals, goal])
      setNewGoal({
        title: "",
        description: "",
        deadline: "",
        priority: "medium",
        category: "academic",
        progress: 0,
        status: "not-started",
        tasks: [],
        reminderSet: false,
      })
      setIsAddingGoal(false)
      setIsLoading(false)

      toast("Goal Added", {
        description: "Your academic goal has been added successfully.",
      })
    }, 500)
  }

  // Handle updating a goal
  const updateGoal = () => {
    if (!editingGoal) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedGoals = goals.map((goal) =>
        goal.id === editingGoal.id ? { ...editingGoal, updatedAt: new Date().toISOString() } : goal,
      )

      setGoals(updatedGoals)
      setEditingGoal(null)
      setIsLoading(false)

      toast("Goal Updated", {
        description: "Your academic goal has been updated successfully.",
      })
    }, 500)
  }

  // Handle removing a goal
  const removeGoal = (id: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setGoals(goals.filter((goal) => goal.id !== id))
      setIsLoading(false)

      toast("Goal Removed", {
        description: "Your academic goal has been removed.",
      })
    }, 500)
  }

  // Handle adding a task to a goal
  const addTask = () => {
    if (!newTask || !editingGoal) return

    const task: Task = {
      id: generateId(),
      title: newTask,
      completed: false,
    }

    setEditingGoal({
      ...editingGoal,
      tasks: [...editingGoal.tasks, task],
    })

    setNewTask("")
  }

  // Handle toggling a task's completion status
  const toggleTask = (goalId: string, taskId: string) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        const updatedTasks = goal.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        )

        // Calculate new progress
        const completedTasks = updatedTasks.filter((task) => task.completed).length
        const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0

        // Update status based on progress
        let status: GoalStatus = goal.status
        if (progress === 100) {
          status = "completed"
        } else if (progress > 0) {
          status = "in-progress"
        }

        return {
          ...goal,
          tasks: updatedTasks,
          progress,
          status,
          completedAt: progress === 100 ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        }
      }
      return goal
    })

    setGoals(updatedGoals)

    // If we're editing a goal, update the editing state too
    if (editingGoal && editingGoal.id === goalId) {
      const updatedTasks = editingGoal.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      )

      const completedTasks = updatedTasks.filter((task) => task.completed).length
      const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0

      let status: GoalStatus = editingGoal.status
      if (progress === 100) {
        status = "completed"
      } else if (progress > 0) {
        status = "in-progress"
      }

      setEditingGoal({
        ...editingGoal,
        tasks: updatedTasks,
        progress,
        status,
        completedAt: progress === 100 ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  // Handle removing a task
  const removeTask = (goalId: string, taskId: string) => {
    if (editingGoal && editingGoal.id === goalId) {
      const updatedTasks = editingGoal.tasks.filter((task) => task.id !== taskId)

      // Recalculate progress
      const completedTasks = updatedTasks.filter((task) => task.completed).length
      const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0

      setEditingGoal({
        ...editingGoal,
        tasks: updatedTasks,
        progress,
      })
    }
  }

  // Handle drag and drop
  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(filteredGoals)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFilteredGoals(items)
  }

  // Get goals for selected date
  const getGoalsForSelectedDate = () => {
    if (!selectedDate) return []

    const dateString = format(selectedDate, "yyyy-MM-dd")
    return goals.filter((goal) => goal.deadline === dateString)
  }

  // Calculate statistics
  const stats = {
    total: goals.length,
    completed: goals.filter((goal) => goal.status === "completed").length,
    inProgress: goals.filter((goal) => goal.status === "in-progress").length,
    notStarted: goals.filter((goal) => goal.status === "not-started").length,
    overdue: goals.filter((goal) => {
      const deadline = new Date(goal.deadline)
      const today = new Date()
      return deadline < today && goal.status !== "completed"
    }).length,
    upcomingWeek: goals.filter((goal) => {
      const deadline = new Date(goal.deadline)
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)
      return deadline >= today && deadline <= nextWeek && goal.status !== "completed"
    }).length,
  }

  // Calculate completion rate
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Amaze Planner – Plan Smarter, Live Better</h1>
          <p className="text-muted-foreground">Organize your academic goals and track your progress</p>

        </div>

        <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
              <DialogDescription>Create a new goal to track your progress.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right">
                  Deadline
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {newGoal.deadline ? format(new Date(newGoal.deadline), "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newGoal.deadline ? new Date(newGoal.deadline) : undefined}
                        onSelect={(date) =>
                          setNewGoal({ ...newGoal, deadline: date ? format(date, "yyyy-MM-dd") : "" })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={newGoal.category as string}
                  onValueChange={(value) => setNewGoal({ ...newGoal, category: value as GoalCategory })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Work Activities</SelectLabel>
                      <SelectItem value="meeting">Meetings</SelectItem>
                      <SelectItem value="task">Task Management</SelectItem>
                      <SelectItem value="deadline">Deadlines</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="reporting">Reporting</SelectItem>
                      <SelectItem value="collaboration">Collaboration</SelectItem>
                      <SelectItem value="learning">Learning & Development</SelectItem>
                      <SelectItem value="break">Break / Rest</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={newGoal.priority as string}
                  onValueChange={(value) => setNewGoal({ ...newGoal, priority: value as GoalPriority })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Set Reminder</Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox
                    id="reminder"
                    checked={newGoal.reminderSet}
                    onCheckedChange={(checked) => setNewGoal({ ...newGoal, reminderSet: !!checked })}
                  />
                  <label
                    htmlFor="reminder"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remind me before deadline
                  </label>
                </div>
              </div>
              {newGoal.reminderSet && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reminderDate" className="text-right">
                    Reminder Date
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {newGoal.reminderDate ? (
                            format(new Date(newGoal.reminderDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newGoal.reminderDate ? new Date(newGoal.reminderDate) : undefined}
                          onSelect={(date) =>
                            setNewGoal({ ...newGoal, reminderDate: date ? format(date, "yyyy-MM-dd") : "" })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                Cancel
              </Button>
              <Button onClick={addGoal} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Goal"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Academic Goal</DialogTitle>
              <DialogDescription>Update your goal details and track your progress.</DialogDescription>
            </DialogHeader>
            {editingGoal && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={editingGoal.title}
                    onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editingGoal.description}
                    onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-deadline" className="text-right">
                    Deadline
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {editingGoal.deadline ? (
                            format(new Date(editingGoal.deadline), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editingGoal.deadline ? new Date(editingGoal.deadline) : undefined}
                          onSelect={(date) =>
                            setEditingGoal({ ...editingGoal, deadline: date ? format(date, "yyyy-MM-dd") : "" })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={editingGoal.category}
                    onValueChange={(value) => setEditingGoal({ ...editingGoal, category: value as GoalCategory })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="skill">Skill Development</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-priority" className="text-right">
                    Priority
                  </Label>
                  <Select
                    value={editingGoal.priority}
                    onValueChange={(value) => setEditingGoal({ ...editingGoal, priority: value as GoalPriority })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editingGoal.status}
                    onValueChange={(value) => setEditingGoal({ ...editingGoal, status: value as GoalStatus })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-progress" className="text-right">
                    Progress
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{editingGoal.progress}%</span>
                    </div>
                    <Progress value={editingGoal.progress} className="h-2" />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Tasks</Label>
                  <div className="col-span-3 space-y-2">
                    {editingGoal.tasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(editingGoal.id, task.id)}
                        />
                        <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto"
                          onClick={() => removeTask(editingGoal.id, task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add new task"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTask()}
                      />
                      <Button variant="outline" onClick={addTask}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Set Reminder</Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Checkbox
                      id="edit-reminder"
                      checked={editingGoal.reminderSet}
                      onCheckedChange={(checked) => setEditingGoal({ ...editingGoal, reminderSet: !!checked })}
                    />
                    <label
                      htmlFor="edit-reminder"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remind me before deadline
                    </label>
                  </div>
                </div>
                {editingGoal.reminderSet && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-reminderDate" className="text-right">
                      Reminder Date
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            {editingGoal.reminderDate ? (
                              format(new Date(editingGoal.reminderDate), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editingGoal.reminderDate ? new Date(editingGoal.reminderDate) : undefined}
                            onSelect={(date) =>
                              setEditingGoal({ ...editingGoal, reminderDate: date ? format(date, "yyyy-MM-dd") : "" })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingGoal(null)}>
                Cancel
              </Button>
              <Button onClick={updateGoal} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Goal"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Goals</CardTitle>
            <CardDescription>All your academic goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Completion Rate</CardTitle>
            <CardDescription>Your goal completion progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Goals due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcomingWeek}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Goals</h4>
                  <div className="space-y-2">
                    <Label htmlFor="filter-category">Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger id="filter-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="skill">Skill Development</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-priority">Priority</Label>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger id="filter-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-status">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger id="filter-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Sort Goals</h4>
                  <div className="space-y-2">
                    <Label htmlFor="sort-by">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort-by">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="progress">Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort-order">Order</Label>
                    <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                      <SelectTrigger id="sort-order">
                        <SelectValue placeholder="Select order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Input
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px]"
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="goals">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {filteredGoals.length > 0 ? (
                    filteredGoals.map((goal, index) => (
                      <Draggable key={goal.id} draggableId={goal.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <CardTitle className="flex items-center">
                                    {getCategoryIcon(goal.category)}
                                    <span className="ml-2">{goal.title}</span>
                                  </CardTitle>
                                  <CardDescription>{goal.description}</CardDescription>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setEditingGoal(goal)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => removeGoal(goal.id)}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={getPriorityColor(goal.priority)}>
                                    {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                                  </Badge>
                                  <Badge className={getStatusColor(goal.status)}>
                                    {getStatusIcon(goal.status)}
                                    <span className="ml-1">
                                      {goal.status === "not-started"
                                        ? "Not Started"
                                        : goal.status === "in-progress"
                                          ? "In Progress"
                                          : goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                                    </span>
                                  </Badge>
                                  <Badge variant="outline" className="flex items-center">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {format(new Date(goal.deadline), "MMM d, yyyy")}
                                  </Badge>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm">Progress</span>
                                    <span className="text-sm font-medium">{goal.progress}%</span>
                                  </div>
                                  <Progress value={goal.progress} className="h-2" />
                                </div>

                                {goal.tasks.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Tasks</h4>
                                    <ScrollArea className="h-24 rounded-md border p-2">
                                      <div className="space-y-2">
                                        {goal.tasks.map((task) => (
                                          <div key={task.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={task.completed}
                                              onCheckedChange={() => toggleTask(goal.id, task.id)}
                                            />
                                            <span
                                              className={task.completed ? "line-through text-muted-foreground" : ""}
                                            >
                                              {task.title}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                onClick={() => setEditingGoal(goal)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Goal
                              </Button>
                            </CardFooter>
                          </Card>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">
                        No goals found. Try adjusting your filters or add a new goal.
                      </p>
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {/* Same structure as "all" tab but filtered for upcoming goals */}
          <div className="space-y-4">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => (
                <Card key={goal.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center">
                          {getCategoryIcon(goal.category)}
                          <span className="ml-2">{goal.title}</span>
                        </CardTitle>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setEditingGoal(goal)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => removeGoal(goal.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getPriorityColor(goal.priority)}>
                          {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {format(new Date(goal.deadline), "MMM d, yyyy")}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No upcoming goals found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="mt-6">
          {/* Similar structure for overdue goals */}
          <div className="space-y-4">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => (
                <Card key={goal.id} className="hover:shadow-md transition-shadow border-red-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          {goal.title}
                        </CardTitle>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setEditingGoal(goal)}>
                        Update
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getPriorityColor(goal.priority)}>
                          {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                        </Badge>
                        <Badge variant="destructive" className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Overdue by{" "}
                          {Math.ceil(
                            (new Date().getTime() - new Date(goal.deadline).getTime()) / (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-muted-foreground">No overdue goals. Great job staying on track!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {/* Similar structure for completed goals */}
          <div className="space-y-4">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => (
                <Card key={goal.id} className="hover:shadow-md transition-shadow bg-green-50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          {goal.title}
                        </CardTitle>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="flex items-center">
                        {goal.completedAt && (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed on {format(new Date(goal.completedAt), "MMM d, yyyy")}
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getPriorityColor(goal.priority)}>
                          {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Due: {format(new Date(goal.deadline), "MMM d, yyyy")}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm font-medium">100%</span>
                        </div>
                        <Progress value={100} className="h-2 bg-green-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No completed goals yet. Keep working towards your objectives!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

