import type { NextConfig } from "next";

// CSP : unsafe-inline obligatoire pour Next.js (hydration scripts + Tailwind inline styles).
// La valeur réelle de cette CSP est dans connect-src (bloque les exfiltrations données),
// img-src (bloque pixel-tracking), et frame-ancestors (clickjacking).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",   // Next.js hydration + Turbopack HMR
  "style-src 'self' 'unsafe-inline'",                   // Tailwind + Next.js styles
  "img-src 'self' data: blob:",                          // base64 photos checkin
  "font-src 'self'",
  "connect-src 'self' https://*.railway.app wss://*.railway.app http://localhost:8000",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // camera=(self) : requis par le scanner de boîte (ScanBoite / getUserMedia)
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
