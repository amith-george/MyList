import Image from 'next/image';
import { formatDate } from '@/utils/format';

type MediaCardProps = {
  id: number | string;
  title: string;
  releaseDate: string;
  posterPath?: string;
  mediaType?: string;
  subtitleOverride?: string;
  onClick?: () => void;
};

export default function MediaCard({
  id: _id,
  title,
  releaseDate,
  posterPath,
  subtitleOverride,
  onClick,
}: MediaCardProps) {
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : '/default-movie.png';

  return (
    <div
      className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] cursor-pointer"
      onClick={onClick}
    >
      <div className="w-full h-[240px] sm:h-[260px] md:h-[280px] relative overflow-hidden rounded-md">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 160px, 200px"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <p className="mt-2 text-sm font-semibold truncate">{title}</p>
      <p className="text-xs text-gray-300">
        {subtitleOverride || formatDate(releaseDate)}
      </p>
    </div>
  );
}
