import type { NextConfig } from "next";

/** Extra dev hostnames (comma-separated), e.g. `192.168.1.10,myhost` when you open the app by IP or custom DNS. */
const extraAllowedDevOrigins =
  process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/projects/:id/reports/gate-decision",
        destination: "/projects/:id/reports/gate-decisions",
        permanent: true,
      },
      {
        source: "/projects/:id/reports/full-project-evidence-package",
        destination: "/projects/:id/reports/evidence-package",
        permanent: true,
      },
      {
        source: "/projects/:id/reports/full-project-evidence-package/configure",
        destination: "/projects/:id/reports/evidence-package/configure",
        permanent: true,
      },
    ];
  },
  transpilePackages: ["mermaid"],
  // Next.js 15+ returns 400 for `/_next/static/*` when Origin/Referer host is not allowlisted (dev only).
  // Covers loopback, *.localhost, Bonjour *.local, and optional NEXT_ALLOWED_DEV_ORIGINS for LAN IPs / proxies.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "[::1]",
    "*.localhost",
    "*.local",
    ...extraAllowedDevOrigins,
  ],
};

export default nextConfig;
