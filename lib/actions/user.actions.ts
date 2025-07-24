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
            await wrappedSendMail({
                to: email,
                subject: "Verify Your Email",
                html: verificationEmailTemplate(code, email, password),
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
