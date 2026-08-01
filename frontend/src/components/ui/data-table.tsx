'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Download, 
  Search, 
  Trash2 
} from 'lucide-react';
import { NoDataState } from '../empty-state';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDef {
  label: string;
  key: string;
  options: FilterOption[];
}

export interface BulkActionDef<T> {
  label: string;
  action: (rows: T[]) => void;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T | string;
  filters?: FilterDef[];
  bulkActions?: BulkActionDef<T>[];
  exportFilename?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchKey,
  filters = [],
  bulkActions = [],
  exportFilename = 'trustzone_export',
}: DataTableProps<T>) {
  // State management
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 1. Reset selection on filter/search change
  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };
      if (value === '') {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      return updated;
    });
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // 2. Filter & Search logic
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Apply Search
      if (search && searchKey) {
        const value = row[searchKey as string];
        if (!value || !value.toString().toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
      } else if (search && !searchKey) {
        // Global search match
        const isMatch = Object.values(row).some((val) =>
          val ? val.toString().toLowerCase().includes(search.toLowerCase()) : false
        );
        if (!isMatch) return false;
      }

      // Apply Filters
      for (const filter of filters) {
        const filterVal = activeFilters[filter.key];
        if (filterVal) {
          const rowVal = row[filter.key];
          if (!rowVal || rowVal.toString() !== filterVal) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, search, searchKey, activeFilters, filters]);

  // 3. Sorting logic
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAscending ? aVal - bVal : bVal - aVal;
      }

      const aString = aVal.toString().toLowerCase();
      const bString = bVal.toString().toLowerCase();

      if (aString < bString) return sortAscending ? -1 : 1;
      if (aString > bString) return sortAscending ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortAscending]);

  // 4. Pagination math
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // 5. Sorting Trigger
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAscending(!sortAscending);
    } else {
      setSortField(field);
      setSortAscending(true);
    }
  };

  // 6. Bulk Row selection helpers
  const selectedRows = useMemo(() => {
    return data.filter((row) => selectedIds.has(row.id));
  }, [data, selectedIds]);

  const toggleSelectAll = () => {
    const allCurrentPageIds = paginatedData.map((row) => row.id).filter(Boolean);
    const hasAllSelected = allCurrentPageIds.every((id) => selectedIds.has(id));

    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (hasAllSelected) {
        allCurrentPageIds.forEach((id) => updated.delete(id));
      } else {
        allCurrentPageIds.forEach((id) => updated.add(id));
      }
      return updated;
    });
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // 7. CSV Exporter
  const handleExport = () => {
    if (sortedData.length === 0) return;

    // Build headers from columns
    const headers = columns.map((col) => col.header).join(',');
    
    // Build rows
    const rows = sortedData.map((row) =>
      columns.map((col) => {
        if (col.accessorKey) {
          const val = row[col.accessorKey as string];
          return `"${val ? val.toString().replace(/"/g, '""') : ''}"`;
        }
        return '""';
      }).join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFilename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border border-border/80 p-4 rounded-xl shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none rounded-lg text-foreground transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-1.5 bg-muted/40 border border-border px-3 py-1.5 rounded-lg text-xs">
              <span className="font-semibold text-muted-foreground">{filter.label}:</span>
              <select
                value={activeFilters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="">All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            onClick={handleExport}
            disabled={sortedData.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-secondary/40 font-semibold text-xs rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
            title="Export to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedIds.size > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-primary/5 border border-primary/20 rounded-xl animate-fade-in">
          <span className="text-xs font-bold text-primary">
            {selectedIds.size} row(s) selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions.map((act, idx) => {
              const Icon = act.icon || Trash2;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    act.action(selectedRows);
                    setSelectedIds(new Set());
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:opacity-90 transition rounded-lg text-xs font-bold shadow-md shadow-primary/10"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {act.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="border border-border/80 bg-card rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold text-xs tracking-wider uppercase">
                {bulkActions.length > 0 && (
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && paginatedData.map((row) => row.id).filter(Boolean).every((id) => selectedIds.has(id))}
                      onChange={toggleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th key={idx} className="p-4">
                    {col.sortable && col.accessorKey ? (
                      <button
                        onClick={() => handleSort(col.accessorKey as string)}
                        className="flex items-center gap-1 hover:text-foreground transition font-bold"
                      >
                        {col.header}
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />
                      </button>
                    ) : (
                      <span className="font-bold">{col.header}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIdx) => {
                  const isChecked = selectedIds.has(row.id);
                  return (
                    <tr 
                      key={row.id || rowIdx} 
                      className={`hover:bg-secondary/25 transition-colors ${
                        isChecked ? 'bg-primary/5' : ''
                      }`}
                    >
                      {bulkActions.length > 0 && (
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectRow(row.id)}
                            className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className="p-4 font-medium text-foreground">
                          {col.cell ? (
                            col.cell(row)
                          ) : col.accessorKey ? (
                            row[col.accessorKey as string]?.toString() || '-'
                          ) : (
                            '-'
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0)} className="p-0">
                    <NoDataState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination panel */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t border-border/80 bg-secondary/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-card border border-border rounded px-1.5 py-1 focus:outline-none"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>records. Page {currentPage} of {totalPages} ({totalItems} total)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-border bg-card rounded-lg hover:bg-secondary/40 transition disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-border bg-card rounded-lg hover:bg-secondary/40 transition disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
