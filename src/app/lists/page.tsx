
import AppSidebar from '@/components/Sidebar';
import ListPageClient from '@/components/ListPageClient';
import { ListProvider } from '@/context/ListContext';
import { ListFilterProvider } from '@/context/ListFilterContext';
import { Suspense } from 'react';
import { cookies } from 'next/headers';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

export default async function ListsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let initialLists = [];

  if (token) {
    try {
      // Decode JWT to get user ID
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
      const userId = payload.id;

      const res = await fetch(`${backendUrl}/lists/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store' // Ensure fresh data on reload
      });

      if (res.ok) {
        initialLists = await res.json();
      }
    } catch (err) {
      console.error('Failed to fetch initial lists:', err);
    }
  }

  return (
    <ListProvider>
      <ListFilterProvider>
        <div className="flex min-h-screen bg-[#1c1c1c] text-white">
          <AppSidebar />
          <main className="flex-1 p-4 sm:p-6">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Your Personalized Lists</h1>
            <Suspense fallback={<p>Loading lists...</p>}>
              <ListPageClient initialLists={initialLists} />
            </Suspense>
          </main>
        </div>
      </ListFilterProvider>
    </ListProvider>
  );
}
