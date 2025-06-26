import AppSidebar from '@/components/Sidebar';
import ListPageClient from '@/components/ListPageClient';
import AuthGuard from '@/components/AuthGuard';
import { Suspense } from 'react';

export default function ListsPage() {
  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#1c1c1c] text-white">
      <AppSidebar />
      <main className="flex-1 p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Your Personalized Lists</h1>
        <Suspense fallback={<p>Loading lists...</p>}>
          <ListPageClient />
        </Suspense>
      </main>
    </div>
    </AuthGuard>
  );
}
