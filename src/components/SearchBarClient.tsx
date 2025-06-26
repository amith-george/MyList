'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBarClient({ initialQuery = '' }: { initialQuery?: string }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?query=${encodeURIComponent(searchQuery)}&page=1`);
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search movies or TV shows..."
        className="bg-zinc-800 text-white px-4 py-2 rounded-md w-full max-w-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </form>
  );
}
