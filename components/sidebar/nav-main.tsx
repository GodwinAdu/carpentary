"use client"

import {
  ChevronRight,
  Combine,
  Menu,
  HistoryIcon,
  Trash,
  HousePlusIcon,
  Map,
  CheckSquare,
  LucideAlignVerticalJustifyCenter
} from "lucide-react"
import { IRole } from "@/lib/models/role.models"
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
  user: any | undefined
}

export function NavMain({ role, user }: NavMainProps) {
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
      roleField: "liveTracking"
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
          roleField:"manageBuilding"
        },
        {
          title: "Building List",
          url: `/dashboard/buildings/building-list`,
          roleField:"manageBuilding"
        },
        {
          title: "Schedule Activities",
          url: `/dashboard/buildings/activities`,
          roleField:"manageBuilding"
        },
      ]
    },
    {
      title: "HR Management",
      url: "#",
      icon: Combine,
      roleField: "hrManagement",
      items: [
        {
          title: "Departments",
          url: `/dashboard/hr/departments`,
          roleField: "manageDepartment"
        },
        {
          title: "Staffs",
          url: `/dashboard/hr/staffs`,
          roleField: "manageStaff"
        },
        {
          title: "Roles",
          url: `/dashboard/hr/manage-role`,
          roleField: "manageRole"
        },
      ],
    },

    {
      title: "My Todos",
      url: `/dashboard/todos`,
      icon: CheckSquare,
      isActive: false,
      roleField: "myTodo"
    },
    {
      title: "Reports",
      url: `/dashboard/report`,
      icon: LucideAlignVerticalJustifyCenter,
      isActive: false,
      roleField: "report",
    },
    user.role === "admin" && {
      title: "History",
      url: `/dashboard/history`,
      icon: HistoryIcon,
      isActive: false,
    },
    user.role === "admin" && {
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
