import React from 'react'

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-slate-100 flex flex-col h-[280px] md:h-[320px] animate-pulse">
      <div className="w-full h-32 md:h-40 bg-slate-200 rounded-xl mb-3" />
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
      <div className="mt-auto">
        <div className="flex justify-between items-end">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function ProductSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
