'use client';

import { useEffect, useState, useRef, WheelEvent, TouchEvent } from 'react';
import Image from 'next/image';
import MediaAdd from '@/components/MediaAdd';
import type { TmdbData } from '@/types/types';
import { formatDate } from '@/utils/format';
import { FaListUl } from 'react-icons/fa';

type Props = {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  onClose: () => void;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

export default function MediaDetail({ mediaId, mediaType, onClose }: Props) {
  const [detail, setDetail] = useState<TmdbData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lockScroll, setLockScroll] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${backendUrl}/tmdb/${mediaType}/${mediaId}`);
        const data = await res.json();
        setDetail(data);
      } catch (err) {
        console.error('Failed to fetch details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [mediaId, mediaType]);

  const preventScroll = (e: WheelEvent | TouchEvent) => {
    if (lockScroll) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (!modalRef.current) return;

    const current = modalRef.current;

    const handleWheel = (e: WheelEvent) => preventScroll(e);
    const handleTouchMove = (e: TouchEvent) => preventScroll(e);

    current.addEventListener('wheel', handleWheel as unknown as EventListener, { passive: false });
    current.addEventListener('touchmove', handleTouchMove as unknown as EventListener, { passive: false });

    return () => {
      current.removeEventListener('wheel', handleWheel as unknown as EventListener);
      current.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
    };
  }, [lockScroll, preventScroll]);

  if (loading)
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        Loading...
      </div>
    );

  if (!detail) return null;

  const release = detail.release_date || detail.first_air_date;
  const hasCast = Array.isArray(detail.cast) && detail.cast.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-2 md:px-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setLockScroll(true)}
        onMouseLeave={() => setLockScroll(false)}
        className="relative w-full max-w-6xl bg-zinc-900 text-white rounded-lg overflow-y-auto max-h-[90vh] p-6 md:p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-5 bg-red-600 hover:bg-red-700 text-white text-xl font-bold w-8 h-8 rounded-sm flex items-center justify-center"
        >
          ×
        </button>

        <div className="flex flex-col md:flex-row flex-wrap gap-6 md:gap-8">
          {/* Poster Section */}
          <div className="relative w-full md:w-[280px] flex-shrink-0 mt-12 md:mt-0">
            <div className="relative w-full">
              <Image
                src={
                  detail.poster_path
                    ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
                    : '/default-movie.png'
                }
                alt={detail.title || detail.name || 'No title'}
                width={280}
                height={420}
                className="rounded-lg w-full h-auto object-cover"
              />
              {detail.vote_average !== undefined && (
                <span className="absolute top-2 left-2 bg-black/80 text-white text-lg font-semibold px-3 py-1 rounded">
                  ⭐ {detail.vote_average.toFixed(1)}
                </span>
              )}
            </div>

            {detail.trailer_key && (
              <a
                href={`https://www.youtube.com/watch?v=${detail.trailer_key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 w-full bg-red-600 text-white text-center py-2 rounded hover:bg-red-700 transition"
              >
                ▶ Watch Trailer
              </a>
            )}

            <button
              className="mt-3 w-full flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded transition"
              onClick={() => setShowAddModal(true)}
            >
              <FaListUl className="text-lg" />
              Add to List
            </button>
          </div>

          {/* Info Section */}
          <div className="flex-1 text-[1.05rem] overflow-hidden">
            <h2 className="text-3xl font-bold mb-3 break-words text-center">
              {detail.title || detail.name}
            </h2>

            <div className="mb-4 space-y-2">
              {release && <p>Release Date: {formatDate(release)}</p>}
              {mediaType === 'movie' &&
                typeof detail.runtime === 'number' &&
                detail.runtime > 0 && (
                  <p>
                    Runtime: {Math.floor(detail.runtime / 60)}h {detail.runtime % 60}m
                  </p>
                )}

              {mediaType === 'tv' &&
                typeof detail.episode_count === 'number' &&
                detail.episode_count > 0 && (
                  <p>Episodes: {detail.episode_count}</p>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mt-1 mb-6">
              {detail.genres?.map((g) => (
                <span
                  key={g.id}
                  className="bg-red-600 text-white px-3 py-1 text-sm rounded"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="mb-6 leading-relaxed">{detail.overview}</p>

            {detail.director && (
              <p className="mb-4 text-lg font-medium">Director: {detail.director}</p>
            )}

            {hasCast && (
              <div className="mt-4">
                <h3 className="font-semibold text-xl mb-3">Top Cast</h3>
                <div className="flex flex-wrap gap-4 overflow-x-auto pb-2">
                  {detail.cast!.map((actor, i) => (
                    <div
                      key={i}
                      className="min-w-[140px] bg-zinc-800 rounded-lg p-3 text-sm text-left flex-shrink-0"
                    >
                      <p className="font-semibold">{actor.name}</p>
                      <p className="text-gray-400 text-xs">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          onClick={() => setShowAddModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <MediaAdd media={detail} onClose={() => setShowAddModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
