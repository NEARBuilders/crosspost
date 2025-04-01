import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { apiClient } from "../../../lib/api-client";
import { LeaderboardEntry, TimePeriod } from "../../../lib/api-types";
import { SUPPORTED_PLATFORMS } from "../../../config";

export const Route = createFileRoute("/_layout/leaderboard/")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  // State for table data and loading
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEntries, setTotalEntries] = useState(0);

  // State for filters
  const [timeframe, setTimeframe] = useState<TimePeriod>(TimePeriod.ALL_TIME);
  const [platform, setPlatform] = useState<string | undefined>(undefined);

  // State for sorting
  const [sorting, setSorting] = useState<SortingState>([
    { id: "rank", desc: false },
  ]);

  // State for pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Column definitions using TanStack Table's column helper
  const columnHelper = createColumnHelper<LeaderboardEntry>();
  const columns = [
    columnHelper.accessor("rank", {
      header: "Rank",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("signerId", {
      header: "NEAR Account",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <span>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("postCount", {
      header: "Posts",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("firstPostTimestamp", {
      header: "First Post",
      cell: (info) => {
        const timestamp = info.getValue();
        if (!timestamp) return "N/A";
        
        const date = new Date(timestamp);
        return date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
    }),
    columnHelper.accessor("lastPostTimestamp", {
      header: "Last Post",
      cell: (info) => {
        const timestamp = info.getValue();
        if (!timestamp) return "N/A";
        
        const date = new Date(timestamp);
        return date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
    }),
  ];

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalEntries / pagination.pageSize),
  });

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.getLeaderboard(
          pagination.pageSize,
          pagination.pageIndex * pagination.pageSize,
          timeframe,
          platform,
        );

        if (response.success && response.data) {
          // The API response might be nested inside a data property
          // or it might be directly in response.data
          const responseData = response.data as any;
          const leaderboardData = responseData.data || responseData;
          
          // Transform the entries to include rank
          const entries = leaderboardData.entries || [];
          const transformedEntries = entries.map((entry: any, index: number) => ({
            ...entry,
            rank: pagination.pageIndex * pagination.pageSize + index + 1,
          }));
          
          setData(transformedEntries);
          setTotalEntries(leaderboardData.pagination?.total || entries.length);
        } else {
          setError(response.error || "Failed to fetch leaderboard data");
          setData([]);
        }
      } catch (err) {
        setError("An error occurred while fetching leaderboard data");
        console.error("Leaderboard fetch error:", err);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [pagination.pageIndex, pagination.pageSize, timeframe, platform]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        NEAR Account Posting Leaderboard
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Time Period</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as TimePeriod)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value={TimePeriod.DAY}>Last 24 Hours</option>
            <option value={TimePeriod.WEEK}>Last Week</option>
            <option value={TimePeriod.MONTH}>Last Month</option>
            <option value={TimePeriod.YEAR}>Last Year</option>
            <option value={TimePeriod.ALL_TIME}>All Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Platform</label>
          <select
            value={platform || ""}
            onChange={(e) => setPlatform(e.target.value || undefined)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">All Platforms</option>
            {SUPPORTED_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getIsSorted() === "asc" ? (
                            <span>▲</span>
                          ) : header.column.getIsSorted() === "desc" ? (
                            <span>▼</span>
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel()?.rows?.length > 0 ? (
                  table.getRowModel()?.rows?.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells()?.map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {"<<"}
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {"<"}
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {">"}
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {">>"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">
                Page{" "}
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </strong>
              </span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="border rounded px-2 py-1"
              >
                {[10, 25, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
