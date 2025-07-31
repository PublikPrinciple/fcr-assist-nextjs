import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: false,
  },
  eslint: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
}

export default nextConfig