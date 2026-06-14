import type { NextConfig } from "next";

// En-têtes de sécurité appliqués à toutes les routes.
// CSP volontairement omise ici (à tester séparément — Next injecte des styles/scripts
// inline qui nécessitent une CSP avec nonce pour ne rien casser).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // camera=(self) : requis par le scanner de boîte (ScanBoite / getUserMedia)
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
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
