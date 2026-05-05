import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utilities";
import * as React from "react";

interface PaginationProperties {
  className?: string;
  onChange: (value: number) => void;
  total: number;
  value: number;
}

const getPageItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  pages.add(currentPage);
  pages.add(currentPage - 1);
  pages.add(currentPage + 1);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .toSorted((a, b) => a - b);
};

export const Pagination: React.FC<PaginationProperties> = ({
  className,
  onChange,
  total,
  value,
}) => {
  if (total <= 1) {
    return;
  }

  const pages = getPageItems(value, total);

  return (
    <nav className={cn("flex items-center gap-2", className)}>
      <Button
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        size="sm"
        type="button"
        variant="outline"
      >
        Previous
      </Button>

      {pages.map((page, index) => {
        const previousPage = pages[index - 1];
        const shouldShowGap = index > 0 && page - previousPage > 1;

        return (
          <React.Fragment key={page}>
            {shouldShowGap && (
              <span className="px-1 text-sm text-gray-500">...</span>
            )}
            <Button
              onClick={() => onChange(page)}
              size="sm"
              type="button"
              variant={value === page ? "default" : "outline"}
            >
              {page}
            </Button>
          </React.Fragment>
        );
      })}

      <Button
        disabled={value >= total}
        onClick={() => onChange(Math.min(total, value + 1))}
        size="sm"
        type="button"
        variant="outline"
      >
        Next
      </Button>
    </nav>
  );
};
