'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

type ListCardProps = {
  title: string;
  description: string;
  listId: string;
};

export default function ListCard({ title, description, listId }: ListCardProps) {
  const router = useRouter();

  return (
    <div
      className="w-full sm:w-[200px] md:w-[180px] lg:w-[200px] bg-[#2a2a2a] rounded-lg overflow-hidden shadow-md hover:shadow-lg cursor-pointer transition-shadow"
      onClick={() => router.push(`/lists/${listId}`)}
    >
      <div className="w-full h-auto">
        <Image
          src="/default-list.png"
          alt={title}
          width={200}
          height={130}
          className="w-full h-auto object-contain"
        />
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
    </div>
  );
}
