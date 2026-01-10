const TablePagination = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-between items-center p-4">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 rounded-lg border disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-sm text-[#1B3C53]">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 rounded-lg border disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default TablePagination;
// --- IGNORE ---