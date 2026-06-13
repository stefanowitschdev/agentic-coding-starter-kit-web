import type { RemotePattern } from "next/dist/shared/lib/image-config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Allow images served from the configured S3-compatible bucket / CDN.
const remotePatterns: RemotePattern[] = [
  { protocol: "https", hostname: "lh3.googleusercontent.com" },
  { protocol: "https", hostname: "avatars.githubusercontent.com" },
];

const s3PublicSource = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT;
if (s3PublicSource) {
  try {
    remotePatterns.push({ protocol: "https", hostname: new URL(s3PublicSource).hostname });
  } catch {
    // Ignore malformed S3 URLs — image optimization simply won't allow that host.
  }
}

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle for Docker / Coolify / any host.
  output: "standalone",
  // Pin the file-tracing root to this project so the standalone output stays
  // flat (server.js at .next/standalone/server.js) even when the project lives
  // inside a larger repo. Keeps the Dockerfile COPY paths stable.
  outputFileTracingRoot: projectRoot,

  // Image optimization configuration
  images: {
    remotePatterns,
  },

  // Enable compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
