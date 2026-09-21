import React from 'react'

export function StatsCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 border-l-4 border-l-slate-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 bg-slate-200 rounded w-24" />
        <div className="w-9 h-9 rounded-lg bg-slate-200" />
      </div>
      <div className="h-8 bg-slate-200 rounded w-16 mb-2 mt-1" />
      <div className="h-3 bg-slate-200 rounded w-32" />
    </div>
  )
}

export default function StatsCardSkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  )
}
