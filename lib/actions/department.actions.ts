"use server"

import { withAuth, type User } from "../helpers/auth";
import Department from "../models/deparment.models";


async function _createDepartment<T>(user: User, values): Promise<T> {
    try {
        console.log("Creating department with values:", values);
        if (!user || !user._id) {
            throw new Error("User not authenticated");
        }
        const existingDepartment = await Department.findOne({ name: values.name });
        if (existingDepartment) {
            throw new Error("Department with this name already exists");
        }
        const departmentData = new Department({
            ...values,
            createdBy: user._id,
            action_type: "create",
        });
        const newDepartment = await departmentData.save();
        return newDepartment;
    } catch (error) {
        console.error("Error creating department:", error);
        throw error;

    }
};

async function _fetchAllDepartments<T>(user: User): Promise<T[]> {
    try {
        if (!user || !user._id) {
            throw new Error("User not authenticated");
        }

        const departments = await Department.find({})
            .populate("createdBy", "fullName")
            .sort({ createdAt: -1 });

        if (!departments || departments.length === 0) {
            return [];
        }

        return JSON.parse(JSON.stringify(departments));
    } catch (error) {
        console.error("Error fetching departments:", error);
        throw error;
    }
};

async function _fetchDepartmentById<T>(user: User, departmentId: string): Promise<T> {
    try {
        if (!user || !user._id) {
            throw new Error("User not authenticated");
        }

        const department = await Department.findById(departmentId)
            .populate("createdBy", "fullName email")
            .populate("modifiedBy", "fullName email")
            .populate("members", "fullName email jobTitle avatarUrl isActive");

        if (!department) {
            throw new Error("Department not found");
        }

        return JSON.parse(JSON.stringify(department));
    } catch (error) {
        console.error("Error fetching department:", error);
        throw error;
    }
};

async function _updateDepartment<T>(user: User, departmentId: string, values: any): Promise<T> {
    try {
        if (!user || !user._id) {
            throw new Error("User not authenticated");
        }

        const updatedDepartment = await Department.findByIdAndUpdate(
            departmentId,
            {
                ...values,
                modifiedBy: user._id,
                action_type: "update",
            },
            { new: true }
        ).populate("members", "fullName email jobTitle avatarUrl status");

        if (!updatedDepartment) {
            throw new Error("Department not found");
        }

        return JSON.parse(JSON.stringify(updatedDepartment));
    } catch (error) {
        console.error("Error updating department:", error);
        throw error;
    }
};

async function _addMemberToDepartment<T>(user: User, departmentId: string, memberId: string): Promise<T> {
    try {
        if (!user || !user._id) {
            throw new Error("User not authenticated");
        }

        const department = await Department.findById(departmentId);
        if (!department) {
            throw new Error("Department not found");
        }

        if (department.members.includes(memberId)) {
            throw new Error("User is already a member of this department");
        }

        const updatedDepartment = await Department.findByIdAndUpdate(
            departmentId,
            {
                $push: { members: memberId },
                modifiedBy: user._id,
                action_type: "add_member",
            },
            { new: true }
        ).populate("members", "fullName email jobTitle avatarUrl status");

        return JSON.parse(JSON.stringify(updatedDepartment));
    } catch (error) {
        console.error("Error adding member to department:", error);
        throw error;
    }
};

export const createDepartment = await withAuth(_createDepartment);
export const fetchAllDepartments = await withAuth(_fetchAllDepartments);
export const fetchDepartmentById = await withAuth(_fetchDepartmentById);
export const updateDepartment = await withAuth(_updateDepartment);
export const addMemberToDepartment = await withAuth(_addMemberToDepartment);