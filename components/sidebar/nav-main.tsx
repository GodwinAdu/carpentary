"use client"

import {
  Users,
  ChevronRight,
  HandCoins,
  Combine,
  Mail,
  Menu,
  HistoryIcon,
  Trash,
  LucideReceiptText,
  Car,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  DollarSign,
  CreditCard,
  HousePlusIcon,
  Map
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType;
  roleField?: keyof IRole | string;
  isActive?: boolean;
  items?: NavItem[];
}


interface NavMainProps {
  role: IRole | undefined;
}

export function NavMain({ role }: NavMainProps) {
  const pathname = usePathname();

  const [openGroup, setOpenGroup] = useState<string | null>(null)








  const navMain: (NavItem | false)[] = [
    {
      title: "Overview",
      url: `/dashboard`,
      icon: Menu,
      isActive: false,
      roleField: "dashboard"

    },
    {
      title: "Live Tracking",
      url: `/live-map`,
      icon: Map,
      isActive: false,
      roleField: "dashboard"
    },
    {
      title: "Customers",
      url: `/dashboard/customers`,
      icon: Map,
      isActive: false,
      roleField: "dashboard"
    },
    {
      title: "Building Tracking",
      url: "#",
      icon: HousePlusIcon,
      isActive: false,
      roleField: "buildingTracking",
      items: [
        {
          title: "Manage Buildings",
          url: `/dashboard/buildings/manage-building`,
        },
        {
          title: "Building List",
          url: `/dashboard/buildings/building-list`,

        },
        {
          title: "Schedule Activities",
          url: `/dashboard/buildings/activities`,

        },
      ]
    },
    {
      title: "Reports",
      url: "#",
      icon: BarChart3,
      roleField: "report",
      items: [
        {
          title: "Profit/Lost Report",
          url: `/dashboard/report/profit-lost-report`,
          roleField: "profitLostReport"
        },
        {
          title: "Items Report",
          url: `/dashboard/report/items-report`,
          roleField: "itemsReport"
        },
        {
          title: "Register Report",
          url: `/dashboard/report/register-report`,
          roleField: "registerReport"
        },
        {
          title: "Expenses Report",
          url: `/dashboardreport//expenses-report`,
          roleField: "expensesReport"
        }, {
          title: "Product Sell Report",
          url: `/dashboard/report/product-sell-report`,
          roleField: "productSellReport"
        }, {
          title: "Product Purchase Report",
          url: `/dashboard/report/product-purchase-report`,
          roleField: "productPurchaseReport"
        }, {
          title: "Sell Return Report",
          url: `/dashboard/report/sell-return-report`,
          roleField: "sellReturnReport"
        }, {
          title: "Purchase Return Report",
          url: `/dashboard/report/purchase-return-report`,
          roleField: "purchaseReturnReport"
        }, {
          title: "Trending Product Report",
          url: `/dashboard/report/trending-product-report`,
          roleField: "trendingProductReport"
        }, {
          title: "Purchase & Sale Report",
          url: `/dashboard/report/purchase-sale-report`,
          // roleField: ""
        }, {
          title: "Stock Adjustment Report",
          url: `/dashboard/report/stock-adjustment-report`,
          roleField: "stockAdjustmentReport"
        }, {
          title: "Stock Transfer Report",
          url: `/dashboard/report/stock-transfer-report`,
          roleField: "stockTransferReport"
        }, {
          title: "Stock Expiry Report",
          url: `/dashboard/report/stock-expiry-report`,
          roleField: "stockExpiryReport"
        }, {
          title: "Stock Report",
          url: `/dashboard/report/stock-report`,
          roleField: "stockReport"
        }, {
          title: "Customer Group Report",
          url: `/dashboard/report/customer-group-report`,
          roleField: "customerGroupReport"
        }, {
          title: "Customer & Supplier Report",
          url: `/dashboard/report/customer-supplier-report`,
          roleField: "customerSupplierReport"
        }, {
          title: "Tax Report",
          url: `/dashboard/report/tax-report`,
          roleField: "taxReport"
        }, {
          title: "Sale Representative Report",
          url: `/dashboard/report/sale-representative-report`,
          roleField: "saleRepresentativeReport",
        }
      ],
    },
    {
      title: "Hr and Payroll",
      url: "#",
      icon: Combine,
      roleField: "hrManagement",
      items: [
        {
          title: "Departments",
          url: `/dashboard/hr/departments`,
          roleField: "manageHr"
        },
        {
          title: "Staffs",
          url: `/dashboard/hr/staffs`,
          roleField: "manageHr"
        },
        {
          title: "Roles",
          url: `/dashboard/hr/manage-role`,
          roleField: "manageHr"
        },
        {
          title: "Salary Structure",
          url: `/dashboard/hr-payroll/salary-structure`,
          roleField: "manageHr"
        },
        {
          title: "Salary Assign",
          url: `/dashboard/hr-payroll/salary-assign`,
          roleField: "manageHr"
        },
        {
          title: "Salary Payment",
          url: `/dashboard/hr-payroll/salary-payment`,
          roleField: "manageHr"
        },
        {
          title: "Request Salary",
          url: `/dashboard/hr-payroll/request-salary`,
          roleField: "manageRequestSalary",
        },
        {
          title: "Manage Salary Request",
          url: `/dashboard/hr-payroll/manage-request-salary`,
          roleField: "manageHr"
        },
        {
          title: "Request Leave",
          url: `/dashboard/hr-payroll/request-leave`,
          roleField: "manageRequestLeave",
        },
        {
          title: "Manage Leave",
          url: `/dashboard/hr-payroll/manage-leave`,
          roleField: "manageHr"
        },
        {
          title: "Awards",
          url: `/dashboard/hr-payroll/awards`,
          roleField: "manageHr"
        },
      ],
    },
   
    {
      title: "History",
      url: `/dashboard/history`,
      icon: HistoryIcon,
      isActive: false,
    },
    {
      title: "Trash",
      url: `/dashboard/trash`,
      icon: Trash,
      isActive: false,
    }

  ];
  const isActive = useCallback(
    (url: string) => {
      const dashboardPath = `/dashboard`;

      if (pathname === dashboardPath || pathname === `${dashboardPath}/`) {
        return url === pathname; // Only activate when it exactly matches the dashboard
      }

      return pathname.startsWith(url) && url !== dashboardPath;
    },
    [pathname, ,]
  );

  // Automatically open collapsible if an item inside is active
  useEffect(() => {
    navMain.filter((group): group is NavItem => group !== false).forEach((group) => {
      if (group.items?.some((item) => isActive(item.url))) {
        setOpenGroup(group.title);
      }
    });
  }, [pathname]);


  return (

    <SidebarGroup className="scrollbar-hide">
      <SidebarGroupLabel>Nav links</SidebarGroupLabel>
      <SidebarMenu >
        {navMain
          .filter((item): item is NavItem => item !== false)
          .filter((item) => !item.roleField || (role && role[item.roleField as keyof IRole]))
          .map((item) =>
            item.items ? (
              <Collapsible
                key={item.title}
                open={openGroup === item.title}
                onOpenChange={() => setOpenGroup((prev) => (prev === item.title ? null : item.title))}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "transition-colors hover:bg-primary/10 hover:text-primary",
                        item.items?.some((subItem) => isActive(subItem.url)) && "bg-primary text-white font-medium",
                      )}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight
                        className={`ml-auto shrink-0 transition-transform duration-200 ${openGroup === item.title ? "rotate-90" : ""}`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items
                        ?.filter((subItem) => !subItem?.roleField || (role && role[subItem?.roleField as keyof IRole]))
                        .map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={cn(
                                "transition-colors hover:text-primary",
                                isActive(subItem.url) && "bg-primary/10 text-primary font-medium",
                              )}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "transition-colors hover:bg-primary/10 hover:text-primary",
                    isActive(item.url) && "bg-primary text-white font-medium",
                  )}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
      </SidebarMenu>
    </SidebarGroup>

  )
}
