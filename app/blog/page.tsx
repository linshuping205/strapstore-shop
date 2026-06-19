import { prisma } from '@/lib/prisma'; 
import Link from 'next/link'; 
 
export const dynamic = 'force-dynamic'; 
 
export default async function BlogPage() { 
  let posts = []; 
  try { 
    posts = await prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } }); 
  } catch {} 
  return ( 
    <div className="max-w-7xl mx-auto px-4 py-12"><h1>Blog</h1>{posts.length === 0 ? <p>No posts.</p> : posts.map(p = key={p.id} href={`/blog/${p.slug}/`}><h2>{p.title}</h2></Link>)}</div> 
  ); 
} 
