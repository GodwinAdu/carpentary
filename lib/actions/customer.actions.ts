"use server"

import { hash } from "bcryptjs";
import { withAuth, type User } from "../helpers/auth";
import Customer from "../models/customer.models";
import { generateUsernameFromName } from "../utils";
import { connectToDB } from "../mongoose";

interface CustomerProps {
    fullName: string
    password: string
    phoneNumber: string
    email: string
    addresses: {
        city: string,
        country: string,
        state: string,
        street: string,
        zipCode: string
    }
}

async function _createCustomer(user: User, values: CustomerProps) {
    try {

        const { password, email, fullName, addresses, phoneNumber } = values

        if (!user) throw new Error("user not authenticated")

        const existingCustomer = await Customer.findOne({ email })

        if (existingCustomer) throw new Error("Customer exist in database")

        const newUsername = generateUsernameFromName(fullName)

        const hashedPassword = await hash(password, 10);

        const newCustomer = new Customer({
            username: newUsername,
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            addresses,
            active: true,
            createdBy: user._id
        });

        await newCustomer.save()

    } catch (error) {
        console.log("error while creating customer", error);
        throw error
    }
}

export const createCustomer = await withAuth(_createCustomer);



async function _getAllCustomers(user: User) {
    try {
        if (!user) throw new Error("user not authenticated");

        await connectToDB();

        const customers = await Customer.find({})

        if (!customers || customers.length === 0) return [];

        return JSON.parse(JSON.stringify(customers))
    } catch (error) {
        console.log("error while fetching all customers", error);
        throw error
    }
};

export const getAllCustomers = await withAuth(_getAllCustomers)