"use client";

import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  onMenuClick: () => void;
  title?:      string;
  notifications?: number;
}

export default function Navbar({ onMenuClick, title = "Dashboard", notifications = 0 }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-200">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full" />
          )}
        </button>

        {/* Role badge */}
        <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
          user?.role === "admin"
            ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
            : "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
        }`}>
          {user?.role === "admin" ? "👑 Admin" : "🧑‍💼 Agent"}
        </span>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-yellow-400/20 flex items-center justify-center">
          <span className="text-xs font-bold text-yellow-400">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
