import React, { useState, useEffect, useRef } from "react";
import { Save, Plus, Trash2, Search, ChevronDown, PackageSearch } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useProductsQuery } from "../../../../queries/products/useProductQueries";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderUpdateSchema } from "../schemas/orderUpdateSchema";

function SearchableProductSelect({ value, onChange, products, hasError }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const selectedProduct = products.find((p) => Number(p.id) === Number(value));
  const displayValue = selectedProduct ? selectedProduct.name : "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableProducts = products.filter(
    (p) => Number(p.stockQuantity ?? p.stock ?? 0) > 0
  )

  const filteredProducts = availableProducts.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex items-center justify-between w-full px-3 py-2 text-sm bg-white border rounded-lg cursor-pointer hover:border-[#870d4c] shadow-sm transition-all ${hasError ? 'border-red-500' : 'border-slate-200'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative text-xs">
          {displayValue || t('order.selectProductPlaceholder')}
        </div>
        <ChevronDown size={16} className="text-slate-400 shrink-0 ml-1" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-56 flex flex-col">
          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-6 pr-2 py-1 text-xs border border-slate-200 rounded outline-none focus:border-[#870d4c]"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-44 divide-y divide-slate-50">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const isSelected = Number(value) === Number(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onChange(p.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between transition-colors ${
                      isSelected ? "bg-[#870d4c]/5 text-[#870d4c]" : "text-slate-700"
                    }`}
                  >
                    <span className="truncate mr-2">{p.name}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-2 py-3 text-xs text-center text-slate-500">{t('order.productNotFound')}</div>
            )}
        </div>
      </div>
    )}
  </div>
);
}

export default function OrderUpdateForm({ onSubmit, initialData, onClose, isSubmitting }) {
  const { t } = useTranslation();
  const { data: products = [] } = useProductsQuery();

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(orderUpdateSchema),
    defaultValues: {
      status: "Pending",
      paymentStatus: "Unpaid",
      customerPhone: "",
      customerAddress: "",
      deliveryFee: 0,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (initialData && products.length > 0) {
      const initialItems = initialData.orderDetails || initialData.items || [];
      const rawPhone = initialData.customerPhone || initialData.phone || "";
      const formattedPhone = rawPhone.startsWith("+855") ? rawPhone.slice(4) : rawPhone;

      reset({
        status: initialData.status || "Pending",
        paymentStatus: initialData.paymentStatus || "Unpaid",
        customerPhone: formattedPhone,
        customerAddress: initialData.customerAddress || initialData.address || "",
        deliveryFee: Number(initialData.deliveryFee || initialData.delivery || 0),
        items: initialItems.map((item) => {
          const prodId = Number(item.product_id || item.productId || item.id);
          const matchedProd = products.find((p) => Number(p.id) === prodId);
          const itemPrice = Number(
            item.price ?? item.salePrice ?? (matchedProd ? (matchedProd.salePrice || matchedProd.price) : 0)
          );
          return {
            productId: prodId,
            quantity: Number(item.quantity) || 1,
            price: itemPrice,
          };
        }),
      });
    }
  }, [initialData, products, reset]);

  const watchItems = watch("items") || [];
  const deliveryFee = Number(watch("deliveryFee") || 0);

  const calcSubtotal = watchItems.reduce((sum, item) => {
    return sum + (Number(item.price || 0) * Number(item.quantity || 0));
  }, 0);
  const calcTotal = calcSubtotal + deliveryFee;

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 text-slate-800">
      <div className="bg-[#fcfafb] border border-slate-100 p-4 rounded-xl space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[#870d4c] rounded-full" />
          {t('order.orderInfoTitle')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              {t('order.statusTitle')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register("status")}
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white outline-none focus:border-[#870d4c] focus:ring-1 focus:ring-[#870d4c]/30 transition-all shadow-sm"
            >
              <option value="Pending">{t('order.statusPendingTitle')}</option>
              <option value="Pickup">{t('order.statusPickupTitle')}</option>
              <option value="Delivering">{t('order.statusDeliveringTitle')}</option>
              <option value="Completed">{t('order.statusCompletedTitle')}</option>
              <option value="Cancelled">{t('order.statusCancelledTitle')}</option>
            </select>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              {t('order.paymentTitle')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register("paymentStatus")}
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white outline-none focus:border-[#870d4c] focus:ring-1 focus:ring-[#870d4c]/30 transition-all shadow-sm"
            >
              <option value="Paid">{t('order.paidTitle')}</option>
              <option value="Unpaid">{t('order.unpaidTitle')}</option>
            </select>
            {errors.paymentStatus && <p className="text-red-500 text-xs mt-1">{errors.paymentStatus.message}</p>}
          </div>
        </div>
      </div>

      <div className="bg-[#fcfafb] border border-slate-100 p-4 rounded-xl space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
          {t('order.customerAndDeliveryInfo')}
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              {t('order.phoneTitle')} <span className="text-red-500">*</span>
            </label>
            <div 
              className={`flex items-center w-full bg-[#fcfafb] border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#870d4c]/30 focus-within:bg-white transition-all ${
                errors.customerPhone ? 'border-red-500' : 'border-slate-200'
              }`}
            >
              <div className="pl-3.5 pr-2 py-2.5 text-slate-600 text-sm font-semibold select-none flex items-center bg-[#fcfafb] border-r border-slate-200 h-full">
                +855 <span className="text-slate-300 ml-1.5 text-xs">|</span>
              </div>
              <input
                type="tel"
                placeholder="12 345 678"
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-slate-800 outline-none"
                {...register("customerPhone", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                  }
                })}
              />
            </div>
            {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              {t('order.deliveryFeeTitle')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                {...register("deliveryFee")}
                className={`w-full pl-8 pr-3 py-2.5 text-sm bg-[#fcfafb] border rounded-lg outline-none focus:ring-2 focus:ring-[#870d4c]/30 focus:bg-white transition-all ${errors.deliveryFee ? 'border-red-500' : 'border-slate-200'}`}
              />
            </div>
            {errors.deliveryFee && <p className="text-red-500 text-xs mt-1">{errors.deliveryFee.message}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">
            {t('order.addressTitle')} <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="2"
            {...register("customerAddress")}
            className={`w-full px-3 py-2.5 text-sm bg-[#fcfafb] border rounded-lg outline-none resize-none focus:ring-2 focus:ring-[#870d4c]/30 focus:bg-white transition-all ${errors.customerAddress ? 'border-red-500' : 'border-slate-200'}`}
          />
          {errors.customerAddress && <p className="text-red-500 text-xs mt-1">{errors.customerAddress.message}</p>}
        </div>
      </div>

      <div className="bg-[#fcfafb] border border-slate-100 p-4 rounded-xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            {t('order.itemsTitle')} <span className="text-red-500">*</span>
          </h3>
          <span className="text-xs bg-slate-200/50 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {t('order.totalItems', { count: fields.length })}
          </span>
        </div>
        <div className="space-y-3">
          {fields.map((field, index) => {
            const currentItem = watchItems[index] || {};
            return (
              <div key={field.id} className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-slate-100">
                <div className="flex-1 w-full">
                  <Controller
                    control={control}
                    name={`items.${index}.productId`}
                    render={({ field: { value, onChange } }) => (
                      <SearchableProductSelect
                        value={value}
                        onChange={(productId) => {
                          onChange(productId);
                          const selectedProduct = products.find((p) => Number(p.id) === Number(productId));
                          setValue(`items.${index}.price`, selectedProduct ? Number(selectedProduct.salePrice || selectedProduct.price || 0) : 0);
                        }}
                        products={products}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" {...register(`items.${index}.quantity`)} className="w-16 p-2 text-sm border rounded-lg text-center" />
                  <div className="w-20 text-sm font-bold">${Number(currentItem.price || 0).toFixed(2)}</div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title={t('common.delete')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => append({ productId: "", quantity: 1, price: 0, salePrice: 0 })}
          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm font-semibold text-slate-500 hover:border-[#870d4c] hover:text-[#9d1159] hover:bg-blue-50/50 transition-colors"
        >
          <Plus size={16} /> {t('order.addProduct')}
        </button>
      </div>

      <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{t('order.subtotalAmount')}</span>
          <span className="font-semibold">${calcSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{t('order.deliveryFeeAmount')}</span>
          <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
          <span className="text-sm font-bold text-white">{t('order.grandTotalAmount')}</span>
          <span className="text-lg font-black text-[#870d4c]">${calcTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-slate-600 bg-[#fcfafb] hover:bg-slate-200 rounded-lg transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-semibold text-white bg-[#9d1159] hover:bg-[#9d1159] rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? t('common.saving') : t('order.updateOrderBtn')}
        </button>
      </div>
    </form>
  );
}
