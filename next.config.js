/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost' },
      { protocol: 'https', hostname: 'your-cdn.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.vercel-storage.com' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  trailingSlash: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/api/products',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/posts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/settings',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      {
        source: '/api/auth/me',
        headers: [
          { key: 'Cache-Control', value: 'private, max-age=300, stale-while-revalidate=60' },
        ],
      },
      {
        source: '/api/admin/posts',
        headers: [
          { key: 'Cache-Control', value: 'private, max-age=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/admin/products',
        headers: [
          { key: 'Cache-Control', value: 'private, max-age=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/admin/orders',
        headers: [
          { key: 'Cache-Control', value: 'private, max-age=60, stale-while-revalidate=300' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
