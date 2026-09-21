import React from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { useProductShareContext } from '../../../context/ProductShareContext';
import { Share, Loader2 } from 'lucide-react';

export default function ProductShareBar() {
  const { selectedCount, clearSelection, handleShare, isSharing } = useProductShareContext();
  const location = useLocation();

  const isHome = matchPath('/:shop_code', location.pathname);
  const isProductDetail = matchPath('/:shop_code/products/:id', location.pathname);

  if (!isHome && !isProductDetail) return null;

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 sm:pb-6 pointer-events-none flex justify-center animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 pointer-events-auto p-3 flex items-center justify-between gap-6 max-w-md w-full">
        
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800">
            Selected: {selectedCount} product{selectedCount !== 1 ? 's' : ''}
          </span>
          <button 
            onClick={clearSelection}
            disabled={isSharing}
            className="text-xs text-red-400 hover:text-red-600 font-medium text-left mt-0.5 disabled:opacity-50 transition-colors"
          >
            Clear selection
          </button>
        </div>

        <button
          onClick={handleShare}
          disabled={isSharing}
          className="bg-gray-900 hover:bg-black text-white rounded-xl px-5 py-2.5 flex items-center justify-center gap-2 font-medium text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
        >
          {isSharing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Share size={18} />
              Send {selectedCount} Images
            </>
          )}
        </button>
      </div>
    </div>
  );
}
