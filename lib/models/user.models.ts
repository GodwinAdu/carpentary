import { model, models, Schema } from "mongoose";


interface Address {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
}

const AddressSchema = new Schema<Address>({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
});
const WorkScheduleSchema = new Schema<WorkSchedule>({
    day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    startTime: { type: String }, // Example: "09:00"
    endTime: { type: String },   // Example: "17:00"
});


const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        lowercase: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        default: "worker", // Default user type is 'worker'
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        default: null
    },
    emergencyNumber: {
        type: String,
        default: null,
    },
    dob: {
        type: Date,
        default: null
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other", "prefer-not-to-say"],
        default: "prefer-not-to-say",
    },
    bio: { type: String, trim: true },
    role: {
        type: String,
        default: "new", // Default role is 'new'
    },
    avatarUrl: {
        type: String, // Optional profile image URL
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    availableAllSchedule: {
        type: Boolean,
        default: false,
    },
    address: { type: AddressSchema },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    phoneVerified: {
        type: Boolean,
        default: false,
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    jobTitle: {
        type: String,
        default: null,
    },
    departmentId: {
        type: Schema.Types.ObjectId,
        ref: "Department",
        default: null,
    },
    workSchedule: { type: [WorkScheduleSchema], default: [] }, // Array of schedule entries
    workLocation: {
        type: String,
        enum: ["on-site", "remote", "hybrid"],
        default: "on-site",
    },
    cardDetails: {
        idCardType: {
            type: String,
            default: null,
        },
        idCardNumber: {
            type: String,
            default: null,
        },

    },
    accountDetails: {
        accountName: {
            type: String,
            default: null,
        },
        accountNumber: {
            type: String,
            default: null,
        },
        accountType: {
            type: String,
            default: null,
        }
    },
    startDate: {
        type: Date,
        default: null,
    },
    requirePasswordChange: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    onLeave: { type: Boolean, default: false },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    modifiedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    action_type: {
        type: String,
        enum: ["created", "updated", "deleted", "restored"],
        default: "created",
    },
},
    {
        timestamps: true,
    });

const User = models.User || model("User", UserSchema);

export default User;

