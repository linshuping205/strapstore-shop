import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { variants: true },
  });

  if (!product) return {};

  const settings: any = await prisma.settings.findFirst() || {};
  const siteTitle = settings.siteTitle || 'MasterStrap';

  const title = product.metaTitle || `${product.name} — ${siteTitle}`;
  const description = product.metaDesc || `Shop ${product.name} at ${siteTitle}. ${product.description?.slice(0, 120)}`;
  const url = `https://strapstore-shop.vercel.app/products/${product.slug}/`;
  const image = product.images?.[0];

  return {
    title,
    description,
    keywords: [product.name, product.category, product.material || ''].filter(Boolean),
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
  });

  if (!product) notFound();

  // Serialize Decimal
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants?.map((v) => ({
      ...v,
      price: Number(v.price),
      comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    })) || [],
  };

  // Related products
  const related = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      category: product.category,
      isActive: true,
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  const serializedRelated = related.map((p) => ({
    ...p,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  // Reviews
  const reviews = await prisma.productReview.findMany({
    where: { productId: product.id },
    select: { rating: true },
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    : 0;
  const reviewCount = reviews.length;

  return <ProductDetailClient product={serializedProduct} relatedProducts={serializedRelated} avgRating={avgRating} reviewCount={reviewCount} />;
}
