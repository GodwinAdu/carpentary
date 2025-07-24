import { model, models, Schema } from "mongoose";


const BuildingSchema = new Schema({
    imgUrls: { type: [String], required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    address: { type: String },
    category: { type: String },
    buildingType: { type: String, required: true },
    description: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String },
    clientPhone: { type: String },
    status: {
        type: String,
        enum: [
            "pending",
            "under_review",
            "approved",
            "payment_started",
            "partially_paid",
            "fully_paid",
            "in_progress",
            "completed",
            "cancelled",
            "archived"
        ],
        default: "pending"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    modifyBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, {
    timestamps: true,
    versionKey: false,
});


const Building = models.Building || model("Building", BuildingSchema);

export default Building;


