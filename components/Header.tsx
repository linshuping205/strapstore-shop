'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { useState } from 'react';

export default function Header() {
  const items = useCart((state) => state.items);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100/60 z-50 transition-all duration-400">
      <div className="flex items-center justify-between h-[70px] px-8 max-w-[1440px] mx-auto">
        <div className="flex-1 flex items-center">
          <button 
            className="flex items-center gap-2.5 bg-none border-none cursor-pointer text-gray-900 text-sm font-medium tracking-wide uppercase hover:text-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>

        <div className="flex-1 flex justify-center items-center">
          <Link href="/" className="flex flex-col items-center text-gray-900 hover:opacity-80 transition-opacity">
            <span className="font-heading text-xl sm:text-2xl font-semibold tracking-[3px] leading-none uppercase whitespace-nowrap">
              MASTER STRAP
            </span>
            <span className="text-xs font-normal tracking-[2px] text-gray-400 mt-1 uppercase">
              Est. 2024
            </span>
          </Link>
        </div>

        <div className="flex-1 flex justify-end items-center gap-5">
          <Link href="/products/" className="hidden md:flex text-gray-600 hover:text-accent transition-colors text-sm tracking-wide">
            Shop
          </Link>
          <Link href="/blog/" className="hidden md:flex text-gray-600 hover:text-accent transition-colors text-sm tracking-wide">
            Journal
          </Link>
          <Link href="/cart/" className="relative text-gray-900 hover:text-accent transition-colors p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4">
          <div className="space-y-3">
            <Link href="/products/" className="block text-gray-600 py-2" onClick={() => setMobileOpen(false)}>Shop</Link>
            <Link href="/blog/" className="block text-gray-600 py-2" onClick={() => setMobileOpen(false)}>Journal</Link>
            <Link href="/cart/" className="block text-gray-600 py-2" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
          </div>
        </div>
      )}
    </header>
  );
}
