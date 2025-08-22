import { model, models, Schema } from "mongoose"

const CommentSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userName: { type: String },
        userEmail: { type: String },
        comment: { type: String },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5,
        },
        images: [String], // Optional images with the comment
        isVerified: { type: Boolean, default: false }, // For verified visits
        visitDate: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    },
)

const PaymentSchema = new Schema(
    {
        amount: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        paymentMethod: {
            type: String,
            enum: ["cash", "mobile_money", "bank_transfer", "credit_card", "check", "digital_wallet"],
            required: true,
        },
        transactionId: { type: String },
        paymentDate: { type: Date, required: true },
        description: { type: String },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
        },
        receivedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receivedByName: { type: String, required: true },
        receiptUrl: { type: String }, // URL to receipt/invoice
    },
    {
        timestamps: true,
    },
)

const QuotationSchema = new Schema(
    {
        totalProjectCost: { type: Number },
        materialsCost: { type: Number },
        laborCost: { type: Number },
        accessoriesCost: { type: Number },
        transportationCost: { type: Number },
        roofingType: {
            type: String,
            enum: ["metal_sheets", "clay_tiles", "concrete_tiles", "asphalt_shingles", "corrugated_iron"],
        },
        notes: { type: String },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    },
)

const BuildingSchema = new Schema(
    {
        imgUrls: { type: [String], required: true },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        address: { type: String },
        category: {
            type: String,
        },
        buildingType: { type: String, required: true },
        description: { type: String, required: true },

        // Client Information
        clientName: { type: String},
        clientEmail: { type: String },
        clientPhone: { type: String },
        clientCompany: { type: String },

        // Enhanced Building Details
        buildingDetails: {
            floors: { type: Number },
            totalArea: { type: Number }, // in sq ft
            yearBuilt: { type: Number },
            architect: { type: String },
            contractor: { type: String },
            parkingSpaces: { type: Number },
            roofArea: { type: Number }, // in sq ft - specific for roofing business
            roofPitch: { type: String }, // roof slope/pitch
            existingRoofType: { type: String }, // current roof type if replacement
        },

        // Financial Information
        totalProjectCost: { type: Number, default: 0 },
        totalPaidAmount: { type: Number, default: 0 },
        remainingBalance: { type: Number },
        payments: [PaymentSchema],
        quotation: QuotationSchema,

        // Comments and Reviews
        comments: [CommentSchema],
        averageRating: { type: Number, default: 0 },
        totalVisits: { type: Number, default: 0 },

        // Project Status
        status: {
            type: String,
            enum: [
                "pending",
                "quotation_sent",
                "deal_closed",
                "partially_paid",
                "fully_paid",
                "in_progress",
                "completed",
                "cancelled",
                "archived",
            ],
            default: "pending",
        },

        // Priority and Tags
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        tags: [String],

        // Tracking Information
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

        // Additional Metadata
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        completionDate: { type: Date },
        startDate: { type: Date },
        estimatedCompletionDate: { type: Date },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

// Calculate remaining balance before saving
BuildingSchema.pre("save", function (next) {
    if (this.totalProjectCost && this.totalPaidAmount) {
        this.remainingBalance = this.totalProjectCost - this.totalPaidAmount
    }

    // Calculate average rating
    if (this.comments && this.comments.length > 0) {
        const totalRating = this.comments.reduce((sum, comment) => sum + comment.rating, 0)
        this.averageRating = totalRating / this.comments.length
    }

    next()
})

// Indexes for better performance
BuildingSchema.index({ coordinates: "2dsphere" })
BuildingSchema.index({ status: 1 })
BuildingSchema.index({ category: 1 })
BuildingSchema.index({ createdAt: -1 })
BuildingSchema.index({ clientEmail: 1 })

const Building = models.Building || model("Building", BuildingSchema);

export default Building
