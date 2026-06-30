import type { Metadata } from 'next';
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { prisma } from '@/lib/prisma';
import ErrorBoundary from '@/components/ErrorBoundary';

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

async function getSettings() {
  try {
    const settings = await prisma.settings.findMany();
    const result: Record<string, string> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    return result;
  } catch {
    // Database not available during build or error
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteTitle = settings.siteTitle || 'MasterStrap';
  const tagline = settings.tagline || 'Premium Watch Straps & Bands';
  const siteIcon = settings.siteIcon || '';

  const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'),
    title: {
      default: `${siteTitle} | ${tagline}`,
      template: `%s | ${siteTitle}`,
    },
    description: tagline,
    keywords: ['watch strap', 'watch band', 'leather strap', 'rubber strap', 'metal bracelet', 'luxury watch accessories'],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: siteTitle,
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
    verification: {
      google: 'your-google-verification-code',
    },
  };

  // Set favicon if siteIcon is configured
  if (siteIcon) {
    const ext = siteIcon.split('.').pop()?.toLowerCase();
    let iconType = 'image/png';
    if (ext === 'svg' || ext === 'svg+xml') iconType = 'image/svg+xml';
    else if (ext === 'ico') iconType = 'image/x-icon';
    else if (ext === 'jpg' || ext === 'jpeg') iconType = 'image/jpeg';
    else if (ext === 'webp') iconType = 'image/webp';
    else if (ext === 'gif') iconType = 'image/gif';

    metadata.icons = {
      icon: { url: siteIcon, type: iconType },
      shortcut: { url: siteIcon, type: iconType },
    };
  } else {
    // Default favicon fallback
    metadata.icons = {
      icon: '/favicon.ico',
    };
  }

  return metadata;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <main>{children}</main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
