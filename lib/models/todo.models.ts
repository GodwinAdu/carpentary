import { model, models, Schema } from "mongoose"

const TodoSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed", "cancelled"],
            default: "pending",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        category: {
            type: String,
            enum: ["work", "personal", "health", "learning", "other"],
            default: "work",
        },
        dueDate: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        tags: [String],
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subtasks: [{
            title: String,
            completed: { type: Boolean, default: false },
            completedAt: Date,
        }],
        attachments: [{
            name: String,
            url: String,
            type: String,
        }],
        reminder: {
            enabled: { type: Boolean, default: false },
            date: Date,
            sent: { type: Boolean, default: false },
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        estimatedTime: Number, // in minutes
        actualTime: Number, // in minutes
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

TodoSchema.index({ userId: 1, status: 1 })
TodoSchema.index({ dueDate: 1 })
TodoSchema.index({ priority: 1 })
TodoSchema.index({ category: 1 })

const Todo = models.Todo || model("Todo", TodoSchema)

export default Todo