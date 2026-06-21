import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white/65 pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-16">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <span className="font-heading text-2xl font-semibold text-white tracking-wide">
                Master <span className="text-accent">Strap</span>
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
            <h4 className="font-heading text-white text-base mb-7 font-medium tracking-wide">Explore</h4>
            <ul className="space-y-3.5">
              <li><Link href="/blog/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Material Guide</Link></li>
              <li><Link href="/blog/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Craft Process</Link></li>
              <li><Link href="/blog/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Artisan Stories</Link></li>
              <li><Link href="/blog/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Care Guide</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-white text-base mb-7 font-medium tracking-wide">Customer Service</h4>
            <ul className="space-y-3.5">
              <li><Link href="/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">My Account</Link></li>
              <li><Link href="/cart/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Cart</Link></li>
              <li><Link href="/blog/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Shipping</Link></li>
              <li><Link href="/blog/" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Returns</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-white text-base mb-7 font-medium tracking-wide">Contact</h4>
            <ul className="space-y-3.5">
              <li><a href="mailto:hello@masterstrap.com" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">hello@masterstrap.com</a></li>
              <li><a href="#" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Instagram</a></li>
              <li><a href="#" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Pinterest</a></li>
              <li><a href="#" className="text-sm text-white/55 hover:text-accent transition-all hover:translate-x-1 inline-block">Newsletter</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/35 tracking-wide">
          <p>© {new Date().getFullYear()} Master Strap. All rights reserved.</p>
          <p>Crafted for watch enthusiasts worldwide</p>
        </div>
      </div>
    </footer>
  );
}
