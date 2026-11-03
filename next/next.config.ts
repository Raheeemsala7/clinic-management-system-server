import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl =  createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 't3.storage.dev',
      },
      {
        protocol: 'https',
        hostname: '**.storage.dev',
      },
    ],
  },
  async rewrites() {
    const apiBase = process.env.API_URL || 'http://localhost:4000/api/v1';
    return [
      {
        source: '/api/v1/attachments/file/:filename*',
        destination: `${apiBase}/attachments/file/:filename*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
