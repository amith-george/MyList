import AppSidebar from '@/components/Sidebar';
import ListDetailClient from '@/components/ListDetailClient';
import AuthGuard from '@/components/AuthGuard';
import { ListProvider } from '@/context/ListContext';
import { ListFilterProvider } from '@/context/ListFilterContext';
import { Suspense } from 'react';

export default function ListDetailPage() {
  return (
    <AuthGuard>
    <ListProvider>
      <ListFilterProvider>
        <div className="flex min-h-screen bg-[#1c1c1c] text-white">
          <AppSidebar />
          <main className="flex-1 p-6">
            <Suspense fallback={<p>Loading list...</p>}>
              <ListDetailClient />
            </Suspense>
          </main>
        </div>
      </ListFilterProvider>
    </ListProvider>
    </AuthGuard>
  );
}
