"use server"

import { currentUser } from "../helpers/session"
import Activity from "../models/activity.models"
import { connectToDB } from "../mongoose"
import { headers } from "next/headers"

interface CreateActivityParams {
    userId: string
    type: string
    action: string
    details?: {
        entityId?: string
        entityType?: string
        oldValue?: string
        newValue?: string
        metadata?: any
    }
    success?: boolean
    errorMessage?: string
}

export async function createActivity(params: CreateActivityParams) {
    try {
        await connectToDB()

        const headersList = await headers()
        const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1'
        const userAgent = headersList.get('user-agent') || 'Unknown'

        const device = userAgent.includes('Mobile') ? 'Mobile' :
            userAgent.includes('Tablet') ? 'Tablet' : 'Desktop'

        await Activity.create({
            ...params,
            ipAddress,
            userAgent,
            device,
            location: 'Office', // You can enhance this with actual geolocation
        })
    } catch (error) {
        console.error('Error creating activity:', error)
    }
}

export async function fetchUserActivities() {
    try {
        const user = await currentUser()
        await connectToDB()

        const activities = await Activity.find({ userId:user?._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()

        return JSON.parse(JSON.stringify(activities))
    } catch (error) {
        console.error('Error fetching activities:', error)
        return []
    }
}

export async function getActivityStats(userId: string) {
    try {
        await connectToDB()

        const stats = await Activity.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ])

        return {
            totalLogins: stats.find(s => s._id === 'login')?.count || 0,
            projectsAccessed: stats.find(s => s._id === 'building_access')?.count || 0,
            profileUpdates: stats.find(s => s._id === 'profile_update')?.count || 0,
            securityActions: stats.filter(s => ['password_change', 'email_verification'].includes(s._id)).reduce((sum, s) => sum + s.count, 0)
        }
    } catch (error) {
        console.error('Error fetching activity stats:', error)
        return { totalLogins: 0, projectsAccessed: 0, profileUpdates: 0, securityActions: 0 }
    }
}