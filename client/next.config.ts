import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // All clinic data is private/user-specific — disable shared caching
  // See AGENTS.md caching rules: private data must never leak between sessions
  experimental: {
    // Enable React 19 concurrent features
    reactCompiler: false,
  },
  // Proxy /api/realtime/ticket → backend (so browser never calls backend directly)
  async rewrites() {
    return [];
  },
  // Images from local uploads streamed via Route Handler — no external domains needed
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
