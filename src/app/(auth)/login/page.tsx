"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();

  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed — check console");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="glass rounded-2xl p-8 shadow-2xl">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gold-gradient">PropVault</h1>
            <p className="text-xs text-slate-500 -mt-0.5">Premium Real Estate CRM</p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Welcome back</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to your account to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              className="input-base"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="input-base pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-600">OR</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Demo credentials */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Demo Credentials
          </p>
          <DemoCredential
            label="Admin"
            email="admin@propvault.pk"
            password="admin123"
            onUse={(e, p) => { setEmail(e); setPassword(p); }}
          />
          <DemoCredential
            label="Agent"
            email="zara@propvault.pk"
            password="agent123"
            onUse={(e, p) => { setEmail(e); setPassword(p); }}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>

      {/* Bottom tagline */}
      <p className="text-center text-xs text-slate-700 mt-6">
        Trusted by property dealers across Pakistan
      </p>
    </div>
  );
}

function DemoCredential({
  label, email, password, onUse,
}: {
  label: string;
  email: string;
  password: string;
  onUse: (email: string, password: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-xs font-medium text-slate-400">{label}: </span>
        <span className="text-xs text-slate-500">{email}</span>
      </div>
      <button
        type="button"
        onClick={() => onUse(email, password)}
        className="text-xs text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
      >
        Use
      </button>
    </div>
  );
}
