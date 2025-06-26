'use client';

import { useState } from 'react';

type Props = {
  mediaId: string;
  initialTitle: string;
  initialType: 'movie' | 'tv';
  initialRating?: number;
  initialReview?: string;
  onClose: () => void;
  onSuccess: (updated: { rating: number; review: string }) => void;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

export default function MediaUpdate({
  mediaId,
  initialTitle,
  initialRating = 0,
  initialReview = '',
  onClose,
  onSuccess,
}: Props) {
  const [rating, setRating] = useState(initialRating.toString());
  const [review, setReview] = useState(initialReview);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/media/${mediaId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(rating),
          review,
        }),
      });
      if (!res.ok) throw new Error('Failed to update media');

      onSuccess({ rating: Number(rating), review });
    } catch (err) {
      console.error(err);
      alert('Error updating media.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-zinc-900 text-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Update – {initialTitle}</h2>

        <div className="mb-4">
          <label className="block mb-1">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white"
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
            <option value="0">0 (Haven&apos;t watched)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Review</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Your thoughts..."
            rows={4}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
