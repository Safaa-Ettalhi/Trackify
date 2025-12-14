import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages,  onPageChange }) => {
  if (pages <= 1) return null;
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    if (pages <= maxVisible) {
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else if (page <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pageNumbers.push(i);
      }
    } else if (page >= pages - 2) {
      for (let i = pages - maxVisible + 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      for (let i = page - 2; i <= page + 2; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
        title="Page précédente"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`flex items-center justify-center min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              page === pageNum
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md'
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
        title="Page suivante"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;

