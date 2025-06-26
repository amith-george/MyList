export const dynamic = 'force-dynamic'; // ✅ Add this to avoid static generation issues

import AppSidebar from '@/components/Sidebar';
import MediaRow from '@/components/MediaRow';
import AuthGuard from '@/components/AuthGuard';
import type { TmdbMediaItem } from '@/types/types';

const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

const orderedKeys = [
  'Latest Releases',
  'Upcoming Movies',
  'Top Rated Movies',
  'Top TV Shows',
  'Action Movies',
  'Adventure Movies',
  'Fantasy Movies',
  'Comedy Movies',
  'Animation',
  'Romance Movies',
  'Horror Movies',
  'Documentaries',
];

const endpoints = [
  { key: 'Latest Releases', url: `${backendBaseUrl}/tmdb/movies/latest` },
  { key: 'Upcoming Movies', url: `${backendBaseUrl}/tmdb/movies/upcoming` },
  { key: 'Top Rated Movies', url: `${backendBaseUrl}/tmdb/movies/top-rated` },
  { key: 'Top TV Shows', url: `${backendBaseUrl}/tmdb/tv/top-rated` },
  { key: 'Action Movies', url: `${backendBaseUrl}/tmdb/movies/category/action` },
  { key: 'Adventure Movies', url: `${backendBaseUrl}/tmdb/movies/category/adventure` },
  { key: 'Fantasy Movies', url: `${backendBaseUrl}/tmdb/movies/category/fantasy` },
  { key: 'Comedy Movies', url: `${backendBaseUrl}/tmdb/movies/category/comedy` },
  { key: 'Animation', url: `${backendBaseUrl}/tmdb/movies/category/animation` },
  { key: 'Romance Movies', url: `${backendBaseUrl}/tmdb/movies/category/romance` },
  { key: 'Horror Movies', url: `${backendBaseUrl}/tmdb/movies/category/horror` },
  { key: 'Documentaries', url: `${backendBaseUrl}/tmdb/movies/category/documentary` },
];

async function fetchSections(): Promise<{ [key: string]: TmdbMediaItem[] }> {
  const fetchedData: { [key: string]: TmdbMediaItem[] } = {};

  await Promise.all(
    endpoints.map(async ({ key, url }) => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        const results: TmdbMediaItem[] = Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              tmdbId: item.id,
              media_type: item.media_type || (item.title ? 'movie' : 'tv'),
            }))
          : (data?.results || []).map((item: Record<string, unknown>) => ({
              ...item,
              tmdbId: item.id as number,
              media_type:
                item.media_type ||
                (typeof item.title === 'string' ? 'movie' : 'tv'),
            })) as TmdbMediaItem[];

        fetchedData[key] = results;
      } catch (err) {
        console.error(`Error fetching ${key}:`, err);
        fetchedData[key] = [];
      }
    })
  );

  return fetchedData;
}

export default async function Home() {
  const sections = await fetchSections();

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#1c1c1c] text-white">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {orderedKeys.map((title) =>
            sections[title]?.length ? (
              <MediaRow
                key={title}
                title={title}
                media={sections[title].slice(0, 15)}
              />
            ) : null
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
