"use server"

import { User, withAuth } from "../helpers/auth";
import Role from "../models/role.models";
import { connectToDB } from "../mongoose";

interface RoleValues {
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
}

async function _createRole(user: User, values: RoleValues) {
    try {
        if (!user) {
            throw new Error("User not authenticated");
        }
        await connectToDB();

        // Check if the role already exists
        const { name, displayName, description, permissions } = values;

        const newRole = new Role({
            name,
            displayName,
            description,
            permissions,
            createdBy: user._id,
        });

        await newRole.save();

        console.log("Role created successfully:", newRole);

    } catch (error) {
        console.error("Error creating role:", error);
        throw new Error("Failed to create role. Please try again.");
    }
}

async function _fetchAllRoles(user: User) {
    try {
        if (!user) {
            throw new Error("User not authenticated");
        }
        await connectToDB();

        const roles = await Role.find({});

        if (roles.length === 0) {
            return [];
        }

        return JSON.parse(JSON.stringify(roles));
    } catch (error) {
        console.log('Error fetching all roles', error);
        throw error;
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

async function _fetchRoleById<T>(user: User, roleId: string): Promise<T> {
    try {
        if (!user) {
            throw new Error("User not authenticated");
        }
        await connectToDB();

        const role = await Role.findById(roleId);

        if (!role) {
            throw new Error("Role not found");
        }

        return JSON.parse(JSON.stringify(role));
    } catch (error) {
        console.error("Error fetching role by ID:", error);
        throw new Error("Failed to fetch role by ID");
    }
}

async function _updateRole(user: User, roleId: string, values: RoleValues) {
    try {
        if (!user) {
            throw new Error("User not authenticated");
        }
        await connectToDB();

        const role = await Role.findById(roleId);

        if (!role) {
            throw new Error("Role not found");
        }

        role.name = values.name;
        role.displayName = values.displayName;
        role.description = values.description;
        role.permissions = values.permissions;

        await role.save();

        console.log("Role updated successfully:", role);

    } catch (error) {
        console.error("Error updating role:", error);
        throw new Error("Failed to update role. Please try again.");
    }
}

export const createRole = await withAuth(_createRole);
export const fetchRole = await withAuth(_fetchRole);
export const fetchAllRoles = await withAuth(_fetchAllRoles);
export const fetchRoleById = await withAuth(_fetchRoleById);
export const updateRole = await withAuth(_updateRole);