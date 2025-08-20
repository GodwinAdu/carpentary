"use server"

import { connectToDB } from "../mongoose"
import { withAuth, type User as UserProps } from "../helpers/auth"
import User from "../models/user.models"
import Building from "../models/building.models"
import Todo from "../models/todo.models"
import Activity from "../models/activity.models"

async function _getUsersReport(user: UserProps) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const [totalUsers, activeUsers, usersByDepartment, recentUsers, userActivities] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ status: 'active' }),
            User.aggregate([
                { $group: { _id: '$department', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            User.find({}).sort({ createdAt: -1 }).limit(10).lean(),
            User.aggregate([
                {
                    $lookup: {
                        from: 'activities',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'activities'
                    }
                },
                {
                    $project: {
                        fullName: 1,
                        email: 1,
                        department: 1,
                        status: 1,
                        createdAt: 1,
                        activityCount: { $size: '$activities' }
                    }
                },
                { $sort: { activityCount: -1 } },
                { $limit: 10 }
            ])
        ])

        return {
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            usersByDepartment,
            recentUsers: JSON.parse(JSON.stringify(recentUsers)),
            topActiveUsers: JSON.parse(JSON.stringify(userActivities))
        }
    } catch (error) {
        console.error('Error generating users report:', error)
        throw error
    }
}

async function _getBuildingsReport(user: UserProps) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const [
            totalBuildings,
            buildingsByStatus,
            buildingsByCategory,
            recentBuildings,
            financialSummary,
            topValueBuildings
        ] = await Promise.all([
            Building.countDocuments({}),
            Building.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Building.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Building.find({}).sort({ createdAt: -1 }).limit(10).lean(),
            Building.aggregate([
                {
                    $group: {
                        _id: null,
                        totalProjectValue: { $sum: '$totalProjectCost' },
                        totalPaidAmount: { $sum: '$totalPaidAmount' },
                        totalOutstanding: { $sum: '$remainingBalance' },
                        avgProjectValue: { $avg: '$totalProjectCost' }
                    }
                }
            ]),
            Building.find({}).sort({ totalProjectCost: -1 }).limit(10).lean()
        ])

        return {
            totalBuildings,
            buildingsByStatus,
            buildingsByCategory,
            recentBuildings: JSON.parse(JSON.stringify(recentBuildings)),
            financialSummary: financialSummary[0] || {
                totalProjectValue: 0,
                totalPaidAmount: 0,
                totalOutstanding: 0,
                avgProjectValue: 0
            },
            topValueBuildings: JSON.parse(JSON.stringify(topValueBuildings))
        }
    } catch (error) {
        console.error('Error generating buildings report:', error)
        throw error
    }
}

async function _getActivityReport(user: UserProps) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const [
            totalActivities,
            activitiesByType,
            recentActivities,
            dailyActivities
        ] = await Promise.all([
            Activity.countDocuments({}),
            Activity.aggregate([
                { $group: { _id: '$type', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Activity.find({}).sort({ createdAt: -1 }).limit(20).populate('userId', 'fullName email').lean(),
            Activity.aggregate([
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: 30 }
            ])
        ])

        return {
            totalActivities,
            activitiesByType,
            recentActivities: JSON.parse(JSON.stringify(recentActivities)),
            dailyActivities
        }
    } catch (error) {
        console.error('Error generating activity report:', error)
        throw error
    }
}

export const getUsersReport = await withAuth(_getUsersReport)
export const getBuildingsReport = await withAuth(_getBuildingsReport)
export const getActivityReport = await withAuth(_getActivityReport)