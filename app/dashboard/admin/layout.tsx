"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role !== "admin") {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user || user.role !== "admin") return null;
  return <>{children}</>;
}
