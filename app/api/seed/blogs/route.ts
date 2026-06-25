import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const blogPosts = [
  {
    id: 'post_4',
    slug: 'how-to-choose-perfect-watch-strap',
    title: 'How to Choose the Perfect Watch Strap for Every Occasion',
    content: `<p>Choosing the right watch strap is an art that combines personal style, practical needs, and an understanding of materials. Whether you're dressing for a boardroom meeting or a weekend adventure, the strap on your wrist makes a statement.</p>

<h2>Understanding Your Options</h2>

<p>Today's market offers an impressive array of strap materials, each with unique characteristics:</p>

<ul>
<li><strong>Leather straps</strong> offer timeless elegance and develop a beautiful patina over time. They're perfect for formal occasions and professional settings.</li>
<li><strong>Rubber straps</strong> provide durability and comfort for active lifestyles. Modern fluoroelastomer straps offer premium feel without compromising on performance.</li>
<li><strong>Metal bracelets</strong> deliver a sophisticated look that transitions seamlessly from day to night. Stainless steel and titanium options cater to different preferences.</li>
<li><strong>Nylon and canvas</strong> straps bring a casual, military-inspired aesthetic that's both comfortable and versatile.</li>
</ul>

<h2>Matching Strap to Occasion</h2>

<p>The key to strap selection lies in understanding the context:</p>

<p>For <strong>formal events</strong>, nothing beats a high-quality leather strap in black or deep brown. The subtle grain and polished finish complement dress watches perfectly.</p>

<p>For <strong>daily office wear</strong>, consider a metal bracelet or a versatile leather strap in medium brown. These options pair well with business attire while maintaining personality.</p>

<p>For <strong>weekend activities</strong>, rubber or nylon straps offer the comfort and durability you need. They're easy to clean and can handle whatever your adventures throw at them.</p>

<h2>Color Coordination Tips</h2>

<p>When selecting strap colors, consider your existing wardrobe:</p>

<ul>
<li>Black straps pair with black shoes and belts</li>
<li>Brown leather complements earth tones and casual wear</li>
<li>Metal bracelets offer neutral versatility</li>
<li>Blue and green straps add personality to neutral outfits</li>
</ul>

<p>Remember, the best strap is one that makes you feel confident and comfortable. Don't be afraid to experiment with different styles until you find your perfect match.</p>`,
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
    title: 'The Art of Hand-Stitching Leather: A Craftsman\'s Journey',
    content: `<p>In a world of mass production, hand-stitched leather goods represent a connection to tradition and an appreciation for quality. Today, we take you inside our workshop to witness the meticulous process behind each strap.</p>

<h2>The Saddle Stitch Technique</h2>

<p>Unlike machine stitching, which uses a lock stitch that can unravel if one thread breaks, the saddle stitch is created by passing two needles through each hole from opposite sides. This creates a continuous line of stitching that maintains its integrity even if damaged.</p>

<p>Our master craftsmen use waxed linen thread, which offers:</p>

<ul>
<li>Superior strength compared to synthetic alternatives</li>
<li>Natural water resistance from the wax coating</li>
<li>A beautiful aesthetic that ages gracefully</li>
<li>Traditional appeal that connects to leatherworking heritage</li>
</ul>

<h2>Tools of the Trade</h2>

<p>Each craftsman relies on a curated set of tools:</p>

<p><strong>The Pricking Iron</strong> creates evenly spaced holes along the leather edge. Precision here ensures straight, consistent stitches that define quality work.</p>

<p><strong>Awls</strong> open and shape each hole, allowing the thread to pass smoothly without damaging the leather fibers.</p>

<p><strong>Clams</strong> hold the leather pieces firmly together, maintaining alignment throughout the stitching process.</p>

<h2>Why Hand-Stitching Matters</h2>

<p>A machine can produce a strap in minutes. Our craftsmen spend hours on each piece. The difference is in the details:</p>

<ul>
<li>Hand-stitched edges are more durable and less likely to fray</li>
<li>The tension of each stitch is adjusted for the specific leather thickness</li>
<li>Corner reinforcements are hand-wrapped for maximum strength</li>
<li>Each piece is inspected and refined before completion</li>
</ul>

<p>This dedication to craft is why our straps carry a lifetime of stories, not just years of service.</p>`,
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
    content: `<p>A quality leather watch strap is an investment that, with proper care, can last for decades. Understanding how to maintain your strap ensures it develops character rather than simply deteriorating.</p>

<h2>Daily Care Tips</h2>

<p>Simple habits make the biggest difference:</p>

<ul>
<li><strong>Avoid water exposure</strong> whenever possible. Leather is naturally porous and absorbs moisture, which can lead to warping and mildew.</li>
<li><strong>Wipe down regularly</strong> with a soft, dry cloth to remove oils and debris from your skin and environment.</li>
<li><strong>Rotate your straps</strong> if you have multiple options. This gives each strap time to rest and air out between wears.</li>
<li><strong>Store properly</strong> when not in use. Keep straps away from direct sunlight and heat sources.</li>
</ul>

<h2>Seasonal Considerations</h2>

<p>Different seasons present unique challenges:</p>

<p><strong>Summer</strong> brings sweat and humidity. Consider switching to rubber or nylon straps for active days, and clean leather straps more frequently.</p>

<p><strong>Winter</strong> introduces dry air and indoor heating. A light application of leather conditioner helps prevent cracking and maintains flexibility.</p>

<p><strong>Rainy seasons</strong> require extra vigilance. If your leather strap gets wet, pat it dry immediately and let it air dry naturally—never use heat to speed up drying.</p>

<h2>Cleaning and Conditioning</h2>

<p>Every 3-6 months, give your strap a thorough treatment:</p>

<ol>
<li>Clean the surface with a damp (not wet) cloth and mild saddle soap</li>
<li>Let the strap dry completely—usually overnight</li>
<li>Apply a thin layer of quality leather conditioner</li>
<li>Buff gently with a soft cloth to restore luster</li>
</ol>

<h2>When to Replace</h2>

<p>Even with excellent care, straps eventually reach the end of their life. Signs it's time for a replacement include:</p>

<ul>
<li>Cracking that extends beyond the surface layer</li>
<li>Stitching that's fraying or coming loose</li>
<li>Persistent odors that don't resolve with cleaning</li>
<li>Significant discoloration or staining</li>
</ul>

<p>Remember, a well-cared-for leather strap doesn't just last longer—it tells a richer story.</p>`,
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
    content: `<p>The Milanese mesh bracelet represents one of watchmaking's most fascinating design evolutions. What began as a technique for crafting flexible armor has become synonymous with refined elegance in horology.</p>

<h2>Historical Origins</h2>

<p>The technique dates back to the medieval period, when armorers in Milan developed methods for interlocking metal rings to create flexible, protective chainmail. This same interlocking principle was adapted for jewelry in the 19th century, creating what we now know as the Milanese mesh.</p>

<p>Key characteristics of traditional Milanese mesh include:</p>

<ul>
<li>Ultra-fine wire construction, typically 0.5mm or thinner</li>
<li>Interlocking spiral pattern that creates a seamless, flexible surface</li>
<li>Magnetic or sliding clasp that maintains the bracelet's sleek profile</li>
<li>Ability to conform perfectly to any wrist shape</li>
</ul>

<h2>Modern Manufacturing</h2>

<p>Today's Milanese mesh bracelets blend traditional techniques with modern precision:</p>

<p>High-quality mesh starts with surgical-grade stainless steel wire, drawn to exacting thickness tolerances. The wire is then wound into tight coils and cut into precise lengths before being interlinked into the characteristic mesh pattern.</p>

<p>Finishing processes include:</p>

<ul>
<li>Polishing to achieve the signature mirror-like shine</li>
<li>Brushing for a more understated, matte appearance</li>
<li>IP (Ion Plating) coating for black, gold, and rose gold color options</li>
<li>Quality testing for flexibility and durability</li>
</ul>

<h2>Styling the Milanese Mesh</h2>

<p>The versatility of the Milanese mesh makes it suitable for various watch styles:</p>

<p><strong>Dress watches</strong> benefit from the bracelet's refined appearance and slim profile. The way it catches light adds a subtle luxury without overwhelming the watch face.</p>

<p><strong>Vintage-inspired pieces</strong> pair beautifully with mesh, as the style was particularly popular in the 1960s and 70s.</p>

<p><strong>Minimalist designs</strong> find a perfect complement in the mesh's understated texture, which adds visual interest without complexity.</p>

<p>The Milanese mesh proves that sometimes the most enduring designs come from unexpected origins.</p>`,
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
        // Check if post already exists
        const existing = await prisma.$queryRawUnsafe<any[]>(`
          SELECT id FROM "posts" WHERE id = '${post.id}'
        `);

        if (existing.length > 0) {
          results.push(`Skipped existing: ${post.title}`);
          continue;
        }

        // Insert new post
        await prisma.$executeRawUnsafe(`
          INSERT INTO "posts" (
            "id", "slug", "title", "content", "excerpt", "coverImage",
            "category", "tags", "published", "likes", "views", "createdAt", "updatedAt"
          ) VALUES (
            '${post.id}',
            '${post.slug}',
            '${post.title.replace(/'/g, "''")}',
            '${post.content.replace(/'/g, "''")}',
            '${post.excerpt.replace(/'/g, "''")}',
            '${post.coverImage}',
            '${post.category}',
            '${JSON.stringify(post.tags)}',
            ${post.published},
            ${post.likes},
            ${post.views},
            NOW(),
            NOW()
          )
        `);

        insertedCount++;
        results.push(`Created: ${post.title}`);
      } catch (e: any) {
        results.push(`Error creating ${post.title}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Blog seed completed. ${insertedCount} new posts created.`,
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
