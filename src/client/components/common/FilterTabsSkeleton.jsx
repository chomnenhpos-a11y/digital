import React from 'react'

export default function FilterTabsSkeleton({ count = 6 }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1 md:px-5 md:py-1.5 h-[28px] md:h-[32px] w-20 md:w-24 bg-slate-200 animate-pulse"
        />
      ))}
    </div>
  )
}
