"use server"

import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import { hash } from "bcryptjs";
import { wrappedSendMail } from "../nodemailer";
import { verificationEmailTemplate } from "../mail_template/email_verify";
import { generateCode, generateUsernameFromName } from "../utils";
import Code from "../models/code.models";
import { deleteDocument } from "./trash.actions";
import { type User as UserProps, withAuth } from "../helpers/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


interface CreateUserValues {
    username: string
    fullName: string
    email: string
    phoneNumber: string
    emergencyNumber: string
    password: string
    role: string
    avatarUrl: string
    isActive: true,
    availableAllSchedule: boolean,
    requirePasswordChange: boolean,
    address: {
        street: string
        city: string
        state: string
        country:string
        zipCode: string
    },
    jobTitle: string
    departmentId: string
    workLocation: "on-site" | "remote" | "hybrid"
    workSchedule: string[],
    warehouse: string[],
    gender: "male" | "female" | "other" | "prefer-not-to-say"
    bio: string
    cardDetails: {
        idCardType: string
        idCardNumber: string
    },
    accountDetails: {
        accountName: string
        accountNumber: string
        accountType: string
    },
}


export async function createUser(values: CreateUserValues, path: string) {
    try {
        // Validate required fields
        const { password, email } = values
        if (!password || !email) {
            throw new Error(" email, and password are required");
        }
        await connectToDB();

        const [existingUserByEmail] = await Promise.all([
            User.findOne({ email }),
        ]);

        // Check if user already exists
        if (existingUserByEmail) {
            throw new Error("User already exists in database")
        };

        const hashedPassword = await hash(password, 10);
        const code = generateCode(6); // Generate a 6-digit verification code
        const username = generateUsernameFromName(values.fullName);

        const newUser = new User({
            ...values,
            username: username,
            password: hashedPassword,
            userType: "worker",
            action_type: "created",

        });

        const newCode = new Code({
            code,
            email,
            type: "email",
        })

        // const history = new History({
        //     actionType: 'STAFF_CREATED',
        //     details: {
        //         itemId: newUser._id,
        //         deletedAt: new Date(),
        //     },
        //     message: `User ${user.fullName} created User named "${newUser.fullName}" (ID: ${newUser._id}) on ${new Date()}.`,
        //     performedBy: user._id, // User who performed the action,
        //     entityId: newUser._id,  // The ID of the deleted unit
        //     entityType: 'STAFF',  // The type of the entity
        // });

        await Promise.all([
            newUser.save(),
            newCode.save(),
            wrappedSendMail({
                to: email,
                subject: "Verify Your Email",
                html: verificationEmailTemplate(code, email, password),
            }),
            createActivity({
                userId: newUser._id,
                type: 'system_access',
                action: `New user account created: ${values.fullName}`,
                details: { entityId: newUser._id, entityType: 'User' }
            })
        ]);
        revalidatePath(path);
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");

    }
}


export async function fetchUserById(id: string) {
    try {
        await connectToDB();
        const user = await User.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw new Error("Failed to fetch user");
    }
}





async function _fetchAllStaffs(user: UserProps) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB();

        const staffs = await User.find({})
        if (staffs.length === 0) return [];

        return JSON.parse(JSON.stringify(staffs))
    } catch (error) {
        console.log("Something went wrong", error);
        throw error
    }
}

export const fetchAllUsers = await withAuth(_fetchAllStaffs)

async function _deleteStaff(user: UserProps, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")

        await connectToDB()

        const staff = await User.findById(id)

        if (!staff) {
            throw new Error("Staff not found");
        }

        await deleteDocument({
            actionType: 'STAFF_DELETED',
            documentId: staff._id,
            collectionName: 'Staff',
            userId: `${user?._id}`,
            trashMessage: `"${staff.fullName}" (ID: ${id}) was moved to trash by ${user.fullName}.`,
            historyMessage: `User ${user.fullName} deleted "${staff.fullName}" (ID: ${id}) on ${new Date().toLocaleString()}.`,
        });

        return { success: true, message: "Staff deleted successfully" };
    } catch (error) {
        console.log("error while deleting staff", error)
        throw error;
    }
}

export const deleteStaff = await withAuth(_deleteStaff)

async function _updateUserStatus(user: UserProps, id: string, status: 'active' | 'inactive') {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const staff = await User.findByIdAndUpdate(
            id, 
            { 
                status, 
                lastModified: new Date(),
                modifiedBy: user._id 
            }, 
            { new: true }
        )

        if (!staff) throw new Error("Staff not found")
        
        // Log activity
        await createActivity({
            userId: id,
            type: 'status_change',
            action: `Account ${status === 'active' ? 'activated' : 'deactivated'}`,
            details: {
                oldValue: staff.status,
                newValue: status
            }
        })
        
        revalidatePath('/dashboard/hr/staffs')
        return { success: true, message: `Staff ${status === 'active' ? 'activated' : 'deactivated'} successfully` }
    } catch (error) {
        console.error("Error updating user status:", error)
        throw error
    }
}

export const updateUserStatus = await withAuth(_updateUserStatus)

// Add activity logging to existing functions
import { createActivity } from "./activity.actions"

// Update existing functions to log activities
export async function logUserLogin(userId: string) {
    await createActivity({
        userId,
        type: 'login',
        action: 'User logged into the system'
    })
}

export async function logUserLogout(userId: string) {
    await createActivity({
        userId,
        type: 'logout', 
        action: 'User logged out of the system'
    })
}

async function _resetUserPassword(user: UserProps, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const staff = await User.findById(id)
        if (!staff) throw new Error("Staff not found")

        const resetCode = generateCode(8)
        const newCode = new Code({
            code: resetCode,
            email: staff.email,
            type: "password_reset",
        })

        await Promise.all([
            newCode.save(),
            wrappedSendMail({
                to: staff.email,
                subject: "Password Reset Request",
                html: `
                    <h2>Password Reset</h2>
                    <p>Hello ${staff.fullName},</p>
                    <p>A password reset has been requested for your account.</p>
                    <p><strong>Reset Code:</strong> ${resetCode}</p>
                    <p>Use this code to reset your password. This code will expire in 24 hours.</p>
                    <p>If you didn't request this reset, please ignore this email.</p>
                `,
            })
        ])

        // Log activity
        await createActivity({
            userId: id,
            type: 'password_change',
            action: 'Password reset requested'
        })
        
        return { success: true, message: "Password reset email sent successfully" }
    } catch (error) {
        console.error("Error resetting password:", error)
        throw error
    }
}

export const resetUserPassword = await withAuth(_resetUserPassword)

async function _sendInviteEmail(user: UserProps, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const staff = await User.findById(id)
        if (!staff) throw new Error("Staff not found")

        const inviteCode = generateCode(6)
        const newCode = new Code({
            code: inviteCode,
            email: staff.email,
            type: "invite",
        })

        await Promise.all([
            newCode.save(),
            wrappedSendMail({
                to: staff.email,
                subject: "Welcome to GML Roofing Systems",
                html: `
                    <h2>Welcome to GML Roofing Systems!</h2>
                    <p>Hello ${staff.fullName},</p>
                    <p>You have been invited to join our team at GML Roofing Systems.</p>
                    <p><strong>Verification Code:</strong> ${inviteCode}</p>
                    <p>Please use this code to complete your account setup.</p>
                    <p>Welcome aboard!</p>
                `,
            })
        ])

        // Log activity
        await createActivity({
            userId: id,
            type: 'email_verification',
            action: 'Invitation email sent'
        })
        
        return { success: true, message: "Invitation sent successfully" }
    } catch (error) {
        console.error("Error sending invite:", error)
        throw error
    }
}

export const sendInviteEmail = await withAuth(_sendInviteEmail)

async function _updateUser(user: UserProps, id: string, updateData: Partial<CreateUserValues>) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const updatedStaff = await User.findByIdAndUpdate(
            id,
            {
                ...updateData,
                lastModified: new Date(),
                modifiedBy: user._id
            },
            { new: true }
        )

        if (!updatedStaff) throw new Error("Staff not found")
        
        revalidatePath('/dashboard/hr/staffs')
        // Log activity
        await createActivity({
            userId: id,
            type: 'profile_update',
            action: 'Profile information updated'
        })
        
        revalidatePath('/dashboard/hr/staffs')
        return { success: true, message: "Staff updated successfully" }
    } catch (error) {
        console.error("Error updating user:", error)
        throw error
    }
}

export const updateUser = await withAuth(_updateUser)
