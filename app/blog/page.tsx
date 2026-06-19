import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  let posts: any[] = []
  
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' }
    })
  } catch {
    // 数据库连不上时返回空数组
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}/`}>
              <h2>{post.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}