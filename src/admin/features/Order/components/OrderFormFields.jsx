import React from "react";

import { useDeliveryProvidersQuery } from "../../../../queries/deliveryProviders/useDeliveryProviderQueries";

import { useTranslation } from "react-i18next";

export default function OrderFormFields({
  register,
  errors,
  setValue,
  watch,
}) {
  const { t } = useTranslation();
  const { data: providers = [] } = useDeliveryProvidersQuery();
  const activeProviders = providers.filter((p) => p.is_active == 1);
  const selectedProviderId = watch
    ? watch("deliveryProviderId")
    : null;

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
            +855{" "}
            <span className="text-slate-300 ml-1.5 text-xs">|</span>
          </div>

          <input
            type="tel"
            placeholder="12 345 678"
            className="flex-1 px-3 py-2 bg-transparent text-sm text-slate-800 focus:outline-hidden"
            {...register("phone", {
              onChange: (e) => {
                const degitsOnly = 
                  e.target.value.replace(/\D/g, "");
                if (degitsOnly.length <= 10) {
                  e.target.value = degitsOnly;
                }
              },
            })}
            maxLength={10}
          />
        </div>

        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">
            {errors.phone.message}
          </p>
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
            {errors.address.message}
          </p>
        )}
      </div>

      {/* Delivery Provider Cards Grid */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">
          {t("order.deliveryProviderLabel")}
        </label>

        <input
          type="hidden"
          {...register("deliveryProviderId")}
        />

        <div className="flex sm:grid-cols-3 gap-1">
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

                  setValue(
                    "deliveryProviderId",
                    p.id.toString(),
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    }
                  );

                  setValue(
                    "deliveryFee",
                    Number(p.shipping_fee),
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    }
                  );
                }}
                className={`relative flex flex-col items-center justify-center rounded-xl border-[2px] cursor-pointer transition-all text-center p-2 min-h-[90px] ${
                  isSelected
                    ? "border-red-600 bg-red-50 ring-1 ring-red-600 shadow-sm"
                    : "border-slate-200 bg-white hover:border-red-300 hover:bg-slate-50 hover:shadow-xs"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-red-600 text-white p-0.5 rounded-full shadow-sm">
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
                    isSelected
                      ? "border-red-200"
                      : "border-slate-100"
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
                    isSelected
                      ? "text-red-700"
                      : "text-slate-500"
                  }`}
                >
                  ${parseFloat(p.shipping_fee).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {errors.deliveryProviderId && (
          <p className="text-red-500 text-xs mt-1">
            {errors.deliveryProviderId.message}
          </p>
        )}
      </div>
    </div>
  );
}
