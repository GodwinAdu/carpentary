"use server";

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
            // clientId: values.clientId, // Assuming clientId is passed in values
            status: "pending", // Default status
            createdBy: user._id,
        });
        await building.save();
    } catch (error) {
        console.error("Error creating building:", error);
        throw new Error("Failed to create building. Please try again.");
    }
}