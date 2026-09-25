import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import zone from "zod";

import { useDeliveryProvidersQuery } from "../../../../queries/deliveryProviders/useDeliveryProviderQueries";

export default function DeliveryForm({
  phone,
  setPhone,
  address,
  setAddress,
  deliveryMethod,
  setDeliveryMethod,
  setSettingId,
  setDeliveryProviderId,
  setChatId,
  setDeliveryFee,
  onDeliveryClear,
  errors = {},
}) {
  const { shop_code } = useParams();
  const { t } = useTranslation();

  const {
    data: providers = [],
    isLoading,
    isError,
  } = useDeliveryProvidersQuery({
    shop_code,
  });

  const deliveryOptions = providers
    .filter((p) => p.is_active == 1)
    .map((p) => ({
      id: Number(p.id),
      name: p.name,
      fee: parseFloat(p.shipping_fee ?? p.shippingFee) || 0,
      logo: p.logo,
      setting_id: p.setting_id ?? p.settingId,
      chat_id: p.chat_id ?? p.setting?.chat_id ?? null,
    }));

  const handleDeliveryChange = (option) => {
    const providerId = Number(option.id);
    const selectedSettingId = Number(option.setting_id);
    setDeliveryMethod(providerId);

    if (setDeliveryProviderId) {
      setDeliveryProviderId(providerId);
    }

    if (setSettingId) {
      setSettingId(Number.isNaN(selectedSettingId) ? null : selectedSettingId);
    }

    if (setChatId) {
      setChatId(option.chat_id ?? null);
    }

    if (setDeliveryFee) {
      setDeliveryFee(option.fee);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <h3 className="font-semibold text-slate-900">
        {t("cart.deliveryInfoTitle")}
      </h3>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {t("cart.phoneLabel")}
        </label>

        <div
          className={`flex items-center w-full bg-slate-50 border rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-400 transition ${
            errors.phone ? "border-red-500" : "border-slate-200"
          }`}
        >
          <div className="pl-3 pr-2 py-2 text-slate-600 text-sm font-semibold select-none flex items-center bg-slate-100 border-r border-slate-200 h-full">
            +855
            <span className="text-slate-300 ml-1.5 text-xs">|</span>
          </div>

          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "");

              if (digitsOnly.length <= 10) {
                setPhone(digitsOnly);
              }
            }}
            placeholder="12 345 678"
            maxLength={10}
            className="flex-1 px-3 py-2 bg-transparent text-sm outline-none"
          />
        </div>

        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{t(errors.phone)}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {t("cart.addressLabel")}
        </label>

        <textarea
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t("cart.addressPlaceholder")}
          rows={2}
          className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none resize-none focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 transition ${
            errors.address ? "border-red-500" : "border-slate-200"
          }`}
        />

        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{t(errors.address)}</p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-slate-600">
            {t("cart.deliveryMethod")}
          </label>

          {errors.deliveryMethod && (
            <span className="text-[10px] text-red-500">
              {t(errors.deliveryMethod)}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-[76px] animate-pulse rounded-xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="text-xs text-red-500">
            {t("cart.cannotFetchDeliveryProvider")}
          </p>
        ) : deliveryOptions.length === 0 ? (
          <p className="text-xs text-slate-500">
            {t("cart.noDeliveryProvider")}
          </p>
        ) : (
          <div className="grid gap-1 grid-cols-5">
            {deliveryOptions.map((option) => {
              const isSelected = Number(deliveryMethod) === Number(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (isSelected) {
                      onDeliveryClear?.();
                    } else {
                      handleDeliveryChange(option);
                    }
                  }}
                  className={`relative flex  min-w-0 flex-col items-center justify-center
              rounded-xl border px-1.5 py-2 text-center transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                isSelected
                  ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                  : errors.deliveryMethod
                    ? "border-red-300 bg-white text-slate-700 hover:bg-red-50"
                    : "border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:bg-slate-50"
              }`}
                >
                  {isSelected && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600" />
                  )}

                  {option.logo && (
                    <img
                      src={option.logo}
                      alt=""
                      className="mb-1 h-8 w-8 rounded-md object-contain"
                    />
                  )}

                  <span 
                  title={option.name}
                  className="w-full truncate text-[11px] font-medium leading-tight">
                    {option.name?.slice(0, 6)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
