import React from 'react';

const DataCardSkeleton = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-full w-full animate-pulse">
      {/* Top Section */}
      <div>
        {/* Image / Header Placeholder */}
        <div className="h-40 md:h-52 -mx-3 -mt-3 mb-3 bg-slate-200 rounded-xl"></div>
        
        {/* Badge Placeholder */}
        <div className="h-4 w-16 bg-slate-200 rounded mb-3"></div>
        
        {/* Title Placeholder */}
        <div className="h-5 w-3/4 bg-slate-200 rounded mb-1"></div>
        <div className="h-4 w-1/2 bg-slate-200 rounded mb-4"></div>
      </div>
      
      {/* Middle Section: Details */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-slate-200 rounded"></div>
        <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
      </div>
      
      {/* Bottom Section: Button */}
      <div className="pt-3 border-t border-slate-100">
        <div className="h-8 w-full bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export default function DataCardSkeletonGrid({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <DataCardSkeleton key={i} />
      ))}
    </>
  );
}
