import React, { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackageOpen, X, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { saleFormSchema } from "../schemas/saleFormSchema";

import OrderCartTable from "../../Order/components/OrderCartTable";
import OrderFormFields from "../../Order/components/OrderFormFields";
import OrderSummaryBox from "../../Order/components/OrderSummaryBox";

import ProductSelectCard from "../components/ProductSelectCard";

import PageHeader from "../../../components/common/PageHeader";
import SearchBar from "../../../components/common/SearchBar";
import FilterBar from "../../../components/common/FilterBar";
import DataCardSkeletonGrid from "../../../components/common/DataCardSkeleton";

import useSalesForm from "../hooks/useSalesForm";
import Swal from "sweetalert2";

export default function AdminSaleForm() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const {
    search,
    setSearch,
    filters,
    handleFilterChange,
    filterOptions,
    filterProducts,
    cart,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleCheckout,
    subtotal,
    INITIAL_CUSTOMER,
    isLoading,
  } = useSalesForm();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  


  const loadMoreRef = useRef(null);
  const productContainerRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(saleFormSchema),
    defaultValues: INITIAL_CUSTOMER,
  });

  const deliveryFee = watch("deliveryFee");

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  useEffect(() => {
    setVisibleCount(10);
  }, [search, filters]);

  const visibleProducts = filterProducts.slice(0, visibleCount);

  const hasMoreProducts = visibleCount < filterProducts.length;

  useEffect(() => {
    if (!hasMoreProducts || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreProducts) {
          setVisibleCount((prev) => Math.min(prev + 8, filterProducts.length));
        }
      },
      {
        root: productContainerRef.current,
        rootMargin: "200px",
        threshold: 0,
      },
    );

    const currentRef = loadMoreRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }

      observer.disconnect();
    };
  }, [hasMoreProducts, isLoading, filterProducts.length]);

  const onCheckout = async (data) => {
    const result = await handleCheckout({
      customerInfo: data,
    });
    if (!result) {
      return;
    }
    const orderData = result;
    const printConfirm = await Swal.fire({
      icon: "question",
      title: "បោះពុម្ពវិក្កយបត្រ?",
      text: "តើអ្នកចង់បោះពុម្ពវិក្កយបត្រដែរឬទេ?",
      showCancelButton: true,
      confirmButtonText: "🖨️ បោះពុម្ពវិក្កយបត្រ",
      cancelButtonText: "រំលង",
      confirmButtonColor: "#7f1d1d",
      cancelButtonColor: "#64748b",
    });

    if (printConfirm.isConfirmed) {
      reset();
      setIsCartOpen(false);
      
      const receiptNo = orderData.orderNo || orderData.orderNumber || orderData.id;
      navigate(`/admin/print-receipt/${receiptNo}`, { state: { orderData } });
      return;
    }

    reset();
    setIsCartOpen(false);
  };

  return (
    <div className="flex flex-col lg:h-[calc(100vh-8rem)] gap-4 h-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between flex-shrink-0 gap-4">
        <PageHeader
          title={t("sales.title")}
          description={t("sales.description")}
        />

        <div className="w-full lg:w-[70%] flex flex-row items-center gap-2 lg:gap-3 lg:justify-end bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex-1 min-w-0">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("sales.searchProduct")}
              className="w-full"
            />
          </div>

          <div className="flex-shrink-0">
            <FilterBar
              filters={filterOptions}
              values={filters}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-7 flex flex-col min-h-0 pb-24 lg:pb-0">
          {isLoading ? (
            <div className="flex-1 grid grid-cols-2 xl:grid-cols-3 gap-4 lg:overflow-y-auto pr-2 content-start auto-rows-max lg:will-change-scroll lg:overscroll-contain transform-gpu">
              <DataCardSkeletonGrid count={6} />
            </div>
          ) : filterProducts.length > 0 ? (
            <div
              ref={productContainerRef}
              className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-2 lg:overflow-y-auto pr-2 content-start auto-rows-max lg:will-change-scroll lg:overscroll-contain transform-gpu"
            >
              {visibleProducts.map((p) => (
                <ProductSelectCard
                  key={p.id}
                  product={p}
                  onSelect={handleAddToCart}
                />
              ))}

              {hasMoreProducts && (
                <div
                  ref={loadMoreRef}
                  className="col-span-2 xl:col-span-4 flex justify-center items-center py-5"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-[#9d1159] rounded-full animate-spin" />
                    {t("common.loading")}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed h-full min-h-[300px] py-8">
              <PackageOpen
                size={64}
                className="mb-4 text-slate-300"
                strokeWidth={1.5}
              />

              <h3 className="text-lg font-medium text-slate-600 mb-1">
                {t("sales.noProductFound")}
              </h3>

              <p className="text-sm">{t("sales.changeSearchOrFilter")}</p>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onCheckout)}
          className={`
            fixed inset-0 z-50 bg-[#fcfafb] flex flex-col p-4 pb-6 overflow-y-auto transition-transform duration-300
            ${isCartOpen ? "translate-y-0" : "translate-y-full"}
            lg:static lg:translate-y-0 lg:z-auto lg:p-0 lg:pb-0 lg:bg-transparent lg:col-span-5 lg:flex lg:flex-col lg:gap-4 lg:overflow-y-auto lg:will-change-scroll lg:overscroll-contain transform-gpu
          `}
        >
          <div className="lg:hidden flex items-center justify-between mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10 flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart size={20} className="text-[#870d4c]" />

              {t("sales.reviewOrder")}
            </h2>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="h-64 flex-shrink-0">
            <OrderCartTable
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <OrderFormFields
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />

          <OrderSummaryBox
            subtotal={subtotal}
            delivery={watch("deliveryFee")}
            disabled={cart.length === 0 || isSubmitting}
          />
        </form>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 z-40">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="w-full bg-[#9d1159] hover:bg-[#9d1159] active:bg-[#44092e] text-white rounded-3xl py-3 px-4 font-bold flex items-center justify-between transition-colors shadow-md"
        >
          <span className="bg-white/25 text-white px-2.5 py-0.5 rounded-lg text-sm">
            {cart.length} {t("sales.items")}
          </span>

          <span className="text-lg font-semibold">
            {t("sales.reviewOrder")}
          </span>

          <span className="text-lg">${subtotal.toFixed(2)}</span>
        </button>
      </div>


    </div>
  );
}
