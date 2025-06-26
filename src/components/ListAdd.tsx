'use client';

import { useEffect, useRef, useState } from 'react';

type ListAddProps = {
  userId: string;
  token: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function ListAdd({ userId, token, onClose, onCreated }: ListAddProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockScroll, setLockScroll] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/lists/${userId}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) throw new Error('Failed to create list');

      setTitle('');
      setDescription('');
      onCreated();
      onClose();
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const preventScroll = (e: WheelEvent | TouchEvent) => {
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
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setLockScroll(true)}
        onMouseLeave={() => setLockScroll(false)}
        className="bg-zinc-900 text-white rounded-lg p-6 w-full max-w-md shadow-lg relative"
      >
        <h2 className="text-xl font-semibold mb-5 text-center">Create New List</h2>

        <div className="mb-4">
          <label className="block text-sm mb-1">List Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Favorites"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="e.g. Your top-rated movies or shows"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white resize-none"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
