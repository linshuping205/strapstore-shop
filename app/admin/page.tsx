import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import AdminDashboard from './AdminDashboard';

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
  return {
    title: `Dashboard | ${siteTitle}`,
  };
}

export default function AdminPage() {
  return <AdminDashboard />;
}
