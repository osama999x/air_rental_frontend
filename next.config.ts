import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["airrental1.com", "airrental1.com."],
  async redirects() {
    return [
      { source: "/units", destination: "/properties", permanent: false },
      { source: "/units/:slug", destination: "/properties/:slug", permanent: false },
      { source: "/book", destination: "/apply", permanent: false },
    ];
  },
  experimental: {
    agentFeedback: true,
    serverActions: {
      allowedOrigins: ["airrental1.com", "airrental1.com."],
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
