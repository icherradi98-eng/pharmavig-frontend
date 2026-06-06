import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Le token est dans localStorage (inaccessible dans le middleware).
// La protection des routes est gérée côté client dans chaque dashboard.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}
