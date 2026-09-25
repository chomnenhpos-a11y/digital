import React from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { useProductShareContext } from '../../../context/ProductShareContext';
import { useCart } from '../../../context/CartContext';
import { Share, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProductShareBar() {
  const { t } = useTranslation();
  const { selectedCount, clearSelection, handleShare, isSharing } = useProductShareContext();
  const { cartCount, isCartOpen } = useCart();
  const location = useLocation();

  const isHome = matchPath('/:shop_code', location.pathname);
  const isProductDetail = matchPath('/:shop_code/products/:id', location.pathname);

  if (!isHome && !isProductDetail) return null;

  if (selectedCount === 0) return null;

  const hasCartData = cartCount > 0 && !isCartOpen;

  return (
    <div className={`fixed left-0 right-0 z-[5] px-4 pointer-events-none flex justify-center animate-in slide-in-from-bottom-5 fade-in duration-300 ${hasCartData ? 'bottom-14 md:bottom-10 pb-4 sm:pb-6' : 'bottom-0 pb-4 sm:pb-6'}`}>
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 pointer-events-auto p-3 flex items-center justify-between gap-6 max-w-md w-full">
        
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800">
            {selectedCount !== 1 ? t('product.selectedCountPlural', { count: selectedCount }) : t('product.selectedCount', { count: selectedCount })}
          </span>
          <button 
            onClick={clearSelection}
            disabled={isSharing}
            className="text-xs text-red-400 hover:text-red-600 font-medium text-left mt-0.5 disabled:opacity-50 transition-colors"
          >
            {t('product.clearSelection')}
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
              {t('product.preparingShare')}
            </>
          ) : (
            <>
              <Share size={18} />
              {selectedCount !== 1 ? t('product.sendImagesPlural', { count: selectedCount }) : t('product.sendImages', { count: selectedCount })}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
