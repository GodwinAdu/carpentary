import { model, models, Schema } from "mongoose";


const BuildingSchema = new Schema({
    imgUrls: { type: [String], required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    buildingType: { type: String, required: true },
    description: { type: String, required: true },
    // clientId: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Customer",
    //     required: true
    // },
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


