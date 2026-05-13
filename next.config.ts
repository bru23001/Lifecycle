import type { NextConfig } from "next";

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
  // Permit local-origin dev hosts (IDE webviews/proxies) to load `/_next/*` assets.
  allowedDevOrigins: ["localhost", "127.0.0.1", "*.localhost"],
};

export default nextConfig;
