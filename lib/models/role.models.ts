import { Schema, model, models, Model } from "mongoose";

// Define the IRole interface
interface IRole {
    _id?: string
    name: string
    displayName: string
    description?: string
    permissions: {
        manageAccess: boolean
        dashboard: boolean
        map: boolean
        buildingTracking: boolean
        liveTracking: boolean
        hrManagement: boolean
        myTodo: boolean
        report: boolean
        addBuilding: boolean
        manageBuilding: boolean
        viewBuilding: boolean
        editBuilding: boolean
        deleteBuilding: boolean
        addHr: boolean
        viewHr: boolean
        editHr: boolean
        deleteHr: boolean
        manageHr: boolean
        addRole: boolean
        viewRole: boolean
        editRole: boolean
        deleteRole: boolean
        manageRole: boolean
        hrReport: boolean
        balanceSheet: boolean
        trialBalance: boolean
        cashFlow: boolean
    }
    userCount?: Schema.Types.ObjectId[]
    createdBy?: Schema.Types.ObjectId
    modifyBy?: Schema.Types.ObjectId
    deletedBy?: Schema.Types.ObjectId
    action_type?: string
}

// Define the Role schema
const RoleSchema: Schema<IRole> = new Schema({
    name: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    permissions: {
        manageAccess: {
            type: Boolean,
            default: false,
        },
        dashboard: {
            type: Boolean,
            default: false,
        },
        map: {
            type: Boolean,
            default: false,
        },
        buildingTracking: {
            type: Boolean,
            default: false,
        },
        liveTracking: {
            type: Boolean,
            default: false,
        },
        hrManagement: {
            type: Boolean,
            default: false,
        },
        myTodo: {
            type: Boolean,
            default: false,
        },
        report: {
            type: Boolean,
            default: false,
        },
        addBuilding: {
            type: Boolean,
            default: false,
        },
        manageBuilding: {
            type: Boolean,
            default: false,
        },
        viewBuilding: {
            type: Boolean,
            default: false,
        },
        editBuilding: {
            type: Boolean,
            default: false,
        },
        deleteBuilding: {
            type: Boolean,
            default: false,
        },
        addHr: {
            type: Boolean,
            default: false
        },
        viewHr: {
            type: Boolean,
            default: false
        },
        editHr: {
            type: Boolean,
            default: false
        },
        deleteHr: {
            type: Boolean,
            default: false
        },
        manageHr: {
            type: Boolean,
            default: false
        },
        addRole: {
            type: Boolean,
            default: false
        },
        viewRole: {
            type: Boolean,
            default: false
        },
        editRole: {
            type: Boolean,
            default: false
        },
        deleteRole: {
            type: Boolean,
            default: false
        },
        manageRole: {
            type: Boolean,
            default: false
        },
        hrReport: {
            type: Boolean,
            default: false
        },
        balanceSheet: {
            type: Boolean,
            default: false
        },
        trialBalance: {
            type: Boolean,
            default: false
        },
        cashFlow: {
            type: Boolean,
            default: false
        }
    },
    userCount: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    modifyBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    action_type: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false,
    minimize: false,
});

// Define the model type
type RoleModel = Model<IRole>;

// Create or retrieve the Role model
const Role: RoleModel = models.Role || model<IRole>("Role", RoleSchema);

export default Role;
