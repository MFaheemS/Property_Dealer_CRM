"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", role: "agent",
  });
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const passwordStrength = getPasswordStrength(form.password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
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

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Create account</h2>
          <p className="text-sm text-slate-400 mt-1">Join PropVault and manage your leads</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              className="input-base"
              placeholder="Ali Hassan"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input
              type="email"
              className="input-base"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(["agent", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => update("role", r)}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    form.role === r
                      ? "bg-yellow-400/10 border-yellow-400/50 text-yellow-400"
                      : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {r === "agent" ? "🧑‍💼 Agent" : "👑 Admin"}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="input-base pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= passwordStrength.score
                          ? passwordStrength.color
                          : "bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">{passwordStrength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="input-base pr-10"
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                required
              />
              {form.confirm && form.password === form.confirm && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-slate-700 mt-6">
        Trusted by property dealers across Pakistan
      </p>
    </div>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 6)                          score++;
  if (password.length >= 10)                         score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password))                score++;

  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-red-500", "bg-red-400", "bg-amber-400",
    "bg-emerald-400", "bg-emerald-500",
  ];

  return { score, label: labels[score], color: colors[score] };
}
