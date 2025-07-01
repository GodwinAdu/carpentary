"use server"

import { User, withAuth } from "../helpers/auth";
import Role from "../models/role.models";
import { connectToDB } from "../mongoose";

const values = {
    name: "Admin",
    displayName: "admin",
    description: "Has full access to all features and settings.",
    permissions: {
        manageAccess: true,
        dashboard: true,
        map: true,
        buildingTracking: true,
        hrManagement: true,
        paymentAccount: true,
        report: true,
        addBuilding: true,
        manageBuilding: true,
        viewBuilding: true,
        editBuilding: true,
        deleteBuilding: true,
        addExpenses: true,
        manageExpenses: true,
        viewExpenses: true,
        editExpenses: true,
        deleteExpenses: true,
        addHr: true,
        viewHr: true,
        editHr: true,
        deleteHr: true,
        manageHr: true,
    },
}

export async function createRole() {
    try {

        await connectToDB();

        // Check if the role already exists
        const { name, displayName, description, permissions } = values;

        const newRole = new Role({
            name,
            displayName,
            description,
            permissions,
        });

        await newRole.save();

        console.log("Role created successfully:", newRole);

    } catch (error) {
        console.error("Error creating role:", error);
        throw new Error("Failed to create role. Please try again.");
    }
}


async function _fetchRole(user: User, value: string) {
    try {

        const schoolId = user.schoolId
        await connectToDB();

        const role = await Role.findOne({ schoolId, displayName: value });

        if (!role) {
            throw new Error("Role not found");
        }

        return JSON.parse(JSON.stringify(role));

    } catch (error) {
        console.log('Error fetching role', error);
        throw error;
    }

}

export const fetchRole = await withAuth(_fetchRole)