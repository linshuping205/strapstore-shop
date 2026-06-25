import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const blogPosts = [
  {
    id: 'post_4',
    slug: 'how-to-choose-perfect-watch-strap',
    title: 'How to Choose the Perfect Watch Strap for Every Occasion',
    content: '<p>Choosing the right watch strap is an art that combines personal style, practical needs, and an understanding of materials. Whether you are dressing for a boardroom meeting or a weekend adventure, the strap on your wrist makes a statement.</p><h2>Understanding Your Options</h2><p>Today market offers an impressive array of strap materials, each with unique characteristics:</p><ul><li><strong>Leather straps</strong> offer timeless elegance and develop a beautiful patina over time.</li><li><strong>Rubber straps</strong> provide durability and comfort for active lifestyles.</li><li><strong>Metal bracelets</strong> deliver a sophisticated look that transitions seamlessly from day to night.</li><li><strong>Nylon and canvas</strong> straps bring a casual, military-inspired aesthetic.</li></ul><h2>Matching Strap to Occasion</h2><p>For <strong>formal events</strong>, nothing beats a high-quality leather strap in black or deep brown. For <strong>daily office wear</strong>, consider a metal bracelet or a versatile leather strap in medium brown. For <strong>weekend activities</strong>, rubber or nylon straps offer the comfort and durability you need.</p><h2>Color Coordination Tips</h2><ul><li>Black straps pair with black shoes and belts</li><li>Brown leather complements earth tones and casual wear</li><li>Metal bracelets offer neutral versatility</li><li>Blue and green straps add personality to neutral outfits</li></ul><p>Remember, the best strap is one that makes you feel confident and comfortable.</p>',
    excerpt: 'A comprehensive guide to selecting watch straps for formal events, daily wear, and weekend adventures.',
    coverImage: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=500&fit=crop',
    category: 'Guide',
    tags: ['watch-strap', 'style-guide', 'fashion', 'accessories'],
    published: true,
    likes: 18,
    views: 420,
  },
  {
    id: 'post_5',
    slug: 'art-of-hand-stitching-leather',
    title: 'The Art of Hand-Stitching Leather: A Craftsman Journey',
    content: '<p>In a world of mass production, hand-stitched leather goods represent a connection to tradition and an appreciation for quality. Today, we take you inside our workshop to witness the meticulous process behind each strap.</p><h2>The Saddle Stitch Technique</h2><p>Unlike machine stitching, which uses a lock stitch that can unravel if one thread breaks, the saddle stitch is created by passing two needles through each hole from opposite sides. This creates a continuous line of stitching that maintains its integrity even if damaged.</p><p>Our master craftsmen use waxed linen thread, which offers superior strength, natural water resistance, and a beautiful aesthetic that ages gracefully.</p><h2>Tools of the Trade</h2><p>Each craftsman relies on a curated set of tools: the <strong>Pricking Iron</strong> creates evenly spaced holes, <strong>Awls</strong> open and shape each hole, and <strong>Clams</strong> hold the leather pieces firmly together.</p><h2>Why Hand-Stitching Matters</h2><p>A machine can produce a strap in minutes. Our craftsmen spend hours on each piece. Hand-stitched edges are more durable, the tension of each stitch is adjusted for the specific leather thickness, and corner reinforcements are hand-wrapped for maximum strength.</p><p>This dedication to craft is why our straps carry a lifetime of stories, not just years of service.</p>',
    excerpt: 'Discover the traditional saddle stitch technique and the tools that make our handcrafted leather straps unique.',
    coverImage: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&h=500&fit=crop',
    category: 'Craftsmanship',
    tags: ['hand-stitching', 'leather-craft', 'workshop', 'artisan'],
    published: true,
    likes: 24,
    views: 567,
  },
  {
    id: 'post_6',
    slug: 'caring-for-your-leather-strap',
    title: 'Caring for Your Leather Strap: A Complete Maintenance Guide',
    content: '<p>A quality leather watch strap is an investment that, with proper care, can last for decades. Understanding how to maintain your strap ensures it develops character rather than simply deteriorating.</p><h2>Daily Care Tips</h2><ul><li><strong>Avoid water exposure</strong> whenever possible. Leather is naturally porous and absorbs moisture.</li><li><strong>Wipe down regularly</strong> with a soft, dry cloth to remove oils and debris.</li><li><strong>Rotate your straps</strong> if you have multiple options. This gives each strap time to rest.</li><li><strong>Store properly</strong> when not in use. Keep straps away from direct sunlight and heat sources.</li></ul><h2>Seasonal Considerations</h2><p><strong>Summer</strong> brings sweat and humidity. Consider switching to rubber or nylon straps for active days. <strong>Winter</strong> introduces dry air and indoor heating. A light application of leather conditioner helps prevent cracking. <strong>Rainy seasons</strong> require extra vigilance. If your leather strap gets wet, pat it dry immediately and let it air dry naturally.</p><h2>Cleaning and Conditioning</h2><p>Every 3-6 months, give your strap a thorough treatment: clean the surface with a damp cloth and mild saddle soap, let it dry completely, apply a thin layer of quality leather conditioner, and buff gently with a soft cloth.</p><h2>When to Replace</h2><ul><li>Cracking that extends beyond the surface layer</li><li>Stitching that is fraying or coming loose</li><li>Persistent odors that do not resolve with cleaning</li><li>Significant discoloration or staining</li></ul><p>Remember, a well-cared-for leather strap does not just last longer—it tells a richer story.</p>',
    excerpt: 'Learn essential tips for cleaning, conditioning, and preserving your leather watch straps for years of enjoyment.',
    coverImage: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&h=500&fit=crop',
    category: 'Tips',
    tags: ['leather-care', 'maintenance', 'cleaning', 'preservation'],
    published: true,
    likes: 15,
    views: 389,
  },
  {
    id: 'post_7',
    slug: 'milanese-mesh-history',
    title: 'The Milanese Mesh: From Medieval Armor to Modern Elegance',
    content: '<p>The Milanese mesh bracelet represents one of watchmaking most fascinating design evolutions. What began as a technique for crafting flexible armor has become synonymous with refined elegance in horology.</p><h2>Historical Origins</h2><p>The technique dates back to the medieval period, when armorers in Milan developed methods for interlocking metal rings to create flexible, protective chainmail. This same interlocking principle was adapted for jewelry in the 19th century, creating what we now know as the Milanese mesh.</p><p>Key characteristics include ultra-fine wire construction (typically 0.5mm or thinner), interlocking spiral pattern, magnetic or sliding clasp, and ability to conform perfectly to any wrist shape.</p><h2>Modern Manufacturing</h2><p>Today Milanese mesh bracelets blend traditional techniques with modern precision. High-quality mesh starts with surgical-grade stainless steel wire, drawn to exacting thickness tolerances. Finishing processes include polishing, brushing, and IP coating for color options.</p><h2>Styling the Milanese Mesh</h2><p><strong>Dress watches</strong> benefit from the bracelet refined appearance and slim profile. <strong>Vintage-inspired pieces</strong> pair beautifully with mesh, as the style was particularly popular in the 1960s and 70s. <strong>Minimalist designs</strong> find a perfect complement in the mesh understated texture.</p><p>The Milanese mesh proves that sometimes the most enduring designs come from unexpected origins.</p>',
    excerpt: 'Explore the fascinating history of the Milanese mesh bracelet, from medieval chainmail techniques to modern watchmaking.',
    coverImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=500&fit=crop',
    category: 'History',
    tags: ['milanese-mesh', 'history', 'metal-bracelet', 'design'],
    published: true,
    likes: 22,
    views: 501,
  },
];

export async function GET() {
  const results: string[] = [];
  let insertedCount = 0;

  try {
    for (const post of blogPosts) {
      try {
        const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
          `SELECT id FROM "posts" WHERE id = '${post.id}'`
        );

        if (existing && existing.length > 0) {
          results.push(`Skipped: ${post.title}`);
          continue;
        }

        const title = post.title.replace(/'/g, "''");
        const content = post.content.replace(/'/g, "''");
        const excerpt = post.excerpt.replace(/'/g, "''");

        await prisma.$executeRawUnsafe(
          `INSERT INTO "posts" ("id", "slug", "title", "content", "excerpt", "coverImage", "category", "tags", "published", "likes", "views", "createdAt", "updatedAt")
           VALUES ('${post.id}', '${post.slug}', '${title}', '${content}', '${excerpt}', '${post.coverImage}', '${post.category}', '${JSON.stringify(post.tags)}', ${post.published}, ${post.likes}, ${post.views}, NOW(), NOW())`
        );

        insertedCount++;
        results.push(`Created: ${post.title}`);
      } catch (e: any) {
        results.push(`Error: ${post.title} - ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      inserted: insertedCount,
      details: results,
    });
  } catch (error: any) {
    console.error('Blog seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message, details: results },
      { status: 500 }
    );
  }
}
