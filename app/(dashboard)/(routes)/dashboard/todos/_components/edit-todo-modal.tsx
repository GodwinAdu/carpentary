"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateTodo } from "@/lib/actions/todo.actions"
import { toast } from "sonner"

const EditTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum(["work", "personal", "health", "learning", "other"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
})

type EditTodoFormValues = z.infer<typeof EditTodoSchema>

interface EditTodoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo: any
  onSuccess: () => void
}

export function EditTodoModal({ open, onOpenChange, todo, onSuccess }: EditTodoModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState([todo?.progress || 0])

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EditTodoFormValues>({
    resolver: zodResolver(EditTodoSchema),
    defaultValues: {
      title: todo?.title || "",
      description: todo?.description || "",
      priority: todo?.priority || "medium",
      category: todo?.category || "work",
      status: todo?.status || "pending"
    }
  })

  useEffect(() => {
    if (todo) {
      setValue("title", todo.title)
      setValue("description", todo.description || "")
      setValue("priority", todo.priority)
      setValue("category", todo.category)
      setValue("status", todo.status)
      setProgress([todo.progress || 0])
    }
  }, [todo, setValue])

  const onSubmit = async (data: EditTodoFormValues) => {
    setIsLoading(true)
    try {
      await updateTodo(todo._id, {
        ...data,
        progress: progress[0]
      })
      
      toast.success("Todo updated successfully!")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to update todo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Todo</DialogTitle>
          <DialogDescription>
            Update your task details and progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select onValueChange={(value) => setValue("priority", value as any)} defaultValue={todo?.priority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(value) => setValue("category", value as any)} defaultValue={todo?.category}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select onValueChange={(value) => setValue("status", value as any)} defaultValue={todo?.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Progress: {progress[0]}%</Label>
            <Slider
              value={progress}
              onValueChange={setProgress}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Updating...' : 'Update Todo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}