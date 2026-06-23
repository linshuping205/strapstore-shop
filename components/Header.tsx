"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* 左侧：菜单按钮 */}
          <div className="flex items-center gap-2 flex-1">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 text-sm tracking-widest hover:text-gray-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <span className="hidden sm:inline">MENU</span>
            </button>
          </div>

          {/* 中间：Logo */}
          <div className="flex-shrink-0 text-center">
            <Link href="/" className="block">
              <h1 className="text-lg md:text-xl font-serif tracking-[0.2em] font-semibold">
                MASTER STRAP
              </h1>
              <p className="text-[10px] md:text-xs tracking-[0.15em] text-gray-500 mt-0.5">
                EST. 2024
              </p>
            </Link>
          </div>

          {/* 右侧：图标组（纯 SVG，零依赖） */}
          <div className="flex items-center justify-end gap-2 md:gap-3 flex-1">

            {/* Heart - 收藏 */}
            <button className="hover:text-gray-600 transition" aria-label="Wishlist">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>

            {/* User - 账户 */}
            <button className="hover:text-gray-600 transition" aria-label="Account">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </button>

            {/* ShoppingBag - 购物车 */}
            <Link href="/cart" className="hover:text-gray-600 transition relative" aria-label="Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {/* 购物车数量 - 有商品时显示 */}
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* 下拉菜单 */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col gap-4 text-sm tracking-widest">
              <Link href="/shop" className="hover:text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>SHOP</Link>
              <Link href="/journal" className="hover:text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>JOURNAL</Link>
              <Link href="/about" className="hover:text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>ABOUT</Link>
              <Link href="/contact" className="hover:text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>CONTACT</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
