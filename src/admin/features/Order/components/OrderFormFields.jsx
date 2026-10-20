import React from "react";
import { Check } from "lucide-react";

import { useDeliveryProvidersQuery } from "../../../../queries/deliveryProviders/useDeliveryProviderQueries";

import { useTranslation } from "react-i18next";

const DELIVERY_STATUS_OPTIONS = [
  {
    value: "Pending",
    labelKey: "order.statusPendingTitle",
    selected: "border-amber-700 bg-amber-700 text-white shadow-sm hover:bg-amber-800",
    unselected: "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100",
    focus: "peer-focus-visible:outline-amber-700",
    indicator: "bg-amber-700",
  },
  {
    value: "Pickup",
    labelKey: "order.statusPickupTitle",
    selected: "border-[#9d1159] bg-[#9d1159] text-white shadow-sm hover:bg-[#870d4c]",
    unselected: "border-[#870d4c]/20 bg-[#870d4c]/5 text-[#9d1159] hover:border-[#870d4c]/40 hover:bg-[#870d4c]/10",
    focus: "peer-focus-visible:outline-[#9d1159]",
    indicator: "bg-[#9d1159]",
  },
  {
    value: "Delivering",
    labelKey: "order.statusDeliveringTitle",
    selected: "border-purple-700 bg-purple-700 text-white shadow-sm hover:bg-purple-800",
    unselected: "border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-400 hover:bg-purple-100",
    focus: "peer-focus-visible:outline-purple-700",
    indicator: "bg-purple-700",
  },
  {
    value: "Completed",
    labelKey: "order.statusCompletedTitle",
    selected: "border-emerald-700 bg-emerald-700 text-white shadow-sm hover:bg-emerald-800",
    unselected: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100",
    focus: "peer-focus-visible:outline-emerald-700",
    indicator: "bg-emerald-700",
  },
  {
    value: "Cancelled",
    labelKey: "order.statusCancelledTitle",
    selected: "border-rose-700 bg-rose-700 text-white shadow-sm hover:bg-rose-800",
    unselected: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400 hover:bg-rose-100",
    focus: "peer-focus-visible:outline-rose-700",
    indicator: "bg-rose-700",
  },
];

export default function OrderFormFields({ register, errors, setValue, watch }) {
  const { t } = useTranslation();
  const { data: providers = [] } = useDeliveryProvidersQuery();
  const activeProviders = providers.filter((p) => p.is_active == 1);
  const selectedProviderId = watch ? watch("deliveryProviderId") : null;
  const selectedDeliveryStatus = watch ? watch("status") : null;
  const selectedPaymentStatus = watch ? watch("paymentStatus") : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
        {t("order.customerInfo")}
      </h3>

      {/* Phone Number */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          {t("order.phone")}
        </label>

        <div
          className={`flex items-center w-full bg-[#fcfafb] border rounded-xl overflow-hidden focus-within:border-[#870d4c] focus-within:ring-1 focus-within:ring-[#870d4c]/30 transition-colors ${
            errors.phone ? "border-red-500" : "border-slate-200"
          }`}
        >
          <div className="pl-3.5 pr-2 py-2 text-slate-600 text-sm font-semibold select-none flex items-center bg-[#fcfafb] border-r border-slate-200 h-full">
            +855 <span className="text-slate-300 ml-1.5 text-xs">|</span>
          </div>

          <input
            type="tel"
            placeholder="12 345 678"
            className="flex-1 px-3 py-2 bg-transparent text-sm text-slate-800 focus:outline-hidden"
            {...register("phone", {
              onChange: (e) => {
                const degitsOnly = e.target.value.replace(/\D/g, "");
                if (degitsOnly.length <= 10) {
                  e.target.value = degitsOnly;
                }
              },
            })}
            maxLength={10}
          />
        </div>

        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{t(errors.phone.message)}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          {t("order.addressLabel")}
        </label>

        <textarea
          {...register("address")}
          placeholder={t("order.enterAddress")}
          rows={3}
          className={`w-full px-3.5 py-2 bg-[#fcfafb] border rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-[#870d4c] transition-colors resize-y ${
            errors.address ? "border-red-500" : "border-slate-200"
          }`}
        />

        {errors.address && (
          <p className="text-red-500 text-xs mt-1">
            {t(errors.address.message)}
          </p>
        )}
      </div>

      {/* Delivery Provider Cards Grid */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">
          {t("order.deliveryProviderLabel")}
        </label>

        <input type="hidden" {...register("deliveryProviderId")} />

        <div className="grid grid-cols-5 gap-1">
          {activeProviders.map((p) => {
            const isSelected =
              selectedProviderId != null &&
              selectedProviderId.toString() === p.id.toString();

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (isSelected) {
                    setValue("deliveryProviderId", null, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });

                    setValue("deliveryFee", 0, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });

                    return;
                  }

                  setValue("deliveryProviderId", p.id.toString(), {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });

                  setValue("deliveryFee", Number(p.shipping_fee), {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
                className={`relative min-w-0 flex flex-col items-center justify-center rounded-xl border-[2px] cursor-pointer transition-all text-center p-1.5 min-h-[90px] ${
                  isSelected
                    ? "border-red-600 bg-red-50 ring-1 ring-red-600 shadow-sm"
                    : "border-slate-200 bg-white hover:border-red-300 hover:bg-slate-50 hover:shadow-xs"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-red-600 text-white  rounded-full shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                <div
                  className={`w-11 h-11 flex flex-shrink-0 items-center justify-center bg-white rounded-lg overflow-hidden border shadow-sm mb-1.5 transition-colors ${
                    isSelected ? "border-red-200" : "border-slate-100"
                  }`}
                >
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <span
                  className={`text-[11px] font-semibold tracking-wide ${
                    isSelected ? "text-red-700" : "text-slate-500"
                  }`}
                >
                  {p.name?.slice(0, 6)}
                </span>
              </div>
            );
          })}
        </div>

        {errors.deliveryProviderId && (
          <p className="text-red-500 text-xs mt-1">
            {t(errors.deliveryProviderId.message)}
          </p>
        )}
      </div>
      <fieldset className="min-w-0">
        <legend className="mb-2 text-xs font-semibold text-slate-600">
          {t("order.deliveryStatus")}
        </legend>

        <div className="flex flex-wrap gap-2">
          {DELIVERY_STATUS_OPTIONS.map((option) => {
            const { value, labelKey } = option;
            const isSelected = selectedDeliveryStatus === value;

            return (
              <label
                key={value}
                className="relative min-w-0 max-w-full cursor-pointer"
              >
                <input
                  type="radio"
                  value={value}
                  {...register("status")}
                  aria-invalid={!!errors.status}
                  aria-describedby={
                    errors.status ? "delivery-status-error" : undefined
                  }
                  className="peer sr-only"
                />

                <span
                  className={`relative inline-flex md:min-h-2 md:min-w-5 max-w-full items-center justify-between rounded-md border px-1.5 md:px-2 py-1 text-center text-[10px] md:text-sm font-semibold transition-colors duration-150 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${option.focus} ${
                    isSelected ? option.selected : option.unselected
                  }`}
                >
                  {isSelected && (
                    <span className={`absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white ring-2 ring-white ${option.indicator}`}>
                      <Check size={10} md:size={12} strokeWidth={3} aria-hidden="true" />
                    </span>
                  )}

                  <span className="min-w-0 break-words">{t(labelKey)}</span>
                </span>
              </label>
            );
          })}
        </div>

        {errors.status && (
          <p id="delivery-status-error" className="mt-1 text-xs text-red-500">
            {t(errors.status.message)}
          </p>
        )}
      </fieldset>
      <fieldset className="min-w-0">
        <legend className="mb-2 text-xs font-semibold text-slate-600">
          {t("common.paymentStatus")}
        </legend>

        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "Unpaid", label: t("order.unpaid") },
            { value: "Paid", label: t("common.paid") },
          ].map(({ value, label }) => {
            const isSelected = selectedPaymentStatus === value;
            const isPaid = value === "Paid";

            return (
              <label key={value} className="relative min-w-0 cursor-pointer">
                <input
                  type="radio"
                  value={value}
                  {...register("paymentStatus")}
                  aria-invalid={!!errors.paymentStatus}
                  aria-describedby={
                    errors.paymentStatus ? "payment-status-error" : undefined
                  }
                  className="peer sr-only"
                />

                <span
                  className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-md border px-3 py-2 text-xs font-semibold text-slate-700 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-600 ${
                    isSelected
                      ? isPaid
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? isPaid
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-orange-500 bg-orange-500 text-white"
                        : "border-slate-400 bg-white"
                    }`}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </span>
                  {label}
                </span>
              </label>
            );
          })}
        </div>

        {errors.paymentStatus && (
          <p id="payment-status-error" className="mt-1 text-xs text-red-500">
            {t(errors.paymentStatus.message)}
          </p>
        )}
      </fieldset>
    </div>
  );
}
