"use server"

import Code from "../models/code.models";
import User from "../models/user.models";
import { connectToDB } from "../mongoose";

export async function verifyCode(
    code: string,
    email: string
) {
    try {

        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            throw new Error("Invalid code format. Please enter a 6-digit numeric code.");
        }
        await connectToDB();

        const [user, verify] = await Promise.all([
            User.findOne({ email }),
            Code.findOne({ code })
        ]);

        if (!user) {
            throw new Error("User not found.");
        }

        if (!verify) {
            throw new Error("Verification code not found or has expired. Please request a new code.");
        }

        if (verify.type !== "email" || verify.email !== email) {
            throw new Error("Invalid verification code.");
        }

        user.emailVerified = true; // Set email as verified

        await Promise.all([
            user.save(), // Save the updated user document
            Code.deleteOne({ _id: verify._id }) // If the code is found, delete it to prevent reuse
        ]);
        return true;

    } catch (error) {
        console.error("Error verifying code:", error);
        throw new Error("Verification failed. Please try again.");
    }
}