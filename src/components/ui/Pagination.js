import React from 'react';
import '../../styles/components/Pagination.css';

const Pagination = ({ currentPage, totalPages, onPrevious, onNext }) => {
  return (
    <div className="pagination-container">
      <button 
        onClick={onPrevious}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        Previous
      </button>
      <span className="page-indicator">
        Page {currentPage} of {totalPages}
      </span>
      <button 
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;