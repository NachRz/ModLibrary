import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  totalItems,
  onItemsPerPageChange 
}) => {
  const generatePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = totalPages > 1 ? generatePageNumbers() : [];

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 mb-8">
      {/* Información de elementos */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          Mostrando {startItem} a {endItem} de {totalItems} resultados
        </span>
        
        {/* Selector de elementos por página */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-gray-600 focus:border-purple-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-400">por página</span>
        </div>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* Botón anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
              currentPage === 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
          </button>

          {/* Números de página */}
          {pageNumbers.map((pageNumber, index) => (
            <React.Fragment key={index}>
              {pageNumber === '...' ? (
                <span className="px-2 py-1 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(pageNumber)}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
                    currentPage === pageNumber
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  {pageNumber}
                </button>
              )}
            </React.Fragment>
          ))}

          {/* Botón siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
              currentPage === totalPages
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination; 