import React from 'react'

export default function ProductPrice({ price, oldPrice }) {
  const currentPrice = Number(price || 0)
  const originalPrice = oldPrice ? Number(oldPrice) : null

  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-red-700 font-bold text-lg">
        ${currentPrice.toFixed(2)}
      </span>
      {originalPrice && originalPrice > currentPrice && (
        <span className="text-slate-400 text-sm line-through">
          ${originalPrice.toFixed(2)}
        </span>
      )}
    </div>
  )
}