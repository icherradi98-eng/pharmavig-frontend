"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, UserOut, AuthResponse } from "@/lib/api";

type AuthContextType = {
  user: UserOut | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [, setSessionExpired] = useState(false);
  const loading = false;
  const router = useRouter();

  // Écoute l'événement déclenché par lib/api.ts quand le refresh token est invalide
  useEffect(() => {
    function handleExpired() {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
      setSessionExpired(true);
      router.push("/login?session=expired");
    }
    window.addEventListener("pharmavig:session-expired", handleExpired);
    return () => window.removeEventListener("pharmavig:session-expired", handleExpired);
  }, [router]);

  function saveSession(res: AuthResponse) {
    localStorage.setItem("access_token", res.access_token);
    localStorage.setItem("refresh_token", res.refresh_token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
  }

  function dashboardPathForRole(role: string): string {
    // Le compte admin a son propre espace sous /admin/dashboard (et non /dashboard/admin)
    if (role === "admin") return "/admin/dashboard";
    return `/dashboard/${role}`;
  }

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    saveSession(res);
    router.push(dashboardPathForRole(res.user.role));
  }

  async function register(data: Record<string, unknown>) {
    const res = await api.register(data);
    saveSession(res);
    router.push(dashboardPathForRole(res.user.role));
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
