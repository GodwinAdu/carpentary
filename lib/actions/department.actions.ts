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

export const createDepartment = await withAuth(_createDepartment);
export const fetchAllDepartments = await withAuth(_fetchAllDepartments);