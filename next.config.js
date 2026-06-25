/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-cdn.com', 'images.unsplash.com', '*.vercel-storage.com'],
    formats: ['image/webp', 'image/avif'],
  },
  trailingSlash: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
