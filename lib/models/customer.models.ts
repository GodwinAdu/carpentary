import { models,model,Schema } from "mongoose";


const CustomerSchema = new Schema({
    username: {
        type: String,
        unique: true,
    },
    userType: {
        type: String,
        default: "customer", // Default user type is 'customer'
    },
    fullName:{
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
    },
    phoneNumber: {
        type: String,
        unique: true,
    },
    address: {
        type: String,
    }
},{
    timestamps: true,
    versionKey: false,
});

const Customer = models.Customer || model("Customer", CustomerSchema);

export default Customer;
