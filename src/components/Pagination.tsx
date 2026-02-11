type PaginationProps = {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
};

const Pagination = ({ currentPage, totalPages, hasNext, hasPrevious, onNext, onPrevious }: PaginationProps) => (
  <div className="mt-6 flex items-center justify-end gap-3">
    <button
      onClick={onPrevious}
      disabled={!hasPrevious}
      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Previous
    </button>
    <span className="text-sm text-slate-600">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={onNext}
      disabled={!hasNext}
      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Next
    </button>
  </div>
);

export default Pagination;
