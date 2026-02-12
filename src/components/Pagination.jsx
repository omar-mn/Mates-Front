const Pagination = ({ currentPage, totalPages, hasNext, hasPrevious, onNext, onPrevious }) => (
  <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-soft">
    <button
      onClick={onPrevious}
      disabled={!hasPrevious}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Previous
    </button>

    <p className="text-sm text-slate-600">
      Page {currentPage} of {totalPages}
    </p>

    <button onClick={onNext} disabled={!hasNext} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">
      Next
    </button>
  </div>
);

export default Pagination;
