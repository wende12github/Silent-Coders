import React from "react";
import Button from "./Button";
import { PaginatedResponse } from "../../store/types";

interface PaginatedListProps<T> {
  data: PaginatedResponse<T> | null;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
  className?: string;
  listClassName?: string;
  paginationClassName?: string;
}

function PaginatedList<T>({
  data,
  isLoading,
  onPageChange,
  renderItem,
  emptyMessage = "No items found.",
  loadingMessage = "Loading...",
  className,
  listClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  paginationClassName = "flex justify-center mt-8 space-x-4",
}: PaginatedListProps<T>) {
  const hasItems = data && data.results && data.results.length > 0;

  const hasNextPage = data && data.next !== null;

  const hasPreviousPage = data && data.previous !== null;

  const handlePreviousClick = () => {
    if (!isLoading && hasPreviousPage && data) {
      const previousUrl = new URL(data.previous!);
      const page = previousUrl.searchParams.get("page");
      const previousPageNumber = page ? parseInt(page, 10) : 1;
      onPageChange(previousPageNumber);
    }
  };

  const handleNextClick = () => {
    if (!isLoading && hasNextPage && data) {
      const nextUrl = new URL(data.next!);
      const page = nextUrl.searchParams.get("page");

      const nextPageNumber = page
        ? parseInt(page, 10)
        : data.results.length > 0
        ? data.count / data.results.length + 1
        : 2;
      onPageChange(nextPageNumber);
    }
  };

  return (
    <div className={className}>
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground dark:text-muted-foreground-dark">
          {loadingMessage}
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary dark:border-primary-dark mx-auto mt-4"></div>
        </div>
      ) : hasItems ? (
        <>
          <div className={listClassName}>
            {data!.results.map(renderItem)}
          </div>
          {(hasNextPage || hasPreviousPage) && (
            <div className={paginationClassName}>
              <Button
                onClick={handlePreviousClick}
                disabled={!hasPreviousPage || isLoading}
                variant="outline"
              >
                Previous Page
              </Button>
              <Button
                onClick={handleNextClick}
                disabled={!hasNextPage || isLoading}
                variant="outline"
              >
                Next Page
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground dark:text-muted-foreground-dark">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

export default PaginatedList;
