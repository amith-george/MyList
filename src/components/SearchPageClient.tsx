'use client';

import { useEffect, useState } from 'react';
import SearchBarClient from './SearchBarClient';
import PaginationBar from './PaginationBar';
import MediaCard from './MediaCard';
import MediaModalClient from './MediaModalClient';
import type { TmdbMediaItem } from '@/types/types';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

type Props = {
  searchQuery?: string;
  currentPage: number;
};

export default function SearchPageClient({ searchQuery = '', currentPage }: Props) {
  const safeQuery = searchQuery.trim(); // defensive guard

  const [mediaList, setMediaList] = useState<TmdbMediaItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const endpoint = safeQuery
          ? `${backendUrl}/tmdb/media/search/${encodeURIComponent(safeQuery)}`
          : `${backendUrl}/tmdb/movies/popular?page=${currentPage}`;

        const res = await fetch(endpoint, { cache: 'no-store' });
        const data = await res.json();

        if (safeQuery) {
          setMediaList(data);
        } else {
          setMediaList(data.results || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch media:', err);
      }
    };

    fetchMedia();
  }, [safeQuery, currentPage]);

  return (
    <>
      <SearchBarClient initialQuery={safeQuery} />

      <div className="flex flex-wrap gap-4 justify-start mt-6">
        {mediaList.length > 0 ? (
          mediaList.map((media) => (
            <div
              key={`${media.id}-${media.media_type}`}
              className="cursor-pointer"
              onClick={() =>
                (window as any).openMediaDetail?.({
                  id: media.id,
                  media_type: media.media_type || 'movie',
                  title: media.title,
                  name: media.name,
                })
              }
            >
              <MediaCard
                id={media.id}
                title={media.title || media.name || 'Untitled'}
                releaseDate={media.release_date || media.first_air_date || ''}
                posterPath={media.poster_path}
                mediaType={media.media_type}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-400">No results found.</p>
        )}
      </div>

      {!safeQuery && totalPages > 1 && (
        <div className="mt-8 flex justify-center pb-20 sm:pb-0">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/search"
            query={safeQuery}
          />
        </div>
      )}

      <MediaModalClient />
    </>
  );
}
