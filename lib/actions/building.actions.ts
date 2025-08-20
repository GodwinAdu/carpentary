"use server";

import { revalidatePath } from "next/cache";
import { type User, withAuth } from "../helpers/auth";
import Building from "../models/building.models";
import History from "../models/history.models";
import { connectToDB } from "../mongoose";
import { deleteDocument } from "./trash.actions";
import { createActivity } from "./activity.actions";

interface CreateBuildingProps {
    image: string;
    location: { lat: number; lng: number } | null;
    buildingType: string;
    description: string;
    category: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    address: string;
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
            createActivity({
                userId: user._id,
                type: 'building_create',
                action: `Created new building: ${buildingType}`,
                details: { entityId: building._id, entityType: 'Building' }
            })
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

        await createActivity({
            userId: user._id,
            type: 'building_access',
            action: `Viewed building: ${building.buildingType}`,
            details: { entityId: id, entityType: 'Building' }
        });

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

        const features = results.map((doc: Record<string, unknown>) => ({
            id: String(doc._id),
            imgUrlsArray: doc.imgUrls,
            coordinates: doc.coordinates,
            buildingType: doc.buildingType,
            description: doc.description,
            category: doc.category,
            clientName: doc.clientName,
            clientEmail: doc.clientEmail,
            clientPhone: doc.clientPhone,
            place_name: doc.buildingType || 'No description',
            center: [Number((doc.coordinates as Record<string, unknown>)?.lng), Number((doc.coordinates as Record<string, unknown>)?.lat)],
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

        await Promise.all([
            history.save(),
            building.save(),
            createActivity({
                userId: user._id,
                type: 'building_update',
                action: `Updated building: ${building.buildingType}`,
                details: { entityId: id, entityType: 'Building' }
            })
        ]);

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

        await Promise.all([
            deleteDocument({
                actionType: 'BUILDING_DELETED',
                documentId: building._id,
                collectionName: 'Building',
                userId: `${user?._id}`,
                trashMessage: `Building with (ID: ${id}) was moved to trash by ${user.fullName}.`,
                historyMessage: `User ${user.fullName} deleted Building with (ID: ${id}) on ${new Date().toLocaleString()}.`
            }),
            createActivity({
                userId: user._id,
                type: 'building_access',
                action: `Deleted building: ${building.buildingType}`,
                details: { entityId: id, entityType: 'Building' }
            })
        ]);

        return { success: true, message: "Building deleted successfully" };
    } catch (error) {
        console.log("error while deleting Building", error)
        throw error;
    }
}


interface AddCommentProps {
    buildingId: string;
    userName: string;
    userEmail: string;
    comment: string;
    rating: number;
    visitDate: string;
    images?: string[];
}

interface AddPaymentProps {
    buildingId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId?: string;
    paymentDate: string;
    description: string;
    receivedBy: string;
    receivedByName: string;
    receiptUrl?: string;
}

interface UpdateQuotationProps {
    buildingId: string;
    totalProjectCost: number;
    materialsCost?: number;
    laborCost?: number;
    accessoriesCost?: number;
    transportationCost?: number;
    roofingType?: string;
    notes?: string;
}

async function _addComment(user: User, values: AddCommentProps) {
    try {
        if (!user) throw new Error("User not authenticated");

        await connectToDB();

        const building = await Building.findById(values.buildingId);
        if (!building) throw new Error("Building not found");

        const newComment = {
            user: user._id,
            userName: values.userName,
            userEmail: values.userEmail,
            comment: values.comment,
            rating: values.rating,
            images: values.images || [],
            isVerified: false,
            visitDate: new Date(values.visitDate),
        };

        building.comments.push(newComment);
        building.totalVisits += 1;

        const history = new History({
            actionType: 'COMMENT_ADDED',
            details: {
                itemId: building._id,
                addedAt: new Date(),
            },
            message: `User ${user.fullName} added a comment to building (ID: ${building._id}) on ${new Date()}.`,
            performedBy: user._id,
            entityId: building._id,
            entityType: 'BUILDING',
        });

        await Promise.all([
            building.save(),
            history.save(),
            createActivity({
                userId: user._id,
                type: 'building_access',
                action: `Added comment to building: ${building.buildingType}`,
                details: { entityId: building._id, entityType: 'Building' }
            })
        ]);

        return { success: true, message: "Comment added successfully" };
    } catch (error) {
        console.error("Error adding comment:", error);
        throw new Error("Failed to add comment. Please try again.");
    }
}

async function _addPayment(user: User, values: AddPaymentProps) {
    try {
        if (!user) throw new Error("User not authenticated");

        await connectToDB();

        const building = await Building.findById(values.buildingId);
        if (!building) throw new Error("Building not found");

        const newPayment = {
            amount: values.amount,
            currency: values.currency,
            paymentMethod: values.paymentMethod,
            transactionId: values.transactionId,
            paymentDate: new Date(values.paymentDate),
            description: values.description,
            status: "completed",
            receivedBy: values.receivedBy,
            receivedByName: values.receivedByName,
            receiptUrl: values.receiptUrl,
        };

        building.payments.push(newPayment);
        building.totalPaidAmount += values.amount;

        const history = new History({
            actionType: 'PAYMENT_ADDED',
            details: {
                itemId: building._id,
                amount: values.amount,
                addedAt: new Date(),
            },
            message: `User ${user.fullName} added a payment of $${values.amount} to building (ID: ${building._id}) on ${new Date()}.`,
            performedBy: user._id,
            entityId: building._id,
            entityType: 'BUILDING',
        });

        await Promise.all([
            building.save(),
            history.save(),
            createActivity({
                userId: user._id,
                type: 'building_access',
                action: `Added payment of $${values.amount} to building: ${building.buildingType}`,
                details: { entityId: building._id, entityType: 'Building', metadata: { amount: values.amount } }
            })
        ]);

        return { success: true, message: "Payment recorded successfully" };
    } catch (error) {
        console.error("Error adding payment:", error);
        throw new Error("Failed to record payment. Please try again.");
    }
}

async function _updateBuildingQuotation(user: User, values: UpdateQuotationProps) {
    try {
        if (!user) throw new Error("User not authenticated");

        await connectToDB();

        const building = await Building.findById(values.buildingId);
        if (!building) throw new Error("Building not found");

        const oldCost = building.totalProjectCost || 0;

        // Update the main cost field
        building.totalProjectCost = values.totalProjectCost;
        building.modifyBy = user._id;

        // Create quotation object
        const quotationData = {
            totalProjectCost: values.totalProjectCost,
            materialsCost: values.materialsCost || Math.round(values.totalProjectCost * 0.60),
            laborCost: values.laborCost || Math.round(values.totalProjectCost * 0.25),
            accessoriesCost: values.accessoriesCost || Math.round(values.totalProjectCost * 0.10),
            transportationCost: values.transportationCost || Math.round(values.totalProjectCost * 0.05),
            roofingType: values.roofingType,
            notes: values.notes,
            createdBy: user._id,
        };

        building.quotation = quotationData;

        // Save building first
        await building.save();

        // Create history and activity
        const history = new History({
            actionType: 'QUOTATION_UPDATED',
            details: {
                itemId: building._id,
                oldValue: oldCost,
                newValue: values.totalProjectCost,
                updatedAt: new Date(),
            },
            message: `User ${user.fullName} updated quotation for building (ID: ${building._id}) from ₵${oldCost} to ₵${values.totalProjectCost} on ${new Date()}.`,
            performedBy: user._id,
            entityId: building._id,
            entityType: 'BUILDING',
        });

        await Promise.all([
            history.save(),
            createActivity({
                userId: user._id,
                type: 'building_update',
                action: `Updated quotation for building: ${building.buildingType}`,
                details: {
                    entityId: building._id,
                    entityType: 'Building',
                    oldValue: oldCost.toString(),
                    newValue: values.totalProjectCost.toString(),
                    metadata: quotationData
                }
            })
        ]);

        revalidatePath(`/dashboard/buildings/building-list/${values.buildingId}`);

        return { success: true, message: "Quotation updated successfully" };
    } catch (error) {
        console.error("Error updating quotation:", error);
        throw error;
    }
}

export const createBuilding = await withAuth(_createBuilding)
export const fetchBuildingById = await withAuth(_fetchBuildingById)
export const searchBuilding = await withAuth(_searchBuilding)
export const fetchAllBuilding = await withAuth(_fetchAllBuilding)
export const updateBuilding = await withAuth(_updateBuilding)
export const deleteBuilding = await withAuth(_deleteBuilding)
export const addComment = await withAuth(_addComment)
export const addPayment = await withAuth(_addPayment)
export const updateBuildingQuotation = await withAuth(_updateBuildingQuotation)