"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar  from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/shared/Toast";
import { useSocket }     from "@/hooks/useSocket";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads":     "Leads",
  "/agents":    "Agents",
  "/analytics": "Analytics",
  "/settings":  "Settings",
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Connect to Socket.io for real-time notifications
  useSocket();

  const title =
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? "PropVault";

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1120]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DashboardContent>{children}</DashboardContent>
    </ToastProvider>
  );
}
