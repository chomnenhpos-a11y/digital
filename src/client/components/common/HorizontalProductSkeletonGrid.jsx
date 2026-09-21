import React from 'react'

function HorizontalProductSkeleton() {
  return (
    <div className="min-w-[140px] md:min-w-[180px] w-[140px] md:w-[180px] snap-center shrink-0">
      <div className="bg-white rounded-2xl p-2.5 md:p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/80 flex flex-col h-[200px] md:h-[240px] animate-pulse">
        <div className="w-full h-24 md:h-32 bg-slate-200 rounded-xl mb-2.5" />
        <div className="h-3.5 bg-slate-200 rounded w-3/4 mb-1.5" />
        <div className="h-2.5 bg-slate-200 rounded w-1/2 mb-auto" />
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="w-7 h-7 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function HorizontalProductSkeletonGrid({ count = 5 }) {
  return (
    <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 md:pb-6 snap-x snap-mandatory hide-scrollbar">
        {Array.from({ length: count }).map((_, i) => (
          <HorizontalProductSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
