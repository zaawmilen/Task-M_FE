import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Optional: Generate page numbers for direct navigation
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex flex-wrap justify-center items-center gap-2 my-4" aria-label="Pagination Navigation">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50 focus:outline-none focus:ring focus:ring-blue-400"
        aria-label="Previous Page"
      >
        Previous
      </button>

      {/* Optional: Show page numbers for direct navigation */}
      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-3 py-1 rounded focus:outline-none focus:ring focus:ring-blue-400 ${
            num === currentPage ? 'bg-blue-600 text-white font-bold' : 'bg-gray-200 text-gray-700'
          }`}
          aria-current={num === currentPage ? 'page' : undefined}
        >
          {num}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50 focus:outline-none focus:ring focus:ring-blue-400"
        aria-label="Next Page"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;