import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  totalItems = 0,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange = () => {},
  onItemsPerPageChange = null
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate visible page numbers list
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      background: '#ffffff',
      borderTop: '1px solid #E2E8F0',
      flexWrap: 'wrap',
      gap: 12,
      fontSize: '0.85rem',
      color: '#475569'
    }}>
      {/* Left Items Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>
          Hiển thị <strong style={{ color: '#0F172A' }}>{startItem} - {endItem}</strong> trên tổng <strong style={{ color: '#E8920A' }}>{totalItems}</strong> mục
        </span>

        {onItemsPerPageChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            <span>Số lượng:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              style={{ padding: '3px 8px', borderRadius: 6, borderColor: '#CBD5E1', fontSize: '0.8rem', fontWeight: 700 }}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
        )}
      </div>

      {/* Right Navigation Page Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 8px', borderRadius: 6, minWidth: 32, height: 32 }}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Trang đầu"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          className="btn btn-secondary"
          style={{ padding: '6px 8px', borderRadius: 6, minWidth: 32, height: 32 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((p) => (
          <button
            key={p}
            className={`btn ${p === currentPage ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              minWidth: 32,
              height: 32,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: p === currentPage ? 800 : 600
            }}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="btn btn-secondary"
          style={{ padding: '6px 8px', borderRadius: 6, minWidth: 32, height: 32 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Trang sau"
        >
          <ChevronRight size={16} />
        </button>

        <button
          className="btn btn-secondary"
          style={{ padding: '6px 8px', borderRadius: 6, minWidth: 32, height: 32 }}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Trang cuối"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
