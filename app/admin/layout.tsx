import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import AdminLayoutClient from './AdminLayoutClient';

async function getSettings() {
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteTitle = settings.siteTitle || 'MasterStrap';
  const tagline = settings.tagline || 'Premium Watch Straps & Bands';
  const siteIcon = settings.siteIcon || '';

  const metadata: Metadata = {
    title: {
      default: `Admin | ${siteTitle}`,
      template: `%s | ${siteTitle}`,
    },
    description: tagline,
  };

  if (siteIcon) {
    metadata.icons = {
      icon: siteIcon,
      shortcut: siteIcon,
    };
  }

  return metadata;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
