import type { Metadata } from 'next';
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'),
  title: {
    default: 'MasterStrap | Premium Watch Straps & Bands',
    template: '%s | MasterStrap',
  },
  description: 'Handcrafted premium watch straps in leather, rubber, and metal. Elevate your timepiece with artisanal craftsmanship. Free global shipping.',
  keywords: ['watch strap', 'watch band', 'leather strap', 'rubber strap', 'metal bracelet', 'luxury watch accessories'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'MasterStrap',
    images: ['/images/og-default.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased pt-[70px]">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
