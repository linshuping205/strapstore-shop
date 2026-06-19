import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await prisma.post.findUnique({ where: { slug: params.slug } })
    if (!post) return { title: 'Not Found' }
    return {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt || post.content.slice(0, 160)
    }
  } catch {
    return { title: 'Blog' }
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    const post = await prisma.post.findUnique({ where: { slug: params.slug } })
    if (!post || !post.published) notFound()

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    )
  } catch {
    notFound()
  }
}
