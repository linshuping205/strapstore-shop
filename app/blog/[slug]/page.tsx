import { prisma } from '@/lib/prisma'; 
import { notFound } from 'next/navigation'; 
import type { Metadata } from 'next'; 
 
export const dynamic = 'force-dynamic'; 
 
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> { 
  try { 
    const post = await prisma.post.findUnique({ where: { slug: params.slug } }); 
    if (!post) return { title: 'Not Found' }; 
    return { 
      title: post.metaTitle || post.title, 
      description: post.metaDesc || post.excerpt || post.content.slice(0, 160) 
    }; 
  } catch { 
    return { title: 'Blog' }; 
  } 
} 
 
export default async function BlogPostPage({ params }: { params: { slug: string } }) { 
  try { 
    const post = await prisma.post.findUnique({ where: { slug: params.slug } }); 
    if (!post || !post.published) notFound(); 
    return ( 
      <div><h1>{post.title}</h1><div dangerouslySetInnerHTML={{ __html: post.content }} /></div> 
    ); 
  } catch { 
    notFound(); 
  } 
} 
