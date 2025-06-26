'use client';

import { useRouter } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

type PaginationBarProps = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  query?: string;
  onPageChange?: (page: number) => void; // NEW
};

export default function PaginationBar({
  currentPage,
  totalPages,
  basePath = '',
  query,
  onPageChange,
}: PaginationBarProps) {
  const router = useRouter();

  const getPageItems = () => {
    const items: (number | 'ellipsis')[] = [];
    items.push(1);
    if (currentPage > 3) items.push('ellipsis');

    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) {
        items.push(i);
      }
    }

    if (currentPage < totalPages - 2) items.push('ellipsis');
    if (totalPages > 1) items.push(totalPages);

    return items;
  };

  const goToPage = (page: number) => {
    if (onPageChange) return onPageChange(page);
    const queryParam = query ? `?query=${encodeURIComponent(query)}&page=${page}` : `?page=${page}`;
    router.push(`${basePath}${queryParam}`);
  };

  const pageItems = getPageItems();

  return (
    <Pagination>
      <PaginationContent className="flex items-center gap-2 px-4 max-w-full overflow-x-auto">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) goToPage(currentPage - 1);
            }}
          />
        </PaginationItem>

        {pageItems.map((item, idx) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(item);
                }}
                className={item === currentPage ? 'bg-[#333] text-white hover:bg-[#444]' : ''}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) goToPage(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
