'use client';

import React, { useState } from 'react';

type ListUpdateProps = {
  userId: string;
  listId: string;
  initialTitle: string;
  initialDescription: string;
  onClose: () => void;
  onSuccess: (updated: { title: string; description: string }) => void;
};

export default function ListUpdate({
  userId,
  listId,
  initialTitle,
  initialDescription,
  onClose,
  onSuccess,
}: ListUpdateProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/lists/${userId}/${listId}/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        onSuccess({ title, description });
        onClose();
      } else {
        alert(data.message || 'Failed to update list.');
      }
    } catch (_error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-zinc-900 text-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Update List</h2>

        <div className="mb-4">
          <label className="block mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
