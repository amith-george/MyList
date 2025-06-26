'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import MediaCard from './MediaCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaDetail from './MediaDetail';
import ListMediaDetail from './ListMediaDetail';
import type { DisplayMediaItem, MediaItem } from '@/types/types';

const GAP = 16;

type MediaRowProps = {
  title: string;
  media: DisplayMediaItem[];
  useListname?: boolean;
  useListMediaDetail?: boolean;
  isOwner?: boolean;
  onMediaUpdated?: (updatedMedia: MediaItem) => void;
};

export default function MediaRow({
  title,
  media,
  useListname = false,
  useListMediaDetail = false,
  isOwner = false,
  onMediaUpdated,
}: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState<{
    id: number;
    type: 'movie' | 'tv';
  } | null>(null);

  const [selectedListMedia, setSelectedListMedia] = useState<MediaItem | null>(null);

  const updateIsMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const updateScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isMobile) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, [isMobile]);

  useEffect(() => {
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, [updateIsMobile]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isMobile) return;
    updateScroll();
    el.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      el.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [updateScroll, isMobile]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    const cardEl = firstCardRef.current;
    if (!el || !cardEl) return;

    const cardWidth = cardEl.offsetWidth;
    const scrollAmount = (cardWidth + GAP) * 3;

    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleCardClick = (item: DisplayMediaItem) => {
    const mediaType = item.media_type;
    if (useListMediaDetail && 'createdAt' in item) {
      setSelectedListMedia({ ...item, media_type: mediaType });
    } else {
      setSelectedMedia({
        id: item.tmdbId,
        type: mediaType,
      });
    }
  };

  return (
    <div className="relative mb-10 w-full overflow-hidden">
      <h2 className="text-base sm:text-lg font-bold mb-3 ml-1 text-red-500">{title}</h2>

      <div className="relative">
        {!isMobile && canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div
          ref={scrollRef}
          className={`flex overflow-x-auto gap-4 pb-4 scrollbar-hide pr-2 ${
            isMobile ? '-mx-2 px-2' : ''
          }`}
        >
          {Array.isArray(media) &&
            media.map((item, index) => (
              <div ref={index === 0 ? firstCardRef : null} key={item.tmdbId + (item.title || item.name || '')}>
                <MediaCard
                  id={item.tmdbId}
                  title={item.title || item.name || 'Untitled'}
                  releaseDate={item.release_date || item.first_air_date || 'Unknown'}
                  posterPath={item.poster_path}
                  subtitleOverride={useListname ? item.listname : undefined}
                  onClick={() => handleCardClick(item)}
                />
              </div>
            ))}
        </div>

        {!isMobile && canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Default TMDb Modal */}
      {selectedMedia && !useListMediaDetail && (
        <MediaDetail
          mediaId={selectedMedia.id}
          mediaType={selectedMedia.type}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      {/* List Media Modal */}
      {selectedListMedia && useListMediaDetail && (
        <ListMediaDetail
          mediaItem={selectedListMedia}
          listId="public"
          onClose={() => setSelectedListMedia(null)}
          onMediaDeleted={() => {}}
          onMediaUpdated={(updatedMedia) => {
            setSelectedListMedia((prev) =>
              prev?._id === updatedMedia._id ? { ...prev, ...updatedMedia } : prev
            );
            onMediaUpdated?.(updatedMedia);
          }}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}
