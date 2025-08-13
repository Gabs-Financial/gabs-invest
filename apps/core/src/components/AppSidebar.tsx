"use client";

import * as React from "react";
import {
  Coins,
  Home,
  LifeBuoy,
  Lightbulb,
  Link,
  Map,
  Send,
  Users,
  Wallet,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { logoWhite } from "@/assets";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/app",
      icon: Home,
      isActive: true,
    },
    {
      title: "Balance",
      url: "#",
      icon: Coins,
    },
    {
      title: "Customers",
      url: "/app/customers",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  investment: [
    {
      title: "Transfers",
      url: "#",
      icon: Send,
    },
    {
      title: "Payment Links",
      url: "#",
      icon: Link,
    },
    {
      title: "Travel",
      url: "#",
      icon: Map,
    },
  ],
  banking: [
    {
      title: "Wallets",
      url: "#",
      icon: Wallet,
    },
    {
      title: "Transactions",
      url: "/app/transactions",
      icon: Link,
    },
    {
      title: "Bills Paymemnts",
      url: "#",
      icon: Lightbulb,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <img src={logoWhite} className="h-5 w-5 bg-contain"/>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate uppercase font-semibold">GABS Invest</span>
                  <span className="truncate text-xs">Core</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain items={data.banking} label="Banking" />
        <NavMain items={data.investment} label="Investment" />

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
