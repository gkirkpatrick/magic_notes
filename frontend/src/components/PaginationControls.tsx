interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  position?: 'top' | 'bottom';
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  position = 'bottom',
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const borderClass = position === 'top' ? 'border-b pb-4 mb-6' : 'border-t pt-4 mt-6';

  return (
    <div className={`flex items-center justify-between ${borderClass} border-gray-200`}>
      <div className="text-sm text-gray-700">
        Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Go to previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Go to next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
