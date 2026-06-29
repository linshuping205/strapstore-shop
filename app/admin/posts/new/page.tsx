'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/blogs/edit/new');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-gray-500 text-sm">Redirecting...</div>
    </div>
  );
}
