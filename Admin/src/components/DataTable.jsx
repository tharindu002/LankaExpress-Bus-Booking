import React, { useState } from 'react';
import { Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const DataTable = ({
  columns,
  data = [],
  searchPlaceholder = 'Search records...',
  filterOptions = [],
  onFilterChange,
  filename = 'report.pdf',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search filtering
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return columns.some((col) => {
      const val = col.accessor ? row[col.accessor] : col.getValue ? col.getValue(row) : null;
      return val && val.toString().toLowerCase().includes(term);
    });
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // PDF Export handler
  const exportToPDF = () => {
    if (!data || data.length === 0) return;

    // Exclude 'Action' / 'Actions' columns from PDF export
    const exportableColumns = columns.filter(
      (c) => c.header && !['action', 'actions'].includes(String(c.header).toLowerCase())
    );

    const headers = exportableColumns.map((c) => String(c.header));
    const rows = filteredData.map((row) =>
      exportableColumns.map((c) => {
        let val = c.accessor ? row[c.accessor] : c.getValue ? c.getValue(row) : '';
        if (typeof val === 'object' && val !== null) {
          val = row[c.accessor] !== undefined ? row[c.accessor] : '';
        }
        return String(val ?? '');
      })
    );

    const doc = new jsPDF();
    const primaryColor = [15, 23, 42]; // Slate navy #0f172a
    const emeraldColor = [16, 185, 129]; // Emerald green #10b981

    // Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('LANKA EXPRESSWAY BUS BOOKING SYSTEM', 14, 14);

    const cleanTitle = filename.replace(/\.(csv|pdf)$/i, '').replace(/_/g, ' ').toUpperCase();
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(209, 213, 219);
    doc.text(`Official Data Export — ${cleanTitle}`, 14, 22);

    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 125, 22);

    autoTable(doc, {
      startY: 38,
      head: [headers],
      body: rows,
      theme: 'striped',
      headStyles: {
        fillColor: emeraldColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      styles: { cellPadding: 2.5 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Lanka Expressway Bus Booking System — Official Export Document', 14, 287);
      doc.text(`Page ${i} of ${pageCount}`, 180, 287);
    }

    const saveName = filename.endsWith('.pdf') ? filename : filename.replace(/\.csv$/i, '.pdf');
    doc.save(saveName);
  };

  return (
    <div className="space-y-5">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-88">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="input-control pl-10 text-xs sm:text-sm py-2.5"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          {filterOptions.map((f, i) => (
            <select
              key={i}
              className="input-control w-auto text-xs py-2.5 px-3 bg-slate-900 border-slate-700"
              onChange={(e) => onFilterChange && onFilterChange(f.key, e.target.value)}
            >
              <option value="">{f.label}</option>
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          <button onClick={exportToPDF} className="btn btn-secondary text-xs py-2.5 px-4 shadow-sm bg-slate-900 border-slate-700 hover:border-emerald-500 text-slate-200">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container shadow-xl">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={row._id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render
                        ? col.render(row)
                        : col.accessor
                        ? row[col.accessor]
                        : col.getValue
                        ? col.getValue(row)
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-2 pt-2">
        <div>
          Showing <span className="font-bold text-slate-200">{filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
          <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, filteredData.length)}</span> of{' '}
          <span className="font-bold text-emerald-400">{filteredData.length}</span> entries
        </div>

        <div className="flex items-center gap-3">
          <button
            className="btn btn-secondary btn-xs px-3 py-1.5"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="font-bold text-slate-300 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-xs px-3 py-1.5"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
