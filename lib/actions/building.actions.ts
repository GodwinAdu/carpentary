"use server";

import { revalidatePath } from "next/cache";
import { type User, withAuth } from "../helpers/auth";
import Building from "../models/building.models";
import History from "../models/history.models";
import { connectToDB } from "../mongoose";
import { deleteDocument } from "./trash.actions";

interface CreateBuildingProps {
    image: string;
    location: { lat: number; lng: number } | null;
    buildingType: string;
    description: string;
    category: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    address:string;
}

async function _createBuilding(
    user: User,
    values: CreateBuildingProps,
    path: string
) {
    try {
        if (!user) throw new Error("User not authenticated");

        const { image, location, buildingType, description, category, clientName, clientEmail, clientPhone, address } = values;

        await connectToDB();

        const building = new Building({
            imgUrls: [image],
            coordinates: location,
            buildingType,
            description,
            category,
            clientName,
            clientEmail,
            clientPhone,
            address,
            status: "pending", // Default status
            createdBy: user._id,
        });

        const history = new History({
            actionType: 'BUILDING_CREATED',
            details: {
                itemId: building._id,
                deletedAt: new Date(),
            },
            message: `User ${user.fullName} created a building (ID: ${building._id}) on ${new Date()}.`,
            performedBy: user._id, // User who performed the action,
            entityId: building._id,  // The ID of the deleted unit
            entityType: 'BUILDING',  // The type of the entity
        });

        await Promise.all([
            building.save(),
            history.save(),
        ]);

        revalidatePath(path);

    } catch (error) {
        console.error("Error creating building:", error);
        throw new Error("Failed to create building. Please try again.");
    }
}


async function _fetchBuildingById(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authenticated");
        await connectToDB();

        const building = await Building.findById(id);

        if (!building) throw new Error("Building not found");

        return JSON.parse(JSON.stringify(building));
    } catch (error) {
        console.log("error while fetching building by id", error);
        throw error;
    }
}

async function _searchBuilding<T>(user: User, query: string): Promise<T[]> {
    try {

        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const results = await Building.find({
            $or: [
                { description: { $regex: query, $options: 'i' } },
                { buildingType: { $regex: query, $options: 'i' } },
                { status: { $regex: query, $options: 'i' } },
            ],
        })
            .limit(8)
            .lean()

        console.log(results, "server result")

        const features = results.map((doc: any) => ({
            id: doc._id.toString(),
            imgUrlsArray: doc.imgUrls,
            coordinates: doc.coordinates,
            buildingType: doc.buildingType,
            description: doc.description,
            category: doc.category,
            clientName: doc.clientName,
            clientEmail: doc.clientEmail,
            clientPhone: doc.clientPhone,
            place_name: doc.buildingType || 'No description',
            center: [doc.coordinates.lng, doc.coordinates.lat],
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            place_type: ['place'],
            properties: {
                buildingType: doc.buildingType,
                status: doc.status,
            },
        }));

        if (features.length === 0) return [];

        return JSON.parse(JSON.stringify(features))
    } catch (error) {
        console.log("error occurred while search for building", error);
        throw error

    }
}




async function _fetchAllBuilding(user: User) {
    try {
        if (!user) throw new Error("User not authenticated")

        const buildings = await Building.find({});

        if (buildings.length === 0) return [];

        return JSON.parse(JSON.stringify(buildings))

    } catch (error) {
        console.log("error while fetch all buildings", error);
        throw error
    }
};


async function _updateBuilding(user: User, id: string, values: CreateBuildingProps) {
    try {
        if (!user) throw new Error("User not authenticated")

        await connectToDB()

        const building = await Building.findById(id)

        if (!building) throw new Error("Building not found")

        Object.assign(building, values);

        const history = new History({
            actionType: 'BUILDING_UPDATED',
            details: {
                itemId: building._id,
                updatedAt: new Date(),
            },
            message: `User ${user.fullName} updated a building (ID: ${building._id}) on ${new Date()}.`,
            performedBy: user._id,
            entityId: building._id,
            entityType: 'BUILDING',
        });

        await history.save();

        await building.save();

        return { success: true, message: "Building updated successfully" };
    } catch (error) {
        console.log("error while updating Building", error)
        throw error;
    }
}

async function _deleteBuilding(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authenticated")

        await connectToDB()

        const building = await Building.findById(id)

        await deleteDocument({
            actionType: 'BUILDING_DELETED',
            documentId: building._id,
            collectionName: 'Building',
            userId: `${user?._id}`,
            trashMessage: `Building with (ID: ${id}) was moved to trash by ${user.fullName}.`,
            historyMessage: `User ${user.fullName} deleted Building with (ID: ${id}) on ${new Date().toLocaleString()}.`
        });

        return { success: true, message: "Building deleted successfully" };
    } catch (error) {
        console.log("error while deleting Building", error)
        throw error;
    }
}


export const createBuilding = await withAuth(_createBuilding)
export const fetchBuildingById = await withAuth(_fetchBuildingById)
export const searchBuilding = await withAuth(_searchBuilding)
export const fetchAllBuilding = await withAuth(_fetchAllBuilding)

export const updateBuilding = await withAuth(_updateBuilding)
export const deleteBuilding = await withAuth(_deleteBuilding)