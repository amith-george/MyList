'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Allow public access to profile pages
    const isPublicProfile = /^\/profile\/[^\/]+$/.test(pathname);

    if (!token && !isPublicProfile) {
      router.replace('/login');
    }
  }, [router, pathname]);

  return <>{children}</>;
}
