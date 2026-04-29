"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2, LayoutDashboard, Users, BarChart3,
  Settings, LogOut, X, TrendingUp, Bell,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",     href: "/dashboard",     icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Leads",         href: "/leads",          icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Notifications", href: "/notifications",  icon: <Bell className="w-5 h-5" /> },
  { label: "Agents",        href: "/agents",         icon: <Users className="w-5 h-5" />, adminOnly: true },
  { label: "Analytics",     href: "/analytics",      icon: <BarChart3 className="w-5 h-5" />, adminOnly: true },
  { label: "Settings",      href: "/settings",       icon: <Settings className="w-5 h-5" /> },
];

interface SidebarProps {
  open:    boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-30 flex flex-col",
          "glass-dark border-r border-slate-800/60",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/60">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Building2 className="w-4 h-4 text-slate-900" />
            </div>
            <div>
              <p className="text-base font-bold text-gold-gradient leading-none">PropVault</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Real Estate CRM</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-yellow-400/10 text-yellow-400 border-l-2 border-yellow-400 pl-[10px]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="px-3 py-4 border-t border-slate-800/60">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/40 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-yellow-400">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
