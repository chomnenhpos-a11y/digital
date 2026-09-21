import React, { memo, useCallback } from 'react'
import { Trash2, Plus, Minus, Image as ImageIcon, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// 1. Extracted component to prevent the entire cart from re-rendering on a single click
const CartItem = memo(({ item, onUpdateQuantity, onRemoveItem }) => {
  const { t } = useTranslation();
  const handleIncrement = useCallback(() => onUpdateQuantity(item.id, item.quantity + 1), [item.id, item.quantity, onUpdateQuantity])
  const handleDecrement = useCallback(() => onUpdateQuantity(item.id, item.quantity - 1), [item.id, item.quantity, onUpdateQuantity])
  const handleRemove = useCallback(() => onRemoveItem(item.id), [item.id, onRemoveItem])

  return (
    <div className="p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group">
      {/* Compact Image */}
      <div className="h-12 w-12 bg-[#fcfafb] rounded-md overflow-hidden flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-200">
        {item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={20} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h4>
        <p className="text-xs text-slate-500 font-medium">${(item.salePrice || 0).toFixed(2)}</p>
      </div>

      {/* Grouped Controls */}
      <div className="flex items-center gap-1 bg-[#fcfafb] rounded-lg border border-slate-200 p-0.5">
        <button 
          onClick={handleDecrement} 
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-white hover:shadow-xs transition-all"
        >
          <Minus size={14} />
        </button>
        <span className="text-sm font-bold w-6 text-center text-slate-700">{item.quantity}</span>
        <button 
          onClick={handleIncrement} 
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-white hover:shadow-xs transition-all"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Total & Action */}
      <div className="flex flex-col items-end gap-1 ml-2 w-16">
        <span className="font-bold text-slate-800 text-sm">
          ${((item.salePrice || 0) * item.quantity).toFixed(2)}
        </span>
        <button
          onClick={handleRemove}
          className="text-slate-300 hover:text-red-500 transition-colors"
          title={t('order.deleteItem')}
        >
          <Trash2 size={16} className=' text-red-600'/>
        </button>
      </div>
    </div>
  )
})

// Main Cart Component
export default function OrderCartTable({ cart, onUpdateQuantity, onRemoveItem }) {
  const { t } = useTranslation()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Upgraded Header with dynamic totals */}
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 shadow-xs">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          {t('order.currentOrder')}
          {totalItems > 0 && (
            <span className="bg-[#870d4c]/10 text-[#9d1159] text-xs px-2 py-0.5 rounded-full font-bold">
              {totalItems}
            </span>
          )}
        </h3>
      </div>

      {/* Cart List Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 overscroll-contain will-change-scroll">
        {cart && cart.length > 0 ? (
          cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
            />
          ))
        ) : (
          /* Improved Empty State */
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
            <div className="w-16 h-16 bg-[#fcfafb] rounded-full flex items-center justify-center mb-3">
              <ShoppingCart size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">{t('order.emptyCart')}</p>
            <p className="text-xs mt-1">{t('order.selectProductToStart')}</p>
          </div>
        )}
      </div>
    </div>
  )
}