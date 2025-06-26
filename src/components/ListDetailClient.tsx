'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import MediaCard from './MediaCard';
import PaginationBar from './PaginationBar';
import ListMediaDetail from './ListMediaDetail';
import { getUserIdFromToken } from '@/utils/auth';
import { useListContext } from '@/context/ListContext';
import { useListFilter } from '@/context/ListFilterContext';
import type { MediaItem } from '@/types/types';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';
const itemsPerPage = 35;

export default function ListDetailClient() {
  const { id: listId } = useParams();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaCounts, setMediaCounts] = useState<{ movie?: number; tv?: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'added-desc' | 'added-asc' | 'rating-desc' | 'rating-asc'>('added-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const userId = getUserIdFromToken();

  const { listData, setListData } = useListContext();
  const { filterType } = useListFilter();

  useEffect(() => {
    if (!listId || !userId || !token) return;

    const fetchListWithDetails = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${backendUrl}/lists/${userId}/${listId}?page=1&limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('List fetch failed');
        const data = await res.json();
        setMediaItems(data.mediaItems);
        setListData({ title: data.list.title, description: data.list.description });

        const countRes = await fetch(`${backendUrl}/lists/${userId}/${listId}/counts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!countRes.ok) throw new Error('Failed to fetch media counts');
        const countData = await countRes.json();
        setMediaCounts(countData.counts || {});
      } catch (err) {
        console.error(err);
        setError('Failed to load list');
      } finally {
        setLoading(false);
      }
    };

    fetchListWithDetails();
  }, [listId, userId, token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery, sortOption]);

  const filteredSortedPaginated = useMemo(() => {
    let filtered = mediaItems;

    if (filterType !== 'all') filtered = filtered.filter((m) => m.media_type === filterType);
    if (searchQuery.trim()) {
      filtered = filtered.filter((m) =>
        (m.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.overview ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'added-desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'added-asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating-desc': return (b.rating || 0) - (a.rating || 0);
        case 'rating-asc': return (a.rating || 0) - (b.rating || 0);
        default: return 0;
      }
    });

    const start = (currentPage - 1) * itemsPerPage;
    return { total: sorted.length, results: sorted.slice(start, start + itemsPerPage) };
  }, [mediaItems, searchQuery, filterType, sortOption, currentPage]);

  if (loading) return <div className="min-h-screen bg-[#1c1c1c] text-white flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-[#1c1c1c] text-white p-6"><p className="text-red-400">{error}</p></div>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-2 text-red-500">{listData?.title}</h1>
      <p className="mb-2 text-gray-400">{listData?.description}</p>

      <div className="flex gap-6 mb-6 text-sm text-gray-300">
        <div>🎬 Movies: {mediaCounts.movie || 0}</div>
        <div>📺 TV Shows: {mediaCounts.tv || 0}</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search in list..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 rounded bg-[#2a2a2a] text-white placeholder-gray-400 w-full sm:w-[300px]"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
          className="px-3 py-2 rounded bg-[#2a2a2a] text-white"
        >
          <option value="added-desc">Added (Newest)</option>
          <option value="added-asc">Added (Oldest)</option>
          <option value="rating-desc">Rating (High → Low)</option>
          <option value="rating-asc">Rating (Low → High)</option>
        </select>
      </div>

      {filteredSortedPaginated.total === 0 ? (
        <p className="text-gray-400">No media items found.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {filteredSortedPaginated.results.map((item) => (
              <div key={item._id} onClick={() => setSelectedMedia(item)}>
              <MediaCard
                id={item.tmdbId}
                title={item.title ?? item.name ?? 'Untitled'}
                posterPath={item.poster_path}
                releaseDate={item.release_date || ''}
                mediaType={item.media_type}
              />
              </div>
            ))}
          </div>
          {filteredSortedPaginated.total > itemsPerPage && (
            <div className="flex justify-center mt-6 mb-10 sm:mb-6">
              <PaginationBar
                currentPage={currentPage}
                totalPages={Math.ceil(filteredSortedPaginated.total / itemsPerPage)}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      )}

      {selectedMedia && (
      <ListMediaDetail
        mediaItem={selectedMedia}
        listId={listId as string}
        isOwner={true} // <-- Add this line
        onClose={() => setSelectedMedia(null)}
        onMediaDeleted={(deletedId) => {
          setMediaItems((prev) => prev.filter((m) => m._id !== deletedId));
          setSelectedMedia(null);
        }}
      />
      )}
    </>
  );
}
