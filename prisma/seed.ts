import { prisma } from '../lib/prisma';

async function main() {
  console.log('Start seeding...');

  // 清理旧数据（可选，开发时方便）
  await prisma.post.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  // 创建示例商品
  const products = await prisma.product.createMany({
    data: [
      {
        id: 'prod_1',
        slug: 'italian-buttero-leather-strap',
        name: 'Italian Buttero Vegetable-Tanned Leather Strap',
        description: 'Handcrafted from premium Italian vegetable-tanned leather, this strap develops a unique patina over time.',
        price: 89.00,
        comparePrice: null,
        images: ['https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&h=600&fit=crop'],
        category: 'Leather',
        material: 'Leather',
        tags: ['leather', 'italian', 'premium'],
        stock: 50,
        sku: 'IBL-001',
        isActive: true,
      },
      {
        id: 'prod_2',
        slug: 'crocodile-embossed-calfskin-strap',
        name: 'Crocodile Embossed Calfskin Strap',
        description: 'Luxurious crocodile pattern embossed on premium calfskin leather.',
        price: 99.00,
        comparePrice: 129.00,
        images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop'],
        category: 'Exotic',
        material: 'Calfskin',
        tags: ['exotic', 'crocodile', 'luxury'],
        stock: 30,
        sku: 'CEC-002',
        isActive: true,
      },
    ],
  });
  console.log(`Created ${products.count} products`);

  // 创建示例博客文章
  const posts = await prisma.post.createMany({
    data: [
      {
        id: 'post_1',
        slug: 'why-italian-vegetable-tanned-leather',
        title: 'Why Is Italian Vegetable-Tanned Leather Worth a 3-Year Wait?',
        content: '<p>From the oak forests of Tuscany to the finished strap, discover the full lifecycle of vegetable-tanned leather and how time grants it a unique patina.</p><p>Italian artisans have perfected this craft over centuries, using natural tannins from tree bark to create leather that ages beautifully.</p>',
        excerpt: 'From the oak forests of Tuscany to the finished strap, discover the full lifecycle of vegetable-tanned leather.',
        coverImage: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&h=500&fit=crop',
        category: 'Guide',
        tags: ['leather', 'craftsmanship', 'italian'],
        published: true,
        metaTitle: 'Italian Vegetable-Tanned Leather Guide | MasterStrap',
        metaDesc: 'Discover why Italian vegetable-tanned leather is worth the wait. Learn about the craft behind premium watch straps.',
      },
      {
        id: 'post_2',
        slug: 'rubber-vs-leather-vs-metal-guide',
        title: 'Rubber vs Leather vs Metal: The Ultimate Strap Material Guide',
        content: '<p>Matching rules for different occasions, seasons, and watch styles. From dive-watch rubber to dress-watch crocodile, find your perfect pairing.</p><p>Each material has its unique characteristics and ideal use cases. Rubber excels in water resistance, leather offers elegance, and metal provides durability.</p>',
        excerpt: 'Matching rules for different occasions, seasons, and watch styles. Find your perfect pairing.',
        coverImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=500&fit=crop',
        category: 'Tips',
        tags: ['material', 'rubber', 'leather', 'metal'],
        published: true,
        metaTitle: 'Watch Strap Material Guide | MasterStrap',
        metaDesc: 'The ultimate guide to choosing between rubber, leather, and metal watch straps.',
      },
      {
        id: 'post_3',
        slug: 'saddle-stitch-workshop-visit',
        title: 'Saddle Stitch: Every Stitch Is a Mark of Time',
        content: '<p>A visit to our handcraft workshop. Learn why traditional saddle stitch outlasts machine sewing and what defines a good stitch in an artisan\'s eyes.</p><p>Each saddle stitch is made with two needles passing through the same hole from opposite sides, creating a lock that won\'t unravel even if one thread breaks.</p>',
        excerpt: 'A visit to our handcraft workshop. Learn why traditional saddle stitch outlasts machine sewing.',
        coverImage: 'https://images.unsplash.com/photo-1434056886845-dbe89f8f1db8?w=800&h=500&fit=crop',
        category: 'Review',
        tags: ['craftsmanship', 'saddle-stitch', 'workshop'],
        published: true,
        metaTitle: 'Saddle Stitch Workshop Visit | MasterStrap',
        metaDesc: 'Discover the art of traditional saddle stitching in our handcraft workshop.',
      },
    ],
  });
  console.log(`Created ${posts.count} posts`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
