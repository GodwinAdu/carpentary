"use server"

import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import { hash } from "bcryptjs";
import { wrappedSendMail } from "../nodemailer";
import { verificationEmailTemplate } from "../mail_template/email_verify";
import { generateCode, generateUsernameFromName } from "../utils";
import Code from "../models/code.models";


interface CreateUserValues {
    fullName: string,
    dob: string,
    email: string,
    phone: string,
    gender: string,
    password: string,
}

export async function createUser(values: CreateUserValues) {
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
                html: verificationEmailTemplate(code),
            })
        ]);
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