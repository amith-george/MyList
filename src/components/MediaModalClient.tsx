'use client';

import { useState } from 'react';
import MediaDetail from '@/components/MediaDetail';

type MediaItem = {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
};

export default function MediaModalClient() {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  if (typeof window !== 'undefined') {
    (window as any).openMediaDetail = (media: MediaItem) => {
      setSelectedMedia(media);
    };
  }

  return selectedMedia ? (
    <MediaDetail
      mediaId={selectedMedia.id}
      mediaType={selectedMedia.media_type}
      onClose={() => setSelectedMedia(null)}
    />
  ) : null;
}
