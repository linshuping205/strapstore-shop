'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const items = useCart((state) => state.items);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
            MASTER<span className="text-accent">STRAP</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="/products/" className="text-gray-600 hover:text-accent transition-colors">
              Shop
            </Link>
            <Link href="/blog/" className="text-gray-600 hover:text-accent transition-colors">
              Journal
            </Link>
            <Link href="/cart/" className="relative text-gray-600 hover:text-accent transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link href="/products/" className="block px-3 py-2 text-gray-600" onClick={() => setMobileOpen(false)}>
              Shop
            </Link>
            <Link href="/blog/" className="block px-3 py-2 text-gray-600" onClick={() => setMobileOpen(false)}>
              Journal
            </Link>
            <Link href="/cart/" className="block px-3 py-2 text-gray-600" onClick={() => setMobileOpen(false)}>
              Cart ({cartCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
