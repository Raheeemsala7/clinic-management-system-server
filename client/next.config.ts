import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  transpilePackages: ['next-intl', 'sonner'],
  // All clinic data is private/user-specific — disable shared caching
  // See AGENTS.md caching rules: private data must never leak between sessions
  experimental: {
    // React 19 concurrent features - compiler not used in v16 stable config here
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

export default withNextIntl(nextConfig);

