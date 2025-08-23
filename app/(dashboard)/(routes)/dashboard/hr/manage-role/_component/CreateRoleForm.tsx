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
  Users,
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
import { createRole, updateRole } from "@/lib/actions/role.actions"
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
    myTodo: z.boolean(),
    report: z.boolean(),
    addBuilding: z.boolean(),
    manageBuilding: z.boolean(),
    viewBuilding: z.boolean(),
    editBuilding: z.boolean(),
    deleteBuilding: z.boolean(),
    addHr: z.boolean(),
    viewHr: z.boolean(),
    editHr: z.boolean(),
    deleteHr: z.boolean(),
    manageHr: z.boolean(),
    addRole: z.boolean(),
    viewRole: z.boolean(),
    editRole: z.boolean(),
    deleteRole: z.boolean(),
    manageRole: z.boolean(),
    hrReport: z.boolean(),
    balanceSheet: z.boolean(),
    trialBalance: z.boolean(),
    cashFlow: z.boolean(),
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
      myTodo: true,
      report: true,
      addBuilding: true,
      manageBuilding: true,
      viewBuilding: true,
      editBuilding: true,
      deleteBuilding: true,
      addHr: true,
      viewHr: true,
      editHr: true,
      deleteHr: true,
      manageHr: true,
      addRole: true,
      viewRole: true,
      editRole: true,
      deleteRole: true,
      manageRole: true,
      hrReport: true,
      balanceSheet: true,
      trialBalance: true,
      cashFlow: true,
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
      myTodo: false,
      report: true,
      addBuilding: false,
      manageBuilding: false,
      viewBuilding: true,
      editBuilding: false,
      deleteBuilding: false,
      addHr: false,
      viewHr: true,
      editHr: false,
      deleteHr: false,
      manageHr: false,
      addRole: false,
      viewRole: true,
      editRole: false,
      deleteRole: false,
      manageRole: false,
      hrReport: true,
      balanceSheet: true,
      trialBalance: true,
      cashFlow: true,
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
      myTodo: true,
      report: true,
      addBuilding: true,
      manageBuilding: true,
      viewBuilding: true,
      editBuilding: true,
      deleteBuilding: true,
      addHr: false,
      viewHr: false,
      editHr: false,
      deleteHr: false,
      manageHr: false,
      addRole: false,
      viewRole: false,
      editRole: false,
      deleteRole: false,
      manageRole: false,
      hrReport: false,
      balanceSheet: true,
      trialBalance: true,
      cashFlow: true,
    },
  },
  moderator: {
    label: "Moderator",
    description: "Moderate access with limited administrative privileges",
    permissions: {
      manageAccess: false,
      dashboard: true,
      map: true,
      buildingTracking: true,
      liveTracking: true,
      hrManagement: true,
      myTodo: false,
      report: true,
      addBuilding: false,
      manageBuilding: false,
      viewBuilding: true,
      editBuilding: false,
      deleteBuilding: false,
      addHr: false,
      viewHr: true,
      editHr: false,
      deleteHr: false,
      manageHr: false,
      addRole: false,
      viewRole: true,
      editRole: false,
      deleteRole: false,
      manageRole: false,
      hrReport: true,
      balanceSheet: false,
      trialBalance: false,
      cashFlow: false,
    },
  },
  worker: {
    label: "Worker",
    description: "Basic access for regular workers",
    permissions: {
      manageAccess: false,
      dashboard: true,
      map: false,
      buildingTracking: false,
      liveTracking: false,
      hrManagement: false,
      myTodo: false,
      report: false,
      addBuilding: false,
      manageBuilding: false,
      viewBuilding: false,
      editBuilding: false,
      deleteBuilding: false,
      addHr: false,
      viewHr: false,
      editHr: false,
      deleteHr: false,
      manageHr: false,
      addRole: false,
      viewRole: false,
      editRole: false,
      deleteRole: false,
      manageRole: false,
      hrReport: false,
      balanceSheet: false,
      trialBalance: false,
      cashFlow: false,
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
    permissions: ["dashboard", "hrManagement", "map", "buildingTracking", "liveTracking", "myTodo", "report"],
  },
  buildingManagement: {
    title: "Building Management",
    icon: <Building className="h-5 w-5" />,
    permissions: ["addBuilding", "manageBuilding", "viewBuilding", "editBuilding", "deleteBuilding"],
  },
  hr: {
    title: "HR Records",
    icon: <Briefcase className="h-5 w-5" />,
    permissions: ["addHr", "viewHr", "editHr", "deleteHr", "manageHr"],
  },
  roleManagement: {
    title: "Role Management",
    icon: <Users className="h-5 w-5" />,
    permissions: ["addRole", "viewRole", "editRole", "deleteRole", "manageRole"],
  },
  reports: {
    title: "Reports",
    icon: <BarChart3 className="h-5 w-5" />,
    permissions: ["hrReport", "balanceSheet", "trialBalance", "cashFlow"],
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
  myTodo: "Access to the main todo management module",
  report: "Access to the main reporting module",
  addBuilding: "Create new building records",
  manageBuilding: "Full building management access",
  viewBuilding: "View building details",
  editBuilding: "Modify building information",
  deleteBuilding: "Remove building records",
  addHr: "Create new HR records",
  viewHr: "View HR information",
  editHr: "Modify HR records",
  deleteHr: "Remove HR records",
  manageHr: "Full HR management access",
  addRole: "Create new roles",
  viewRole: "View role details",
  editRole: "Modify role information",
  deleteRole: "Remove roles",
  manageRole: "Full role management access",
  hrReport: "Access HR reports",
  balanceSheet: "Access balance sheet reports",
  trialBalance: "Access trial balance reports",
  cashFlow: "Access cash flow reports",
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
    myTodo?: boolean
    report?: boolean
    addBuilding?: boolean
    manageBuilding?: boolean
    viewBuilding?: boolean
    editBuilding?: boolean
    deleteBuilding?: boolean
    addHr?: boolean
    viewHr?: boolean
    editHr?: boolean
    deleteHr?: boolean
    manageHr?: boolean
    addRole?: boolean
    viewRole?: boolean
    editRole?: boolean
    deleteRole?: boolean
    manageRole?: boolean
    hrReport?: boolean
    balanceSheet?: boolean
    trialBalance?: boolean
    cashFlow?: boolean
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
        await updateRole(roleId, values, path)
      }
      form.reset()
      toast.success(`Role ${type === "create" ? "Created" : "Updated"} successfully`, {
        description: `A role was ${type === "create" ? "created" : "updated"} successfully...`,
      })
      router.push(`/dashboard/hr/manage-role`)
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
                  onClick={() => router.push(`/dashboard/hr/manage-role`)}
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
