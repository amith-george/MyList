// src/types.ts

export type BaseMedia = {
  tmdbId: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv';
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  listname?: string;
};

export type MediaItem = BaseMedia & {
  _id: string; // Always required for backend identity
  overview?: string;
  createdAt: string;
  rating?: number;
  review?: string;
};

export type TmdbData = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_count?: number;
  genres?: { id: number; name: string }[];
  trailer_key?: string;
  director?: string;
  cast?: { name: string; character: string }[];
};

export type TmdbMediaItem = TmdbData & BaseMedia;

export type DisplayMediaItem = MediaItem | TmdbMediaItem;

export type User = {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  createdAt: string;
  avatar: string;
};
