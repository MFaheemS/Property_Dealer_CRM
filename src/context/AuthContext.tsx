"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { IUser } from "@/types";
import { api } from "@/lib/apiClient";

interface AuthContextValue {
  user:     IUser | null;
  loading:  boolean;
  login:    (email: string, password: string) => Promise<void>;
  signup:   (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch current user on mount
  useEffect(() => {
    api.get<{ data: IUser }>("/api/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ data: IUser }>("/api/auth/login", { email, password });
    setUser(res.data);
    router.push("/dashboard");
    router.refresh();
  }, [router]);

  const signup = useCallback(
    async (name: string, email: string, password: string, role = "agent") => {
      const res = await api.post<{ data: IUser }>("/api/auth/signup", {
        name, email, password, role,
      });
      setUser(res.data);
      router.push("/dashboard");
      router.refresh();
    },
    [router]
  );

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout", {});
    setUser(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
