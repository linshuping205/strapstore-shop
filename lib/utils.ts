export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function autoSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  const dangerousTags = [
    'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button',
    'textarea', 'select', 'option', 'svg', 'math', 'link', 'meta', 'base', 'frame',
    'frameset', 'applet', 'area', 'map', 'param',
  ];

  let cleaned = html;

  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    cleaned = cleaned.replace(regex, '');
    const selfCloseRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    cleaned = cleaned.replace(selfCloseRegex, '');
  }

  cleaned = cleaned
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/data:/gi, 'blocked:')
    .replace(/expression\(/gi, 'blocked(');

  return cleaned;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export function formatPrice(price: number | string | null | undefined): string {
  const num = Number(price ?? 0);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}

export function formatPriceHTML(price: number | string | null | undefined): string {
  const num = Number(price ?? 0);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export const APP_NAME = 'MasterStrap';
export const APP_TAGLINE = 'Premium Watch Straps & Bands';
export const DEFAULT_EMAIL = 'hello@masterstrap.com';
export const DEFAULT_ADDRESS = 'Florence, Italy';
export const DEFAULT_INSTAGRAM = 'https://instagram.com';
export const DEFAULT_PINTEREST = 'https://pinterest.com';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
export const ALLOWED_SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'DE', 'FR', 'AU'] as const;
export const STATUS_FLOW = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'] as const;

export function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16).slice(0, 16);
}

import type { Product, Post } from '@/types';

export function serializeProduct(product: any): Product {
  if (!product) {
    throw new Error('serializeProduct received null/undefined product');
  }
  return {
    ...product,
    price: typeof product.price === 'object' && product.price !== null && typeof product.price.toNumber === 'function'
      ? product.price.toNumber()
      : Number(product.price ?? 0),
    comparePrice: product.comparePrice
      ? (typeof product.comparePrice === 'object' && product.comparePrice !== null && typeof product.comparePrice.toNumber === 'function'
        ? product.comparePrice.toNumber()
        : Number(product.comparePrice))
      : null,
    images: product.images || [],
    tags: product.tags || [],
    createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
    updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
  };
}

export function serializePost(post: any): Post {
  if (!post) {
    throw new Error('serializePost received null/undefined post');
  }
  return {
    ...post,
    createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,
  };
}

export function serializeProducts(products: any[]): Product[] {
  if (!Array.isArray(products)) return [];
  return products.map(serializeProduct);
}

export function serializePosts(posts: any[]): Post[] {
  if (!Array.isArray(posts)) return [];
  return posts.map(serializePost);
}
