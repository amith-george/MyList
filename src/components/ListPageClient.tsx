'use client';

import { useEffect, useState } from 'react';
import ListCard from './ListCard';
import ListAdd from './ListAdd';
import { getUserIdFromToken } from '@/utils/auth';
import { Plus } from 'lucide-react';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

type UserList = {
  _id: string;
  title: string;
  description: string;
  mediaItems: string[];
};

export default function ListPageClient() {
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');

  const fetchLists = async (userId: string, token: string) => {
    try {
      const res = await fetch(`${backendUrl}/lists/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch user lists');
      const data = await res.json();
      setUserLists(data);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setUserLists([]);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tokenFromStorage = localStorage.getItem('token') || '';
      const uid = getUserIdFromToken();
      if (uid && tokenFromStorage) {
        setUserId(uid);
        setToken(tokenFromStorage);
        fetchLists(uid, tokenFromStorage);
      }
    }
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 mb-8">
        <button
          onClick={() => setShowModal(true)}
          className="w-fit flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-700 text-white text-sm rounded-md"
        >
          <Plus className="w-4 h-4" />
          Create List
        </button>
      </div>

      <div>
        {userLists.length === 0 ? (
          <p className="text-gray-400">You haven't created any lists yet.</p>
        ) : (
          <div className="flex flex-wrap gap-4 sm:gap-6">
            {userLists.map((list) => (
            <ListCard
                key={list._id}
                title={list.title}
                description={list.description}
                listId={list._id}
            />
            ))}
          </div>
        )}
      </div>

      {showModal && userId && token && (
        <ListAdd
          userId={userId}
          token={token}
          onClose={() => setShowModal(false)}
          onCreated={() => fetchLists(userId, token)}
        />
      )}
    </>
  );
}
