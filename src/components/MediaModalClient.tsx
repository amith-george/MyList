'use client';

import { useEffect, useState } from 'react';
import MediaDetail from '@/components/MediaDetail';
import type { TmdbMediaItem } from '@/types/types';

// Extend the Window interface to include openMediaDetail
declare global {
  interface Window {
    openMediaDetail: (media: TmdbMediaItem) => void;
  }
}

export default function MediaModalClient() {
  const [selectedMedia, setSelectedMedia] = useState<TmdbMediaItem | null>(null);

  useEffect(() => {
    window.openMediaDetail = (media: TmdbMediaItem) => {
      setSelectedMedia(media);
    };
  }, []);

  return selectedMedia ? (
    <MediaDetail
      mediaId={selectedMedia.id}
      mediaType={selectedMedia.media_type}
      onClose={() => setSelectedMedia(null)}
    />
  ) : null;
}
