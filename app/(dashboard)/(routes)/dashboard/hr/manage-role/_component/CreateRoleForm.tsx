"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useParams, usePathname, useRouter } from "next/navigation"
import {
  Shield,
  Search,
  Save,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Info,
  FileText,
  CreditCard,
  BarChart3,
  Clock,
  Briefcase,
  TrendingUp,
  Home,
  DollarSign,
  Loader2,
  Map,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createRole } from "@/lib/actions/role.actions"
import { toast } from "sonner"

// Define the permission schema with Zod
const RoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z.object({
    manageAccess: z.boolean(),
    dashboard: z.boolean(),
    map: z.boolean(),
    buildingTracking: z.boolean(),
    liveTracking: z.boolean(),
    hrManagement: z.boolean(),
    account: z.boolean(),
    report: z.boolean(),
    addBuilding: z.boolean(),
    manageBuilding: z.boolean(),
    viewBuilding: z.boolean(),
    editBuilding: z.boolean(),
    deleteBuilding: z.boolean(),
    addExpenses: z.boolean(),
    manageExpenses: z.boolean(),
    viewExpenses: z.boolean(),
    editExpenses: z.boolean(),
    deleteExpenses: z.boolean(),
    listExpenses: z.boolean(),
    addListAccount: z.boolean(),
    manageListAccount: z.boolean(),
    viewListAccount: z.boolean(),
    editListAccount: z.boolean(),
    deleteListAccount: z.boolean(),
    addHr: z.boolean(),
    viewHr: z.boolean(),
    editHr: z.boolean(),
    deleteHr: z.boolean(),
    manageHr: z.boolean(),
    addRequestSalary: z.boolean(),
    viewRequestSalary: z.boolean(),
    editRequestSalary: z.boolean(),
    deleteRequestSalary: z.boolean(),
    manageRequestSalary: z.boolean(),
    addRequestLeave: z.boolean(),
    viewRequestLeave: z.boolean(),
    editRequestLeave: z.boolean(),
    deleteRequestLeave: z.boolean(),
    manageRequestLeave: z.boolean(),
    addLeaveCategory: z.boolean(),
    viewLeaveCategory: z.boolean(),
    editLeaveCategory: z.boolean(),
    deleteLeaveCategory: z.boolean(),
    manageLeaveCategory: z.boolean(),
    hrReport: z.boolean(),
    balanceSheet: z.boolean(),
    trialBalance: z.boolean(),
    cashFlow: z.boolean(),
    paymentAccountReport: z.boolean(),
    profitLostReport: z.boolean(),
    itemsReport: z.boolean(),
    registerReport: z.boolean(),
    expensesReport: z.boolean(),
    productSellReport: z.boolean(),
    productPurchaseReport: z.boolean(),
    sellReturnReport: z.boolean(),
    purchaseReturnReport: z.boolean(),
    stockTransferReport: z.boolean(),
    stockAdjustmentReport: z.boolean(),
    salesReport: z.boolean(),
    purchaseReport: z.boolean(),
    trendingProductReport: z.boolean(),
    stockExpiryReport: z.boolean(),
    stockReport: z.boolean(),
    taxReport: z.boolean(),
    saleRepresentativeReport: z.boolean(),
    customerSupplierReport: z.boolean(),
  }),
})

// Role presets for the system
const rolePresets = {
  admin: {
    label: "System Administrator",
    description: "Full access to all system features and settings",
    permissions: {
      manageAccess: true,
      dashboard: true,
      map: true,
      buildingTracking: true,
      liveTracking: true,
      hrManagement: true,
      account: true,
      report: true,
      addBuilding: true,
      manageBuilding: true,
      viewBuilding: true,
      editBuilding: true,
      deleteBuilding: true,
      addExpenses: true,
      manageExpenses: true,
      viewExpenses: true,
      editExpenses: true,
      deleteExpenses: true,
      listExpenses: true,
      addListAccount: true,
      manageListAccount: true,
      viewListAccount: true,
      editListAccount: true,
      deleteListAccount: true,
      addHr: true,
      viewHr: true,
      editHr: true,
      deleteHr: true,
      manageHr: true,
      addRequestSalary: true,
      viewRequestSalary: true,
      editRequestSalary: true,
      deleteRequestSalary: true,
      manageRequestSalary: true,
      addRequestLeave: true,
      viewRequestLeave: true,
      editRequestLeave: true,
      deleteRequestLeave: true,
      manageRequestLeave: true,
      addLeaveCategory: true,
      viewLeaveCategory: true,
      editLeaveCategory: true,
      deleteLeaveCategory: true,
      manageLeaveCategory: true,
      hrReport: true,
      balanceSheet: true,
      trialBalance: true,
      cashFlow: true,
      paymentAccountReport: true,
      profitLostReport: true,
      itemsReport: true,
      registerReport: true,
      expensesReport: true,
      productSellReport: true,
      productPurchaseReport: true,
      sellReturnReport: true,
      purchaseReturnReport: true,
      stockTransferReport: true,
      stockAdjustmentReport: true,
      salesReport: true,
      purchaseReport: true,
      trendingProductReport: true,
      stockExpiryReport: true,
      stockReport: true,
      taxReport: true,
      saleRepresentativeReport: true,
      customerSupplierReport: true,
    },
  },
  viewer: {
    label: "Data Viewer",
    description: "View access to various reports and tracking data",
    permissions: {
      manageAccess: false,
      dashboard: true,
      map: true,
      buildingTracking: true,
      liveTracking: true,
      hrManagement: false,
      account: false,
      report: true,
      addBuilding: false,
      manageBuilding: false,
      viewBuilding: true,
      editBuilding: false,
      deleteBuilding: false,
      addExpenses: false,
      manageExpenses: false,
      viewExpenses: true,
      editExpenses: false,
      deleteExpenses: false,
      listExpenses: true,
      addListAccount: false,
      manageListAccount: false,
      viewListAccount: true,
      editListAccount: false,
      deleteListAccount: false,
      addHr: false,
      viewHr: true,
      editHr: false,
      deleteHr: false,
      manageHr: false,
      addRequestSalary: false,
      viewRequestSalary: true,
      editRequestSalary: false,
      deleteRequestSalary: false,
      manageRequestSalary: false,
      addRequestLeave: false,
      viewRequestLeave: true,
      editRequestLeave: false,
      deleteRequestLeave: false,
      manageRequestLeave: false,
      addLeaveCategory: false,
      viewLeaveCategory: true,
      editLeaveCategory: false,
      deleteLeaveCategory: false,
      manageLeaveCategory: false,
      hrReport: true,
      balanceSheet: true,
      trialBalance: true,
      cashFlow: true,
      paymentAccountReport: true,
      profitLostReport: true,
      itemsReport: true,
      registerReport: true,
      expensesReport: true,
      productSellReport: true,
      productPurchaseReport: true,
      sellReturnReport: true,
      purchaseReturnReport: true,
      stockTransferReport: true,
      stockAdjustmentReport: true,
      salesReport: true,
      purchaseReport: true,
      trendingProductReport: true,
      stockExpiryReport: true,
      stockReport: true,
      taxReport: true,
      saleRepresentativeReport: true,
      customerSupplierReport: true,
    },
  },
  buildingManager: {
    label: "Building Manager",
    description: "Manages buildings and related expenses",
    permissions: {
      manageAccess: false,
      dashboard: true,
      map: true,
      buildingTracking: true,
      liveTracking: true,
      hrManagement: false,
      account: true,
      report: true,
      addBuilding: true,
      manageBuilding: true,
      viewBuilding: true,
      editBuilding: true,
      deleteBuilding: true,
      addExpenses: true,
      manageExpenses: true,
      viewExpenses: true,
      editExpenses: true,
      deleteExpenses: true,
      listExpenses: true,
      addListAccount: true,
      manageListAccount: true,
      viewListAccount: true,
      editListAccount: true,
      deleteListAccount: true,
      addHr: false,
      viewHr: false,
      editHr: false,
      deleteHr: false,
      manageHr: false,
      addRequestSalary: false,
      viewRequestSalary: false,
      editRequestSalary: false,
      deleteRequestSalary: false,
      manageRequestSalary: false,
      addRequestLeave: false,
      viewRequestLeave: false,
      editRequestLeave: false,
      deleteRequestLeave: false,
      manageRequestLeave: false,
      addLeaveCategory: false,
      viewLeaveCategory: false,
      editLeaveCategory: false,
      deleteLeaveCategory: false,
      manageLeaveCategory: false,
      hrReport: false,
      balanceSheet: true,
      trialBalance: true,
      cashFlow: true,
      paymentAccountReport: true,
      profitLostReport: true,
      itemsReport: false,
      registerReport: false,
      expensesReport: true,
      productSellReport: false,
      productPurchaseReport: false,
      sellReturnReport: false,
      purchaseReturnReport: false,
      stockTransferReport: false,
      stockAdjustmentReport: false,
      salesReport: false,
      purchaseReport: false,
      trendingProductReport: false,
      stockExpiryReport: false,
      stockReport: false,
      taxReport: false,
      saleRepresentativeReport: false,
      customerSupplierReport: false,
    },
  },
  hrSpecialist: {
    label: "HR Specialist",
    description: "Manages HR records, salary, and leave requests",
    permissions: {
      manageAccess: false,
      dashboard: true,
      map: false,
      buildingTracking: false,
      liveTracking: false,
      hrManagement: true,
      account: false,
      report: true,
      addBuilding: false,
      manageBuilding: false,
      viewBuilding: false,
      editBuilding: false,
      deleteBuilding: false,
      addExpenses: false,
      manageExpenses: false,
      viewExpenses: false,
      editExpenses: false,
      deleteExpenses: false,
      listExpenses: false,
      addListAccount: false,
      manageListAccount: false,
      viewListAccount: false,
      editListAccount: false,
      deleteListAccount: false,
      addHr: true,
      viewHr: true,
      editHr: true,
      deleteHr: true,
      manageHr: true,
      addRequestSalary: true,
      viewRequestSalary: true,
      editRequestSalary: true,
      deleteRequestSalary: true,
      manageRequestSalary: true,
      addRequestLeave: true,
      viewRequestLeave: true,
      editRequestLeave: true,
      deleteRequestLeave: true,
      manageRequestLeave: true,
      addLeaveCategory: true,
      viewLeaveCategory: true,
      editLeaveCategory: true,
      deleteLeaveCategory: true,
      manageLeaveCategory: true,
      hrReport: true,
      balanceSheet: false,
      trialBalance: false,
      cashFlow: false,
      paymentAccountReport: false,
      profitLostReport: false,
      itemsReport: false,
      registerReport: false,
      expensesReport: false,
      productSellReport: false,
      productPurchaseReport: false,
      sellReturnReport: false,
      purchaseReturnReport: false,
      stockTransferReport: false,
      stockAdjustmentReport: false,
      salesReport: false,
      purchaseReport: false,
      trendingProductReport: false,
      stockExpiryReport: false,
      stockReport: false,
      taxReport: false,
      saleRepresentativeReport: false,
      customerSupplierReport: false,
    },
  },
  accountant: {
    label: "Accountant",
    description: "Financial and accounting access",
    permissions: {
      manageAccess: false,
      dashboard: true,
      map: false,
      buildingTracking: false,
      liveTracking: false,
      hrManagement: false,
      account: true,
      report: true,
      addBuilding: false,
      manageBuilding: false,
      viewBuilding: false,
      editBuilding: false,
      deleteBuilding: false,
      addExpenses: true,
      manageExpenses: true,
      viewExpenses: true,
      editExpenses: true,
      deleteExpenses: true,
      listExpenses: true,
      addListAccount: true,
      manageListAccount: true,
      viewListAccount: true,
      editListAccount: true,
      deleteListAccount: true,
      addHr: false,
      viewHr: false,
      editHr: false,
      deleteHr: false,
      manageHr: false,
      addRequestSalary: false,
      viewRequestSalary: false,
      editRequestSalary: false,
      deleteRequestSalary: false,
      manageRequestSalary: false,
      addRequestLeave: false,
      viewRequestLeave: false,
      editRequestLeave: false,
      deleteRequestLeave: false,
      manageRequestLeave: false,
      addLeaveCategory: false,
      viewLeaveCategory: false,
      editLeaveCategory: false,
      deleteLeaveCategory: false,
      manageLeaveCategory: false,
      hrReport: false,
      balanceSheet: true,
      trialBalance: true,
      cashFlow: true,
      paymentAccountReport: true,
      profitLostReport: true,
      itemsReport: true,
      registerReport: true,
      expensesReport: true,
      productSellReport: true,
      productPurchaseReport: true,
      sellReturnReport: true,
      purchaseReturnReport: true,
      stockTransferReport: true,
      stockAdjustmentReport: true,
      salesReport: true,
      purchaseReport: true,
      trendingProductReport: true,
      stockExpiryReport: true,
      stockReport: true,
      taxReport: true,
      saleRepresentativeReport: true,
      customerSupplierReport: true,
    },
  },
}

// Permission category definitions
const permissionCategories = {
  global: {
    title: "Global Access",
    icon: <Shield className="h-5 w-5" />,
    permissions: ["manageAccess"],
  },
  core: {
    title: "Core Modules",
    icon: <Home className="h-5 w-5" />,
    permissions: ["dashboard", "hrManagement","map", "buildingTracking", "liveTracking", "account", "report"],
  },
  buildingManagement: {
    title: "Building Management",
    icon: <Building className="h-5 w-5" />,
    permissions: ["addBuilding", "manageBuilding", "viewBuilding", "editBuilding", "deleteBuilding"],
  },
  expenses: {
    title: "Expense Management",
    icon: <CreditCard className="h-5 w-5" />,
    permissions: ["addExpenses", "manageExpenses", "viewExpenses", "editExpenses", "deleteExpenses", "listExpenses"],
  },
  accounts: {
    title: "Account Management",
    icon: <DollarSign className="h-5 w-5" />,
    permissions: ["addListAccount", "manageListAccount", "viewListAccount", "editListAccount", "deleteListAccount"],
  },
  hr: {
    title: "HR Records",
    icon: <Briefcase className="h-5 w-5" />,
    permissions: ["addHr", "viewHr", "editHr", "deleteHr", "manageHr"],
  },
  salaryRequests: {
    title: "Salary Requests",
    icon: <DollarSign className="h-5 w-5" />,
    permissions: [
      "addRequestSalary",
      "viewRequestSalary",
      "editRequestSalary",
      "deleteRequestSalary",
      "manageRequestSalary",
    ],
  },
  leaveRequests: {
    title: "Leave Requests",
    icon: <Clock className="h-5 w-5" />,
    permissions: [
      "addRequestLeave",
      "viewRequestLeave",
      "editRequestLeave",
      "deleteRequestLeave",
      "manageRequestLeave",
    ],
  },
  leaveCategories: {
    title: "Leave Categories",
    icon: <FileText className="h-5 w-5" />,
    permissions: [
      "addLeaveCategory",
      "viewLeaveCategory",
      "editLeaveCategory",
      "deleteLeaveCategory",
      "manageLeaveCategory",
    ],
  },
  financialReports: {
    title: "Financial Reports",
    icon: <BarChart3 className="h-5 w-5" />,
    permissions: ["balanceSheet", "trialBalance", "cashFlow", "paymentAccountReport", "profitLostReport"],
  },
  businessReports: {
    title: "Business Reports",
    icon: <TrendingUp className="h-5 w-5" />,
    permissions: [
      "itemsReport",
      "registerReport",
      "expensesReport",
      "productSellReport",
      "productPurchaseReport",
      "sellReturnReport",
      "purchaseReturnReport",
      "stockTransferReport",
      "stockAdjustmentReport",
      "salesReport",
      "purchaseReport",
      "trendingProductReport",
      "stockExpiryReport",
      "stockReport",
      "taxReport",
      "saleRepresentativeReport",
      "customerSupplierReport",
      "hrReport",
    ],
  },
}

// Permission descriptions
const permissionDescriptions = {
  manageAccess: "Full system access with all permissions",
  dashboard: "Access to dashboard and overview",
  map: "Access to map view and functionalities",
  buildingTracking: "Access to building tracking features",
  liveTracking: "Access to live tracking data",
  hrManagement: "Access to the main HR management module",
  account: "Access to the main account management module",
  report: "Access to the main reporting module",
  addBuilding: "Create new building records",
  manageBuilding: "Full building management access",
  viewBuilding: "View building details",
  editBuilding: "Modify building information",
  deleteBuilding: "Remove building records",
  addExpenses: "Create new expense records",
  manageExpenses: "Full expense management access",
  viewExpenses: "View expense details",
  editExpenses: "Modify expense records",
  deleteExpenses: "Remove expense records",
  listExpenses: "View list of all expenses",
  addListAccount: "Create new accounts",
  manageListAccount: "Full account management access",
  viewListAccount: "View account details",
  editListAccount: "Modify account information",
  deleteListAccount: "Remove accounts",
  addHr: "Create new HR records",
  viewHr: "View HR information",
  editHr: "Modify HR records",
  deleteHr: "Remove HR records",
  manageHr: "Full HR management access",
  addRequestSalary: "Create new salary requests",
  viewRequestSalary: "View salary requests",
  editRequestSalary: "Modify salary requests",
  deleteRequestSalary: "Remove salary requests",
  manageRequestSalary: "Full salary request management",
  addRequestLeave: "Create new leave requests",
  viewRequestLeave: "View leave requests",
  editRequestLeave: "Modify leave requests",
  deleteRequestLeave: "Remove leave requests",
  manageRequestLeave: "Full leave request management",
  addLeaveCategory: "Create new leave categories",
  viewLeaveCategory: "View leave categories",
  editLeaveCategory: "Modify leave categories",
  deleteLeaveCategory: "Remove leave categories",
  manageLeaveCategory: "Full leave category management",
  hrReport: "Access HR reports",
  balanceSheet: "Access balance sheet reports",
  trialBalance: "Access trial balance reports",
  cashFlow: "Access cash flow reports",
  paymentAccountReport: "View payment account reports",
  profitLostReport: "Access profit & loss reports",
  itemsReport: "View items reports",
  registerReport: "Access register reports",
  expensesReport: "View expense reports",
  productSellReport: "Access product sales reports",
  productPurchaseReport: "View product purchase reports",
  sellReturnReport: "Access sales return reports",
  purchaseReturnReport: "View purchase return reports",
  stockTransferReport: "Access stock transfer reports",
  stockAdjustmentReport: "View stock adjustment reports",
  salesReport: "Access sales reports",
  purchaseReport: "Access purchase reports",
  trendingProductReport: "Access trending product reports",
  stockExpiryReport: "View stock expiry reports",
  stockReport: "Access stock reports",
  taxReport: "View tax reports",
  saleRepresentativeReport: "Access sales representative reports",
  customerSupplierReport: "View customer/supplier reports",
}

// Function to get a human-readable name from a camelCase permission key
const getReadableName = (key: string) => {
  // Handle special cases
  if (key === "hr") return "HR"
  if (key === "manageAccess") return "Full Access"
  // Convert camelCase to Title Case with spaces
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
}

interface IRole {
  _id?: string
  name?: string
  displayName?: string
  description?: string
  permissions?: {
    manageAccess?: boolean
    dashboard?: boolean
    map?: boolean
    buildingTracking?: boolean
    liveTracking?: boolean
    hrManagement?: boolean
    account?: boolean
    report?: boolean
    addBuilding?: boolean
    manageBuilding?: boolean
    viewBuilding?: boolean
    editBuilding?: boolean
    deleteBuilding?: boolean
    addExpenses?: boolean
    manageExpenses?: boolean
    viewExpenses?: boolean
    editExpenses?: boolean
    deleteExpenses?: boolean
    listExpenses?: boolean
    addListAccount?: boolean
    manageListAccount?: boolean
    viewListAccount?: boolean
    editListAccount?: boolean
    deleteListAccount?: boolean
    addHr?: boolean
    viewHr?: boolean
    editHr?: boolean
    deleteHr?: boolean
    manageHr?: boolean
    addRequestSalary?: boolean
    viewRequestSalary?: boolean
    editRequestSalary?: boolean
    deleteRequestSalary?: boolean
    manageRequestSalary?: boolean
    addRequestLeave?: boolean
    viewRequestLeave?: boolean
    editRequestLeave?: boolean
    deleteRequestLeave?: boolean
    manageRequestLeave?: boolean
    addLeaveCategory?: boolean
    viewLeaveCategory?: boolean
    editLeaveCategory?: boolean
    deleteLeaveCategory?: boolean
    manageLeaveCategory?: boolean
    hrReport?: boolean
    balanceSheet?: boolean
    trialBalance?: boolean
    cashFlow?: boolean
    paymentAccountReport?: boolean
    profitLostReport?: boolean
    itemsReport?: boolean
    registerReport?: boolean
    expensesReport?: boolean
    productSellReport?: boolean
    productPurchaseReport?: boolean
    sellReturnReport?: boolean
    purchaseReturnReport?: boolean
    stockTransferReport?: boolean
    stockAdjustmentReport?: boolean
    salesReport?: boolean
    purchaseReport?: boolean
    trendingProductReport?: boolean
    stockExpiryReport?: boolean
    stockReport?: boolean
    taxReport?: boolean
    saleRepresentativeReport?: boolean
    customerSupplierReport?: boolean
  }
}

const CreateRoleForm = ({ type, initialData }: { type: "create" | "update"; initialData?: IRole }) => {
  const path = usePathname()
  const router = useRouter()
  const params = useParams()
  const { schoolId, userId } = params
  const roleId = initialData?._id as string
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // Create default values for the form
  const defaultValues = {
    name: initialData?.name || "",
    displayName: initialData?.displayName || "",
    description: initialData?.description || "",
    permissions:
      initialData?.permissions ||
      Object.fromEntries(Object.keys(RoleSchema.shape.permissions.shape).map((key) => [key, false])),
  }

  // Initialize form with existing permissions or defaults
  const form = useForm<z.infer<typeof RoleSchema>>({
    resolver: zodResolver(RoleSchema),
    defaultValues,
  })

  const { isSubmitting } = form.formState
  const submit = initialData ? "Update" : "Create"
  const submitting = initialData ? "Updating..." : "Creating..."

  // Function to apply a role preset
  const applyRolePreset = (presetKey: string) => {
    if (rolePresets[presetKey as keyof typeof rolePresets]) {
      const preset = rolePresets[presetKey as keyof typeof rolePresets]
      // Get current form values
      const currentValues = form.getValues()
      // Update only the permissions, keeping other fields intact
      form.reset({
        ...currentValues,
        permissions: preset.permissions as Record<string, boolean>,
      })
      setSelectedPreset(presetKey)
      toast.success(`Applied ${preset.label} preset`, {
        description: preset.description,
      })
    }
  }

  // Function to toggle all permissions in a category
  const toggleCategoryPermissions = (category: string, value: boolean) => {
    const updatedValues = { ...form.getValues() }
    // Get all permissions in this category
    const permissionsInCategory = permissionCategories[category as keyof typeof permissionCategories].permissions
    // Update all permissions in the category
    permissionsInCategory.forEach((permission) => {
      updatedValues.permissions[permission as keyof typeof updatedValues.permissions] = value
    })
    form.reset(updatedValues)
  }

  // Function to check if a permission matches the search term
  const matchesSearch = (permission: string) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const permissionName = getReadableName(permission).toLowerCase()
    const description = permissionDescriptions[permission as keyof typeof permissionDescriptions]?.toLowerCase()
    return permissionName.includes(searchLower) || (description && description.includes(searchLower))
  }

  // Function to count enabled permissions in a category
  const countEnabledPermissions = (category: string) => {
    const permissions = permissionCategories[category as keyof typeof permissionCategories].permissions
    const values = form.getValues().permissions
    return permissions.filter((p) => values[p as keyof typeof values]).length
  }

  // Function to get total permissions in a category
  const getTotalPermissions = (category: string) => {
    return permissionCategories[category as keyof typeof permissionCategories].permissions.length
  }

  // Toggle expanding/collapsing all sections
  const toggleAllSections = () => {
    if (expandedSections.length === Object.keys(permissionCategories).length) {
      setExpandedSections([])
    } else {
      setExpandedSections(Object.keys(permissionCategories))
    }
  }

  // Handle form submission
  async function onSubmit(values: z.infer<typeof RoleSchema>) {
    try {
      if (type === "create") {
        await createRole(values, path)
      } else {
        // await updateRole(roleId, values, path)
      }
      form.reset()
      toast.success(`Role ${type === "create" ? "Created" : "Updated"} successfully`, {
        description: `A role was ${type === "create" ? "created" : "updated"} successfully...`,
      })
      router.push(`/${schoolId}/admin/${userId}/system-config/manage-role`)
    } catch (error) {
      console.log("something went wrong", error)
      toast.error("Something went wrong", {
        description: "Please try again later...",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {type === "create" ? "Create New Role" : "Update Role"}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {type === "create"
                        ? "Define a new role with specific permissions for your system"
                        : "Modify existing role permissions"}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Role Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Role Name..." {...field} />
                      </FormControl>
                      <FormDescription>Internal name used by the system</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Display Name..." {...field} />
                      </FormControl>
                      <FormDescription>Name shown to users in the interface</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Write a short description..." {...field} />
                      </FormControl>
                      <FormDescription>Brief explanation of this role&apos;s purpose</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              {/* Permissions Section */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2 className="text-xl font-bold">Role Permissions</h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select onValueChange={applyRolePreset} value={selectedPreset || undefined}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Apply preset" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(rolePresets).map(([key, preset]) => (
                          <SelectItem key={key} value={key}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search permissions..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleAllSections}
                      className="gap-1 bg-transparent"
                    >
                      {expandedSections.length === Object.keys(permissionCategories).length ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Collapse All
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Expand All
                        </>
                      )}
                    </Button>
                    {searchTerm && (
                      <Badge variant="outline" className="gap-1">
                        <Search className="h-3 w-3" />
                        {searchTerm}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                      <span>Enabled</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span>Disabled</span>
                    </div>
                  </div>
                </div>
                <Accordion
                  type="multiple"
                  value={expandedSections}
                  onValueChange={setExpandedSections}
                  className="space-y-4"
                >
                  {Object.entries(permissionCategories).map(([category, { title, icon, permissions }]) => {
                    const enabledCount = countEnabledPermissions(category)
                    const totalCount = getTotalPermissions(category)
                    const hasMatchingPermissions = permissions.some((permission) => matchesSearch(permission))
                    if (searchTerm && !hasMatchingPermissions) return null

                    return (
                      <AccordionItem key={category} value={category} className="border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-md bg-primary/10 text-primary">{icon}</div>
                              <div>
                                <h3 className="font-medium text-left">{title}</h3>
                                <p className="text-sm text-muted-foreground text-left">
                                  {enabledCount} of {totalCount} permissions enabled
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mr-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleCategoryPermissions(category, true)
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span className="sr-only md:not-sr-only md:inline-block">Enable All</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Enable all permissions in this category</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleCategoryPermissions(category, false)
                                      }}
                                    >
                                      <XCircle className="h-4 w-4 text-red-500" />
                                      <span className="sr-only md:not-sr-only md:inline-block">Disable All</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Disable all permissions in this category</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3 border-t bg-white dark:bg-gray-950">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {permissions.map((permission) => {
                              if (searchTerm && !matchesSearch(permission)) return null
                              // Explicitly type permission as keyof typeof RoleSchema.shape.permissions.shape
                              type PermissionKey = keyof typeof RoleSchema.shape.permissions.shape
                              const permissionKey = permission as PermissionKey
                              return (
                                <FormField
                                  key={permission}
                                  control={form.control}
                                  name={`permissions.${permissionKey}` as const}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                      <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                      <div className="space-y-1 leading-none flex-1">
                                        <FormLabel className="font-medium">{getReadableName(permission)}</FormLabel>
                                        <FormDescription>
                                          {permissionDescriptions[permission as keyof typeof permissionDescriptions] ||
                                            `Control access to ${getReadableName(permission).toLowerCase()} functionality`}
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Changes to permissions will be logged in the audit trail</span>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/${schoolId}/admin/${userId}/system-config/manage-role`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? submitting : submit}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}

export default CreateRoleForm
