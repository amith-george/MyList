'use client';

type Props = {
  mediaId: string;
  listId: string;
  onClose: () => void;
  onDeleted: () => void;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

export default function MediaDelete({ mediaId, listId, onClose, onDeleted }: Props) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const handleDelete = async () => {
    try {
      const res = await fetch(`${backendUrl}/media/${listId}/${mediaId}/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete media');
      onDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error deleting media.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-zinc-900 text-white p-6 rounded-lg w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
        <p className="mb-6">Are you sure you want to delete this media item?</p>
        <div className="flex justify-center gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">
            Cancel
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-700 rounded">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
