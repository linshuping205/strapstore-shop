import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">MASTERSTRAP</h3>
            <p className="text-gray-500 text-sm">
              Premium watch straps crafted for discerning collectors. 
              Free shipping worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/products/">All Straps</Link></li>
              <li><Link href="/products/">Leather</Link></li>
              <li><Link href="/products/">Rubber</Link></li>
              <li><Link href="/products/">Metal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/blog/">Size Guide</Link></li>
              <li><Link href="/blog/">Care Instructions</Link></li>
              <li><Link href="/blog/">Shipping & Returns</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Journal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/blog/">Strap Guide</Link></li>
              <li><Link href="/blog/">Craftsmanship</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} MasterStrap. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
