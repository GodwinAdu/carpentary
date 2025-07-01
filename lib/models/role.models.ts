import { Schema, model, models, Model } from "mongoose";

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
        map:{
            type: Boolean,
            default: false,
        },
        buildingTracking: {
            type: Boolean,
            default: false,
        },
        hrManagement: {
            type: Boolean,
            default: false,
        },
        paymentAccount: {
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

        addExpenses: {
            type: Boolean,
            default: false,
        },
        manageExpenses: {
            type: Boolean,
            default: false,
        },
        viewExpenses: {
            type: Boolean,
            default: false,
        },
        editExpenses: {
            type: Boolean,
            default: false,
        },
        deleteExpenses: {
            type: Boolean,
            default: false,
        },
        listExpenses: {
            type: Boolean,
            default: false
        },
        addListAccount: {
            type: Boolean,
            default: false,
        },
        manageListAccount: {
            type: Boolean,
            default: false,
        },
        viewListAccount: {
            type: Boolean,
            default: false,
        },
        editListAccount: {
            type: Boolean,
            default: false,
        },
        deleteListAccount: {
            type: Boolean,
            default: false,
        },
        // HR Access
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

        // Request Salary Access
        addRequestSalary: {
            type: Boolean,
            default: false
        },
        viewRequestSalary: {
            type: Boolean,
            default: false
        },
        editRequestSalary: {
            type: Boolean,
            default: false
        },
        deleteRequestSalary: {
            type: Boolean,
            default: false
        },
        manageRequestSalary: {
            type: Boolean,
            default: false
        },

        // Request Leave Access
        addRequestLeave: {
            type: Boolean,
            default: false
        },
        viewRequestLeave: {
            type: Boolean,
            default: false
        },
        editRequestLeave: {
            type: Boolean,
            default: false
        },
        deleteRequestLeave: {
            type: Boolean,
            default: false
        },
        manageRequestLeave: {
            type: Boolean,
            default: false
        },

        // Leave Category Access
        addLeaveCategory: {
            type: Boolean,
            default: false
        },
        viewLeaveCategory: {
            type: Boolean,
            default: false
        },
        editLeaveCategory: {
            type: Boolean,
            default: false
        },
        deleteLeaveCategory: {
            type: Boolean,
            default: false
        },
        manageLeaveCategory: {
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
        },
        paymentAccountReport: {
            type: Boolean,
            default: false
        },
        profitLostReport: {
            type: Boolean,
            default: false
        },
        itemsReport: {
            type: Boolean,
            default: false
        },
        registerReport: {
            type: Boolean,
            default: false
        },
        expensesReport: {
            type: Boolean,
            default: false
        },
        productSellReport: {
            type: Boolean,
            default: false
        },
        productPurchaseReport: {
            type: Boolean,
            default: false
        },
        sellReturnReport: {
            type: Boolean,
            default: false
        },
        purchaseReturnReport: {
            type: Boolean,
            default: false
        },
        stockTransferReport: {
            type: Boolean,
            default: false
        },
        stockAdjustmentReport: {
            type: Boolean,
            default: false
        },
        salesReport: {
            type: Boolean,
            default: false
        },
        purchaseReport: {
            type: Boolean,
            default: false
        },
        trendingProductReport: {
            type: Boolean,
            default: false
        },
        stockExpiryReport: {
            type: Boolean,
            default: false
        },
        stockReport: {
            type: Boolean,
            default: false
        },
        taxReport: {
            type: Boolean,
            default: false
        },
        saleRepresentativeReport: {
            type: Boolean,
            default: false
        },
        customerSupplierReport: {
            type: Boolean,
            default: false
        },
    },
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
