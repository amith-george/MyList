'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { formatDate } from '@/utils/format';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';
import MediaUpdate from './MediaUpdate';
import MediaDelete from './MediaDelete';
import type { MediaItem, TmdbData } from '@/types/types';


type Props = {
  mediaItem: MediaItem;
  listId: string;
  onClose: () => void;
  onMediaDeleted: (deletedId: string) => void;
  onMediaUpdated?: (updated: MediaItem) => void;
  isOwner?: boolean;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

export default function ListMediaDetail({
  mediaItem,
  listId,
  onClose,
  onMediaUpdated,
  onMediaDeleted,
  isOwner = false,
}: Props) {
  const [detail, setDetail] = useState<TmdbData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [media, setMedia] = useState(mediaItem);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${backendUrl}/tmdb/${media.media_type}/${media.tmdbId}`);
        const data = await res.json();
        setDetail(data);
      } catch (err) {
        console.error('Failed to fetch details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [media]);

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
        className="relative w-full max-w-6xl bg-zinc-900 text-white rounded-lg overflow-y-auto scrollbar-hide max-h-[90vh] p-6 md:p-8"
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

            {isOwner && (
              <>
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded transition"
                >
                  <FaEdit />
                  Update Media
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 text-white py-2 rounded transition"
                >
                  <FaTrashAlt />
                  Delete Media
                </button>
              </>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 text-[1.05rem] overflow-hidden">
            <h2 className="text-3xl font-bold mb-3 break-words text-center">
              {detail.title || detail.name}
            </h2>

            <div className="mb-4 space-y-2">
              {release && <p>Release Date: {formatDate(release)}</p>}
              {media.media_type === 'movie' &&
                typeof detail.runtime === 'number' &&
                detail.runtime > 0 && (
                  <p>
                    Runtime: {Math.floor(detail.runtime / 60)}h {detail.runtime % 60}m
                  </p>
              )}

              {media.media_type === 'tv' &&
                typeof detail.episode_count === 'number' &&
                detail.episode_count > 0 && (
                  <p>Episodes: {detail.episode_count}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-1 mb-6">
              {detail.genres?.map((g) => (
                <span key={g.id} className="bg-red-600 text-white px-3 py-1 text-sm rounded">
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

            {/* User Rating & Review */}
            <div className="mt-6 border-t border-zinc-700 pt-4">
              <h3 className="text-xl font-semibold mb-2">Your Review</h3>
              {media.rating !== undefined && (
                <p className="mb-2">⭐ Rating: {media.rating.toFixed(1)}</p>
              )}
              {media.review ? (
                <p className="text-gray-300 whitespace-pre-line">{media.review}</p>
              ) : (
                <p className="text-gray-500 italic">No review added.</p>
              )}
            </div>
          </div>
        </div>

        {/* Update Modal */}
        {showUpdateModal && (
          <MediaUpdate
            mediaId={media._id}
            initialTitle={media.title ?? 'Untitled'}
            initialType={media.media_type}
            initialRating={media.rating}
            initialReview={media.review}
            onClose={() => setShowUpdateModal(false)}
            onSuccess={({ rating, review }) => {
              const updated = { ...media, rating, review };
              setMedia(updated);
              onMediaUpdated?.(updated);
              setShowUpdateModal(false);
            }}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <MediaDelete
            mediaId={media._id}
            listId={listId}
            onClose={() => setShowDeleteModal(false)}
            onDeleted={() => {
              onMediaDeleted(media._id);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
