import { NextResponse } from "next/server";

// Protection des routes gérée côté client dans chaque dashboard.
// Ce fichier remplace middleware.ts (déprécié en Next.js 16).
export function proxy() {
  return NextResponse.next();
}
