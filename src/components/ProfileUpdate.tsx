'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getUserIdFromToken } from '@/utils/auth';
import clsx from 'clsx';

const avatarOptions = ['boy1.png', 'boy2.png', 'boy3.png', 'girl1.png', 'girl2.png', 'girl3.png'];
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:4000';

interface ProfileUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: any) => void;
  initialUsername?: string;
  initialBio?: string;
  initialAvatar?: string;
}

export default function ProfileUpdate({
  isOpen,
  onClose,
  onUpdate,
  initialUsername = '',
  initialBio = '',
  initialAvatar = 'boy1.png',
}: ProfileUpdateProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('boy1.png');

  const [avatarIndex, setAvatarIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockScroll, setLockScroll] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = getUserIdFromToken();
    const storedToken = localStorage.getItem('token');
    if (id && storedToken) {
      setUserId(id);
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    setUsername(initialUsername);
    setBio(initialBio);
    setAvatar(initialAvatar);

    const idx = avatarOptions.indexOf(initialAvatar);
    if (idx !== -1) setAvatarIndex(idx);
  }, [initialUsername, initialBio, initialAvatar]);

  useEffect(() => {
    const newAvatar = avatarOptions[avatarIndex];
    setFade(false);
    const timeout = setTimeout(() => {
      setAvatar(newAvatar);
      setFade(true);
    }, 150);
    return () => clearTimeout(timeout);
  }, [avatarIndex]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !token) return;

    if (!username.trim()) {
      setShowError(true);
      return;
    }

    if (bio.length > 150) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const body: any = {
      username: username.trim(),
      bio,
      avatar,
    };

    try {
      const res = await fetch(`${backendUrl}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || 'Update failed');
        setIsSubmitting(false);
        return;
      }

      onUpdate(data.user);
      onClose();
    } catch (error: any) {
      setErrorMessage('Something went wrong. Please try again.');
      console.error('Error updating user:', error);
    } finally {
      setIsSubmitting(false);
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

  if (!isOpen) return null;

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
        className="bg-zinc-900 text-white rounded-lg p-0 w-full max-w-4xl shadow-lg relative border border-zinc-700 overflow-hidden"
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Section: Avatar */}
          <div className="w-full md:w-1/2 bg-zinc-800 p-8 border-r border-zinc-700 flex flex-col">
            <h2 className="text-xl font-semibold mb-6 text-left">Profile Picture</h2>
            <div className="flex items-center justify-center gap-6 mt-auto mb-auto">
              <button
                type="button"
                onClick={() =>
                  setAvatarIndex((prev) => (prev - 1 + avatarOptions.length) % avatarOptions.length)
                }
                className="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white transition"
              >
                <ChevronLeft size={20} />
              </button>

              <Image
                key={avatar}
                src={`/${avatar}`}
                alt="Selected Avatar"
                width={190}
                height={190}
                className={clsx('rounded-full transition-opacity duration-300', {
                  'opacity-0': !fade,
                  'opacity-100': fade,
                })}
              />

              <button
                type="button"
                onClick={() =>
                  setAvatarIndex((prev) => (prev + 1) % avatarOptions.length)
                }
                className="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Right Section: Form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Edit Profile</h2>
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm mb-1 text-gray-300">Username</label>
                <input
                  type="text"
                  className={clsx(
                    'w-full px-3 py-2 bg-zinc-800 border rounded text-white focus:outline-none focus:ring-2',
                    {
                      'border-red-500 focus:ring-red-600': showError,
                      'border-zinc-700 focus:ring-red-600': !showError,
                    }
                  )}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (e.target.value.trim()) {
                      setShowError(false);
                    }
                  }}
                />
                {showError && !username.trim() && (
                  <p className="text-red-500 text-sm mt-1">Username is required.</p>
                )}
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm mb-1 text-gray-300">Bio</label>
                <textarea
                  className={clsx(
                    'w-full px-3 py-2 bg-zinc-800 border rounded text-white resize-none focus:outline-none focus:ring-2',
                    {
                      'border-red-500 focus:ring-red-600': bio.length > 150,
                      'border-zinc-700 focus:ring-red-600': bio.length <= 150,
                    }
                  )}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
                {bio.length > 150 && (
                  <p className="text-red-500 text-sm mt-1">Bio cannot exceed 150 characters.</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </button>

              {/* General Error Message */}
              {errorMessage && (
                <p className="text-red-500 text-sm text-center">{errorMessage}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
