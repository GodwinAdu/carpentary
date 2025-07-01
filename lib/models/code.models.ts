import { model, models, Schema } from "mongoose";


const CodeSchema = new Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        maxlength: 6,
        validate: {
            validator: (v: string) => /^[0-9]+$/.test(v),
            message: "Code must be a 6-digit number.",
        },
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: "Invalid email format.",
        },
    },
    type: {
        type: String,
        enum: ["email", "phone", "2fa"],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // 10 minutes
    },
}, {
    versionKey: false,
});

const Code = models.Code || model("Code", CodeSchema);

export default Code;
