"use server";

import { type User, withAuth } from "../helpers/auth";
import { currentUser } from "../helpers/session";
import Building from "../models/building.models";
import { connectToDB } from "../mongoose";

interface CreateBuildingProps {
    image: string;
    location: { lat: number; lng: number } | null;
    buildingType: string;
    description: string;
    clientId: string; // Assuming clientId is a string, adjust as necessary
}

export async function createBuilding(
    values: CreateBuildingProps
) {
    try {
        const user = await currentUser();
        const { image, location, buildingType, description } = values;
        await connectToDB();
        const building = new Building({
            imgUrls: [image],
            coordinates: location,
            buildingType,
            description,
            clientId: values.clientId, // Assuming clientId is passed in values
            status: "pending", // Default status
            createdBy: user._id,
        });
        await building.save();
    } catch (error) {
        console.error("Error creating building:", error);
        throw new Error("Failed to create building. Please try again.");
    }
}



async function _searchBuilding(user: User, query: string) {
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
            clientId: doc.clientId,
            place_name: doc.buildingType || 'No description',
            center: [doc.coordinates.lng, doc.coordinates.lat],
            status:doc.status,
            createdAt:doc.createdAt,
            updatedAt:doc.updatedAt,
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

export const searchBuilding = await withAuth(_searchBuilding)