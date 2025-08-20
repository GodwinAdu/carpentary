"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  Flag, 
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle2
} from "lucide-react"
import { useState, useEffect } from "react"
import { fetchUserTodos, getTodoStats, updateTodo, deleteTodo } from "@/lib/actions/todo.actions"
import { CreateTodoModal } from "./create-todo-modal"
import { EditTodoModal } from "./edit-todo-modal"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export function TodosContent() {
  const [todos, setTodos] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const loadTodos = async () => {
    try {
      const filters: any = {}
      if (statusFilter !== "all") filters.status = statusFilter
      if (priorityFilter !== "all") filters.priority = priorityFilter

      const [todosData, statsData] = await Promise.all([
        fetchUserTodos(filters),
        getTodoStats()
      ])
      
      setTodos(todosData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading todos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [statusFilter, priorityFilter])

  const handleStatusChange = async (todoId: string, status: string) => {
    try {
      await updateTodo(todoId, { status })
      toast.success(`Todo ${status === 'completed' ? 'completed' : 'updated'}!`)
      loadTodos()
    } catch (error) {
      toast.error('Failed to update todo')
    }
  }

  const handleDelete = async (todoId: string) => {
    try {
      await deleteTodo(todoId)
      toast.success('Todo deleted!')
      loadTodos()
    } catch (error) {
      toast.error('Failed to delete todo')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    todo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <CheckSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Todos</h1>
            <p className="text-slate-600">Track and manage your tasks efficiently</p>
          </div>
        </div>
        <Button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Todo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <CheckSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                <Play className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inProgress || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search todos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Todos List */}
      <div className="grid gap-4">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No todos found</h3>
              <p className="text-slate-500 mb-4">Create your first todo to get started!</p>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Todo
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTodos.map((todo) => (
            <Card key={todo._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-semibold ${todo.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                        {todo.title}
                      </h3>
                      <Badge className={getPriorityColor(todo.priority)}>
                        <Flag className="h-3 w-3 mr-1" />
                        {todo.priority}
                      </Badge>
                      <Badge className={getStatusColor(todo.status)}>
                        {todo.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {todo.description && (
                      <p className="text-slate-600 text-sm">{todo.description}</p>
                    )}
                    
                    {todo.progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{todo.progress}%</span>
                        </div>
                        <Progress value={todo.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {todo.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {todo.category && (
                        <Badge variant="outline" className="text-xs">
                          {todo.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedTodo(todo)
                        setEditModalOpen(true)
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {todo.status !== 'completed' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(todo._id, 'completed')}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      {todo.status === 'pending' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(todo._id, 'in_progress')}>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(todo._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateTodoModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen}
        onSuccess={loadTodos}
      />
      
      {selectedTodo && (
        <EditTodoModal 
          open={editModalOpen} 
          onOpenChange={setEditModalOpen}
          todo={selectedTodo}
          onSuccess={loadTodos}
        />
      )}
    </div>
  )
}