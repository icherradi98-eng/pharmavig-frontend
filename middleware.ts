import { NextResponse } from "next/server";

// Le token est dans localStorage (inaccessible dans le middleware).
// La protection des routes est gérée côté client dans chaque dashboard.
export function middleware() {
  return NextResponse.next();
}
