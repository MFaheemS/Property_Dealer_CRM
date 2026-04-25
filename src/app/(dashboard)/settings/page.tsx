"use client";

import { useAuth } from "@/hooks/useAuth";
import { avatarUrl } from "@/lib/utils";
import Image from "next/image";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Account Settings</h2>
        <p className="text-sm text-slate-400 mt-1">Manage your PropVault profile</p>
      </div>

      {/* Profile card */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <Image
            src={user?.avatar ?? avatarUrl(user?.name ?? "U")}
            alt={user?.name ?? "User"}
            width={64}
            height={64}
            className="rounded-xl border border-slate-700"
          />
          <div>
            <p className="text-lg font-semibold text-slate-100">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
              user?.role === "admin"
                ? "bg-yellow-400/10 text-yellow-400"
                : "bg-emerald-400/10 text-emerald-400"
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Full Name</p>
            <p className="text-slate-200 font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Email</p>
            <p className="text-slate-200 font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Role</p>
            <p className="text-slate-200 font-medium capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Member since</p>
            <p className="text-slate-200 font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PK") : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="glass rounded-2xl p-4 text-sm text-slate-400 border border-yellow-400/10">
        <p className="text-yellow-400 font-medium mb-1">PropVault CRM</p>
        <p>Premium Real Estate CRM for Pakistan&apos;s top property dealers.</p>
      </div>
    </div>
  );
}
