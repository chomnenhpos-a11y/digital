import React from 'react'

export default function DataTableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <div className="bg-white border border-slate-200 rounded-t-2xl shadow-xs overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[#fcfafb] border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-4">
                  <div className="h-3.5 bg-slate-200 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-full max-w-[140px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
