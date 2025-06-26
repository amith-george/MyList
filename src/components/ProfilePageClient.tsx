'use client';

import { useEffect, useState } from 'react';
import { getUserIdFromToken } from '@/utils/auth';
import { formatDate } from '@/utils/format';
import { Pencil } from 'lucide-react';
import Image from 'next/image';
import MediaRow from './MediaRow';
import ProfileUpdate from './ProfileUpdate';
import type { MediaItem, User } from '@/types/types';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

export default function ProfilePageClient({ username }: { username: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [latestMovies, setLatestMovies] = useState<MediaItem[]>([]);
  const [latestTV, setLatestTV] = useState<MediaItem[]>([]);
  const [mediaStats, setMediaStats] = useState<{
    totalRatedMovies: number;
    totalRatedTVShows: number;
    averageRating: number;
    mostUsedList?: {
      title: string;
      count: number;
    };
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUsername = localStorage.getItem('username');
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();
      const isSelf = storedUsername === username;
      setIsOwner(isSelf);

      try {
        const url = isSelf
          ? `${backendUrl}/users/${userId}`
          : `${backendUrl}/users/public/${username}`;
        const headers = isSelf ? { Authorization: `Bearer ${token}` } : undefined;

        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (!user?._id) return;

    const fetchLatestMedia = async () => {
      try {
        const [moviesRes, tvRes] = await Promise.all([
          fetch(`${backendUrl}/media/latest/${user._id}/movie`),
          fetch(`${backendUrl}/media/latest/${user._id}/tv`),
        ]);

        if (!moviesRes.ok || !tvRes.ok) throw new Error('Error fetching latest media');

        const moviesData = await moviesRes.json();
        const tvData = await tvRes.json();

        setLatestMovies(moviesData);
        setLatestTV(tvData);
      } catch (err) {
        console.error('Failed to fetch media rows:', err);
      }
    };

    fetchLatestMedia();
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${backendUrl}/media/stats/${user._id}`);
        if (!res.ok) throw new Error('Failed to fetch media stats');
        const data = await res.json();
        setMediaStats(data);
      } catch (err) {
        console.error('Error fetching media stats:', err);
      }
    };

    fetchStats();
  }, [user?._id]);

  const handleLogout = () => {
    ['token', 'username', 'email', 'avatar'].forEach((key) =>
      localStorage.removeItem(key)
    );
    window.location.href = '/login';
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Profile URL copied to clipboard!');
    });
  };

  const handleMediaUpdated = (updatedMedia: MediaItem) => {
    const updateInList = (list: MediaItem[]) =>
      list.map((m) => (m._id === updatedMedia._id ? { ...m, ...updatedMedia } : m));

    setLatestMovies((prev) => updateInList(prev));
    setLatestTV((prev) => updateInList(prev));
  };

  return (
    <>
      {/* Heading & Buttons */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-red-500">Profile</h1>

        {isOwner && (
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="text-base bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
            <button
              onClick={handleShareProfile}
              className="text-base bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md"
            >
              Share Profile
            </button>
          </div>
        )}
      </div>

      {/* Profile and Stats Section */}
      {!user ? (
        <p className="text-gray-400">Loading user profile...</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          {/* Profile Card */}
          <div className="relative bg-[#2c2c2c] p-6 rounded-xl shadow-md w-full md:max-w-xl">
            {isOwner && (
              <button
                className="absolute top-4 right-4 text-gray-300 hover:text-white"
                title="Edit Profile"
                onClick={() => setIsModalOpen(true)}
              >
                <Pencil size={20} />
              </button>
            )}

            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src={`/${user.avatar}`}
                  alt="User Avatar"
                  width={112}
                  height={112}
                  className="rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-semibold">{user.username}</h2>
                  <p className="text-gray-400 text-base">Joined on {formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="w-full mt-4 space-y-4">
                {isOwner && (
                  <div>
                    <p className="text-gray-400 text-base">Email</p>
                    <p className="text-white text-base">{user.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-base">Bio</p>
                  <p className="text-white text-base whitespace-pre-line">
                    {user.bio || 'No bio available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Box */}
            {mediaStats && (
            <div className="bg-[#2c2c2c] p-4 rounded-xl shadow-md w-full md:w-fit self-start">
                <h3 className="text-xl font-semibold text-red-500 mb-3">Stats</h3>
                <div className="space-y-3 text-base text-white">
                <p>
                    <span className="text-gray-400">Movies Rated:</span> {mediaStats.totalRatedMovies}
                </p>
                <p>
                    <span className="text-gray-400">TV Shows Rated:</span> {mediaStats.totalRatedTVShows}
                </p>
                <p>
                    <span className="text-gray-400">Average Rating:</span>{' '}
                    {mediaStats.averageRating.toFixed(2)}
                </p>
                {mediaStats.mostUsedList && (
                    <p>
                    <span className="text-gray-400">Most Used List:</span>{' '}
                    {mediaStats.mostUsedList.title} ({mediaStats.mostUsedList.count} rated)
                    </p>
                )}
                </div>
            </div>
            )}
        </div>
      )}

      {/* Profile Modal */}
      <ProfileUpdate
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={(updatedUser) => setUser(updatedUser)}
        initialUsername={user?.username}
        initialBio={user?.bio}
        initialAvatar={user?.avatar}
      />

      {/* Media Rows */}
      {latestMovies.length > 0 && (
        <MediaRow
          title="Latest Added Movies"
          media={latestMovies}
          useListname={true}
          useListMediaDetail={true}
          isOwner={isOwner}
          onMediaUpdated={handleMediaUpdated}
        />
      )}
      {latestTV.length > 0 && (
        <MediaRow
          title="Latest Added TV Shows"
          media={latestTV}
          useListname={true}
          useListMediaDetail={true}
          isOwner={isOwner}
          onMediaUpdated={handleMediaUpdated}
        />
      )}
    </>
  );
}
