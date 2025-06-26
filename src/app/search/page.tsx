// src/app/search/page.tsx
import AppSidebar from '@/components/Sidebar';
import SearchPageClient from '@/components/SearchPageClient';
import AuthGuard from '@/components/AuthGuard';
import { Suspense } from 'react';

type Props = {
  searchParams: Promise<{ query?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  // Await searchParams before using
  const { query = '', page = '1' } = await searchParams;

  const searchQuery = query;
  const currentPage = Number(page);

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#1c1c1c] text-white">
      <AppSidebar />
      <main className="flex-1 p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Search Media</h1>
        <Suspense fallback={<p>Loading search...</p>}>
          <SearchPageClient searchQuery={searchQuery} currentPage={currentPage} />
        </Suspense>
      </main>
    </div>
    </AuthGuard>
  );
}
