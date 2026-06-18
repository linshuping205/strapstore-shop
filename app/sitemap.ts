import { prisma } from '@/lib/prisma';
import { MetadataRoute } from 'next';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';

  const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
  const posts = await prisma.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}/`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const postUrls = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}/`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products/`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ...productUrls,
    ...postUrls,
  ];
}
