// src/app/profile/[username]/page.tsx
import AppSidebar from '@/components/Sidebar';
import ProfilePageClient from '@/components/ProfilePageClient';

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const { username } = await Promise.resolve(params);

  return (
    <div className="flex min-h-screen bg-[#1c1c1c] text-white">
      <AppSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto relative">
        <ProfilePageClient username={username} />
      </main>
    </div>
  );
}
