import React, { memo, useCallback, useEffect, useState } from 'react'
import { Trash2, Plus, Minus, Image as ImageIcon, ShoppingCart, DollarSign , Percent } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Modal from '../../../components/common/Modal'

// Clicking the chip opens a centered portal modal, so the special-discount
// form is never clipped or hidden by scroll containers / other elements.
const SpecialDiscountControl = memo(({ item, onApply }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("percent"); // "percent" | "amount"
  const [value, setValue] = useState("");

  const basePrice = Number(item?.salePrice ?? item?.price ?? 0) || 0;
  const isActive =
    item?.specialPrice != null &&
    item?.specialDiscount != null;

  // Re-seed the form each time the modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (isActive) {
      setType(item.specialDiscount.type);
      setValue(String(item.specialDiscount.value ?? ""));
    } else {
      setType("percent");
      setValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const numValue = Number(value);
  const hasValue = value !== "" && Number.isFinite(numValue) && numValue > 0;
  const amount =
    type === "percent"
      ? (Math.min(numValue, 100) / 100) * basePrice
      : numValue;
  const newPrice = Math.max(0, basePrice - amount);
  const isValid = hasValue && amount <= basePrice;

  const handleApply = (e) => {
    if (e) e.preventDefault();
    if (!isValid) return;
    onApply(item.id, { type, value: numValue });
    setIsOpen(false);
  };

  const handleRemove = () => {
    onApply(item.id, null);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <>
      {/* Chip trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title={t("sales.specialDiscount")}
      >
        <img src="/images/specailDiscount.png" alt="Special Discount" className="w-11 h-11 object-contain" />

        {isActive && (
          <span>
            {item.specialDiscount.type === "percent"
              ? `-${item.specialDiscount.value}%`
              : `-$${Number(item.specialDiscount.value).toFixed(2)}`}
          </span>
        )}
      </button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t("sales.specialDiscount")}
        size="sm"
      >
        <form onSubmit={handleApply} className="flex flex-col gap-4">
          <p className="text-xs text-slate-400 -mt-1">
            {t("sales.specialDiscountSubtitle")}
          </p>

          {/* Type toggle */}
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setType("percent")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                type === "percent"
                  ? "bg-white text-[#870d4c] shadow-sm"
                  : "text-slate-500 hover:text-[#870d4c]"
              }`}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => setType("amount")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                type === "amount"
                  ? "bg-white text-[#870d4c] shadow-sm"
                  : "text-slate-500 hover:text-[#870d4c]"
              }`}
            >
              $
            </button>
          </div>

          {/* Input */}
          <div className="relative">
            {type === "amount" && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">
                $
              </span>
            )}

            <input
              type="number"
              min={type === "amount" ? "0.01" : "1"}
              max={type === "amount" ? basePrice.toFixed(2) : "100"}
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder={
                type === "percent"
                  ? t("sales.discountPlaceholder", "0")
                  : "0.00"
              }
              className={`w-full h-10 text-sm rounded-lg bg-[#fcfafb] border outline-none focus:ring-2 focus:ring-[#870d4c]/20 transition-shadow ${
                type === "amount" ? "pl-7 pr-3" : "px-3 pr-8"
              } ${
                hasValue && !isValid
                  ? "border-red-300"
                  : "border-slate-200 focus:border-[#870d4c]/50"
              }`}
            />

            {type === "percent" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">
                %
              </span>
            )}
          </div>

          {/* Quick presets (%) */}
          {type === "percent" && (
            <div className="flex items-center gap-1.5">
              {[5, 10, 15, 20].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue(String(preset))}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                    Number(value) === preset
                      ? "bg-[#870d4c] text-white border-[#870d4c]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#870d4c]/50 hover:text-[#870d4c]"
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          )}

          {/* New price preview */}
          {hasValue && isValid && (
            <p className="text-xs text-slate-500">
              {t("sales.newPrice")}:{" "}
              <span className="font-bold text-[#870d4c] text-sm">
                ${newPrice.toFixed(2)}
              </span>
            </p>
          )}

          {hasValue && !isValid && (
            <p className="text-xs text-red-500">
              {t("sales.discountTooLarge")}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 h-9 rounded-lg bg-[#870d4c] text-white text-xs font-bold hover:bg-[#9d1159] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("sales.apply")}
            </button>

            {isActive && (
              <button
                type="button"
                onClick={handleRemove}
                className="h-9 px-3 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:border-red-300 hover:text-red-500 transition-colors"
              >
                {t("sales.removeDiscount")}
              </button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
});

// 1. Extracted component to prevent the entire cart from re-rendering on a single click
const CartItem = memo(({ item, onUpdateQuantity, onRemoveItem, onSetSpecialDiscount }) => {
  const { t } = useTranslation();
  const handleIncrement = useCallback(() => onUpdateQuantity(item.id, item.quantity + 1), [item.id, item.quantity, onUpdateQuantity])
  const handleDecrement = useCallback(() => onUpdateQuantity(item.id, item.quantity - 1), [item.id, item.quantity, onUpdateQuantity])
  const handleRemove = useCallback(() => onRemoveItem(item.id), [item.id, onRemoveItem])
  
  const basePrice = Number(item?.salePrice ?? item?.price ?? 0) || 0;
  const unitPrice =
    item.specialPrice != null ? Number(item.specialPrice) || 0 : basePrice;
  const hasSpecialDiscount =
    item.specialPrice != null && unitPrice < basePrice;

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

      {/* Info + special discount */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h4>
          <p className="text-xs font-medium whitespace-nowrap">
            {hasSpecialDiscount ? (
              <>
                <del className="text-slate-400 font-normal">
                  ${basePrice.toFixed(2)}
                </del>{" "}
                <span className="text-[#870d4c] font-bold">
                  ${unitPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-slate-500">
                ${basePrice.toFixed(2)}
              </span>
            )}
          </p>
        </div>

        {onSetSpecialDiscount && (
          <SpecialDiscountControl item={item} onApply={onSetSpecialDiscount} />
        )}
      </div>

      {/* Grouped Controls */}
      <div className="flex items-center gap-1 bg-[#fcfafb] rounded-lg border border-slate-200 p-0.5 flex-shrink-0">
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
      <div className="flex flex-col items-end gap-1 ml-2 w-16 flex-shrink-0">
        <span className={`font-bold text-sm ${hasSpecialDiscount ? "text-[#870d4c]" : "text-slate-800"}`}>
          ${(unitPrice * item.quantity).toFixed(2)}
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
export default function OrderCartTable({ cart, onUpdateQuantity, onRemoveItem, onSetSpecialDiscount }) {
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
              onSetSpecialDiscount={onSetSpecialDiscount}
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
