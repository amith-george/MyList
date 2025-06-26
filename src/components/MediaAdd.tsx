'use client';

import { useEffect, useRef, useState } from 'react';
import { getUserIdFromToken } from '@/utils/auth';

type Props = {
  media: {
    id: number;
    title?: string;
    name?: string;
  };
  onClose: () => void;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API;

export default function MediaAdd({ media, onClose }: Props) {
  const [lists, setLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const modalRef = useRef<HTMLDivElement | null>(null);
  const [lockScroll, setLockScroll] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const userId = getUserIdFromToken();
        const res = await fetch(`${backendUrl}/lists/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch lists');
        const data = await res.json();
        setLists(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!selectedList || !selectedRating) {
        setError('Select both a list and a rating');
        return;
      }

      const userId = getUserIdFromToken();
      const type = media.title ? 'movie' : 'tv';

      const res = await fetch(`${backendUrl}/media/${selectedList}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          tmdbId: media.id,
          title: media.title || media.name,
          type,
          rating: Number(selectedRating),
          review,
          userId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add media');
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const preventScroll = (e: any) => {
      if (lockScroll) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const current = modalRef.current;
    if (!current) return;

    current.addEventListener('wheel', preventScroll, { passive: false });
    current.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      current.removeEventListener('wheel', preventScroll);
      current.removeEventListener('touchmove', preventScroll);
    };
  }, [lockScroll]);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-zinc-900 text-white rounded-lg p-6 w-full max-w-md shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setLockScroll(true)}
        onMouseLeave={() => setLockScroll(false)}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white text-xl font-bold w-8 h-8 rounded-sm flex items-center justify-center"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-5 text-center">
          Add to List – {media.title || media.name}
        </h2>

        <div className="mb-4">
          <label className="block mb-1">Choose a List</label>
          <select
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
            disabled={loading}
          >
            <option value="">Select a list</option>
            {lists.map((list) => (
              <option key={list._id} value={list._id}>
                {list.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Rating</label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          >
            <option value="">Select numerical rating...</option>
            <option value="10">10 (Masterpiece)</option>
            <option value="9">9 (Great)</option>
            <option value="8">8 (Very Good)</option>
            <option value="7">7 (Good)</option>
            <option value="6">6 (Fine)</option>
            <option value="5">5 (Average)</option>
            <option value="4">4 (Bad)</option>
            <option value="3">3 (Very Bad)</option>
            <option value="2">2 (Horrible)</option>
            <option value="1">1 (Appalling)</option>
            <option value="0">0 (Haven't Watched)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Review (optional)</label>
          <textarea
            rows={5}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 resize-none"
            placeholder="Write your thoughts..."
          />
        </div>

        {error && <p className="text-red-400 text-sm mb-3">⚠ {error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 w-full py-2 rounded text-white font-medium"
        >
          💾 Save to List
        </button>
      </div>
    </div>
  );
}
