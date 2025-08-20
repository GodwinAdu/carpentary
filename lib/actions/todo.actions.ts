"use server"

import Todo from "../models/todo.models"
import { connectToDB } from "../mongoose"
import { withAuth, type User as UserProps } from "../helpers/auth"
import { revalidatePath } from "next/cache"
import { createActivity } from "./activity.actions"

interface CreateTodoParams {
    title: string
    description?: string
    priority?: string
    category?: string
    dueDate?: Date
    tags?: string[]
    subtasks?: Array<{ title: string }>
    estimatedTime?: number
}

async function _createTodo(user: UserProps, params: CreateTodoParams) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const todo = await Todo.create({
            ...params,
            userId: user._id,
        })

        await createActivity({
            userId: user._id,
            type: 'system_access',
            action: `Created new todo: ${params.title}`,
            details: { entityId: todo._id, entityType: 'Todo' }
        })

        revalidatePath('/dashboard/todos')
        return { success: true, todo: JSON.parse(JSON.stringify(todo)) }
    } catch (error) {
        console.error('Error creating todo:', error)
        throw error
    }
}

async function _fetchUserTodos(user: UserProps, filters?: { status?: string; category?: string; priority?: string }) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const query: any = { userId: user._id, isArchived: false }
        
        if (filters?.status) query.status = filters.status
        if (filters?.category) query.category = filters.category
        if (filters?.priority) query.priority = filters.priority

        const todos = await Todo.find(query).sort({ createdAt: -1 })
        return JSON.parse(JSON.stringify(todos))
    } catch (error) {
        console.error('Error fetching todos:', error)
        return []
    }
}

export async function fetchTodosByUserId(userId: string) {
    try {
        await connectToDB()
        const todos = await Todo.find({ userId, isArchived: false }).sort({ createdAt: -1 }).limit(10)
        return JSON.parse(JSON.stringify(todos))
    } catch (error) {
        console.error('Error fetching user todos:', error)
        return []
    }
}

async function _updateTodo(user: UserProps, id: string, updates: Partial<CreateTodoParams & { status?: string; progress?: number }>) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const updateData: any = { ...updates }
        
        if (updates.status === 'completed') {
            updateData.completedAt = new Date()
            updateData.progress = 100
        }

        const todo = await Todo.findOneAndUpdate(
            { _id: id, userId: user._id },
            updateData,
            { new: true }
        )

        if (!todo) throw new Error("Todo not found")

        let activityAction = `Updated todo: ${todo.title}`
        if (updates.status === 'completed') {
            activityAction = `Completed todo: ${todo.title}`
        } else if (updates.status === 'in_progress') {
            activityAction = `Started working on todo: ${todo.title}`
        }

        await createActivity({
            userId: user._id,
            type: 'system_access',
            action: activityAction,
            details: { 
                entityId: id, 
                entityType: 'Todo',
                oldValue: updates.status ? 'previous_status' : undefined,
                newValue: updates.status || undefined
            }
        })

        revalidatePath('/dashboard/todos')
        return { success: true, todo: JSON.parse(JSON.stringify(todo)) }
    } catch (error) {
        console.error('Error updating todo:', error)
        throw error
    }
}

async function _deleteTodo(user: UserProps, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const todo = await Todo.findOneAndDelete({ _id: id, userId: user._id })
        if (!todo) throw new Error("Todo not found")

        await createActivity({
            userId: user._id,
            type: 'system_access',
            action: `Deleted todo: ${todo.title}`,
            details: { entityId: id, entityType: 'Todo' }
        })

        revalidatePath('/dashboard/todos')
        return { success: true }
    } catch (error) {
        console.error('Error deleting todo:', error)
        throw error
    }
}

async function _getTodoStats(user: UserProps) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const stats = await Todo.aggregate([
            { $match: { userId: user._id, isArchived: false } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
                    overdue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lt: ["$dueDate", new Date()] },
                                        { $ne: ["$status", "completed"] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ])

        return stats[0] || { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 }
    } catch (error) {
        console.error('Error fetching todo stats:', error)
        return { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 }
    }
}

export const createTodo = await withAuth(_createTodo)
export const fetchUserTodos = await withAuth(_fetchUserTodos)
export const updateTodo = await withAuth(_updateTodo)
export const deleteTodo = await withAuth(_deleteTodo)
export const getTodoStats = await withAuth(_getTodoStats)