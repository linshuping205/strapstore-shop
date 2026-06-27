import { prisma } from '@/lib/prisma'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://strapstore-shop.vercel.app'
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
  ]

  try {
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      take: 5000,
    })
    products.forEach((p) => {
      routes.push({
        url: `${baseUrl}/products/${p.slug}/`,
        lastModified: p.updatedAt,
      })
    })
  } catch {
    // Database not available during build
  }

  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      take: 5000,
    })
    posts.forEach((p) => {
      routes.push({
        url: `${baseUrl}/blog/${p.slug}/`,
        lastModified: p.updatedAt,
      })
    })
  } catch {
    // Database not available during build
  }

  return routes
}
