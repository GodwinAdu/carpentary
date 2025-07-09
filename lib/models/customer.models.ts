import { models, model, Schema } from "mongoose";

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

const CustomerSchema = new Schema({
    username: {
        type: String,
        unique: true,

    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
    },
    dob:{
        type:Date,
        default:null
    },
    phoneNumber: {
        type: String,
        unique: true,
    },
    addresses: { type: AddressSchema },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    modifiedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    active: {
        type: Boolean,
        default: false
    },
    freezed: {
        type: Boolean,
        default: false
    },
    banned: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false,
});

const Customer = models.Customer || model("Customer", CustomerSchema);

export default Customer;
