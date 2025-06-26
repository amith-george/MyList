'use client';

import React, { useState } from 'react';

type ListDeleteProps = {
  userId: string;
  listId: string;
  onClose: () => void;
  onDeleted: () => void;
};

export default function ListDelete({
  userId,
  listId,
  onClose,
  onDeleted,
}: ListDeleteProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/lists/${userId}/${listId}/delete`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        onDeleted();
      } else {
        alert(data.message || 'Failed to delete list.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-zinc-900 text-white p-6 rounded-lg w-full max-w-sm text-center shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-red-500">Confirm Delete</h2>
        <p className="mb-3">Are you sure you want to delete this list?</p>
        <p className="mb-6">This action cannot be undone.</p>
        <div className="flex justify-center gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
