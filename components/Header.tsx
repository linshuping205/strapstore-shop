"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store";
import { User, LogOut, Settings, Shield, ChevronDown } from "lucide-react";

interface SiteSettings {
  siteTitle?: string;
  tagline?: string;
  siteIcon?: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const itemCount = useCart((state) => state.itemCount());
  const router = useRouter();

  useEffect(() => {
    // Cache settings in localStorage to avoid repeated API calls
    const cached = localStorage.getItem('site-settings');
    const cachedAt = localStorage.getItem('site-settings-at');
    if (cached && cachedAt && Date.now() - Number(cachedAt) < 300_000) {
      try {
        setSettings(JSON.parse(cached));
      } catch { /* ignore parse error */ }
    }

    fetch('/api/settings', { cache: 'force-cache' })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        setSettings(data);
        localStorage.setItem('site-settings', JSON.stringify(data));
        localStorage.setItem('site-settings-at', String(Date.now()));
      })
      .catch(() => { /* ignore */ });

    // Check cached guest status to skip repeated 401 requests
    const meGuest = localStorage.getItem('me-guest');
    const meGuestAt = localStorage.getItem('me-guest-at');
    if (meGuest && meGuestAt && Date.now() - Number(meGuestAt) < 300_000) {
      setLoadingUser(false);
    } else {
      fetch('/api/auth/me', { cache: 'force-cache' })
        .then((res) => {
          if (res.status === 401) {
            // Cache guest status to avoid repeated 401 requests
            localStorage.setItem('me-guest', '1');
            localStorage.setItem('me-guest-at', String(Date.now()));
            return null;
          }
          // Clear guest cache on successful login
          localStorage.removeItem('me-guest');
          localStorage.removeItem('me-guest-at');
          return res.ok ? res.json() : null;
        })
        .then((data) => {
          if (data?.data?.user) setUser(data.data.user);
        })
        .catch(() => { /* ignore */ })
        .finally(() => setLoadingUser(false));
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setIsUserMenuOpen(false);
    router.refresh();
  };

  const siteTitle = settings.siteTitle || 'MASTER STRAP';
  const tagline = settings.tagline || 'EST. 2024';

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
              <span className="text-lg md:text-xl font-serif tracking-[0.2em] font-semibold">
                {siteTitle}
              </span>
              <p className="text-[10px] md:text-xs tracking-[0.15em] text-gray-500 mt-0.5">
                {tagline}
              </p>
            </Link>
          </div>

          {/* 右侧：图标组 */}
          <div className="flex items-center justify-end gap-2 md:gap-3 flex-1">

            {/* Heart - 收藏 */}
            <button className="hover:text-gray-600 transition" aria-label="Wishlist">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>

            {/* User - 账户 */}
            <div className="relative">
              {loadingUser ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1 hover:text-gray-600 transition"
                    aria-label="Account"
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-3 h-3 hidden md:block" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="hover:text-gray-600 transition flex items-center gap-1" aria-label="Account">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </Link>
              )}
            </div>

            {/* ShoppingBag - 购物车 */}
            <Link href="/cart/" className="hover:text-gray-600 transition relative" aria-label="Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* 下拉菜单 */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col gap-4 text-sm tracking-widest">
              <Link href="/products/" className="hover:text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>SHOP</Link>
              <Link href="/blog/" className="hover:text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>JOURNAL</Link>
              <Link href="/about/" className="hover:text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>ABOUT</Link>
              <Link href="/contact/" className="hover:text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>CONTACT</Link>
              {!user && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <Link href="/login/" className="hover:text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>SIGN IN</Link>
                  <Link href="/register/" className="hover:text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>CREATE ACCOUNT</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
