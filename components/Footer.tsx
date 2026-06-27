import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function getFooterSettings() {
  try {
    const settings = await prisma.settings.findMany();
    const result: Record<string, string> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    return result;
  } catch {
    return {};
  }
}

export default async function Footer() {
  const settings = await getFooterSettings();
  const siteTitle = settings.siteTitle || 'Master Strap';
  const adminEmail = settings.adminEmail || 'hello@masterstrap.com';

  // Split brand name for styling (e.g., "Master Strap" -> "Master" + "Strap")
  const brandParts = siteTitle.split(/\s+/);
  const brandFirst = brandParts[0] || 'Master';
  const brandRest = brandParts.slice(1).join(' ') || 'Strap';

  return (
    <footer className="bg-gray-900 text-white/65 pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-16">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <span className="font-heading text-2xl font-semibold text-white tracking-wide">
                {brandFirst} <span className="text-accent">{brandRest}</span>
              </span>
            </Link>
            <p className="text-sm leading-7 text-white/45 max-w-xs">
              Handcrafted with precision. Designed for distinction. Every strap carries our respect for time.
            </p>
            <p className="mt-4 text-xs text-white/30">
              Artisan Watch Straps Since 2024
            </p>
          </div>
          <div>
            <h4 className="font-heading text-white text-base mb-7 font-medium tracking-wide">Shop</h4>
            <ul className="space-y-3.5">
              <li><Link href="/products/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">All Products</Link></li>
              <li><Link href="/products/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Leather Straps</Link></li>
              <li><Link href="/products/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">New Arrivals</Link></li>
              <li><Link href="/products/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Best Sellers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-white text-base mb-7 font-medium tracking-wide">Company</h4>
            <ul className="space-y-3.5">
              <li><Link href="/about/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">About Us</Link></li>
              <li><Link href="/blog/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Journal</Link></li>
              <li><Link href="/contact/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Contact</Link></li>
              <li><Link href="/terms/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-white text-base mb-7 font-medium tracking-wide">Contact</h4>
            <ul className="space-y-3.5">
              <li><a href={`mailto:${adminEmail}`} className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">{adminEmail}</a></li>
              <li><span className="text-sm text-white/55">Florence, Italy</span></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Instagram</a></li>
              <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Pinterest</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/35 tracking-wide">
          <p>© {new Date().getFullYear()} {siteTitle}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy/" className="hover:text-white/55 transition-colors">Privacy Policy</Link>
            <Link href="/terms/" className="hover:text-white/55 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
