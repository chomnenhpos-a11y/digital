import React, { useId } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ExternalLink, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import Select from "react-select";
import { getProductMediaUrl } from "../../../../utils/productMedia.js";
import { PRODUCT_MEDIA_PLATFORMS } from "../../../../config/productMediaPlatforms.js";

const rowClass = "grid grid-cols-[minmax(0,1fr)_36px_36px] items-start gap-2 sm:grid-cols-[150px_minmax(0,1fr)_36px_36px]";
const actionClass = "flex h-10 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d1159]";

export default function ProductMediaLinks({ control, register, errors }) {
  const { t } = useTranslation();
  const sectionId = useId();
  const { fields, append, remove } = useFieldArray({ control, name: "media" });
  const media = useWatch({ control, name: "media" });
  const options = PRODUCT_MEDIA_PLATFORMS.map((platform) => ({ ...platform, label: t(platform.labelKey) }));

  return (
    <section aria-labelledby={`${sectionId}-title`} className="min-w-0 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <LinkIcon size={16} className="shrink-0 text-[#9d1159]" aria-hidden="true" />
            <h4 id={`${sectionId}-title`} className="text-sm font-semibold text-slate-800">{t("products.mediaLinks")}</h4>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{t("products.mediaOptional")}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{t("products.mediaDescription")}</p>
        </div>
        <button
          type="button"
          onClick={() => append({ icon: "facebook", url: "" }, { focusName: `media.${fields.length}.url` })}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-[#9d1159]/30 bg-white px-2.5 text-xs font-semibold text-[#9d1159] transition-colors hover:border-[#9d1159]/60 hover:bg-[#9d1159]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d1159]"
        >
          <Plus size={14} aria-hidden="true" />
          {t("products.addMediaLink")}
        </button>
      </div>

      <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        {fields.length > 0 ? (
          <>
            <div className={`${rowClass} mb-2 hidden text-[11px] font-semibold text-slate-500 sm:grid`} aria-hidden="true">
              <span>{t("products.mediaPlatform")}</span>
              <span>{t("products.mediaUrl")}</span>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => {
                const current = media?.[index];
                const platform = options.find((option) => option.value === current?.icon);
                const safeUrl = getProductMediaUrl(current?.url);
                const rowErrors = errors.media?.[index];
                const rowId = `${sectionId}-${field.id}`;

                return (
                  <div key={field.id} className={rowClass}>
                    <div className="col-span-3 min-w-0 sm:col-span-1">
                      <label htmlFor={`${rowId}-platform`} className="sr-only">{t("products.mediaPlatform")} {index + 1}</label>
                      <Controller
                        name={`media.${index}.icon`}
                        control={control}
                        render={({ field: selectField }) => (
                          <Select
                            inputId={`${rowId}-platform`}
                            instanceId={`${rowId}-select`}
                            name={selectField.name}
                            ref={selectField.ref}
                            value={options.find((option) => option.value === selectField.value)
                              || (selectField.value ? { ...options[7], value: selectField.value, label: selectField.value } : null)}
                            onChange={(option) => selectField.onChange(option?.value || "")}
                            onBlur={selectField.onBlur}
                            options={options}
                            isSearchable={false}
                            placeholder={t("products.mediaPlatform")}
                            aria-invalid={!!rowErrors?.icon}
                            aria-describedby={rowErrors?.icon ? `${rowId}-icon-error` : undefined}
                            menuPortalTarget={typeof document === "undefined" ? null : document.body}
                            menuPosition="fixed"
                            menuPlacement="auto"
                            menuShouldScrollIntoView={false}
                            styles={{
                              control: (base, state) => ({
                                ...base, minHeight: 40, borderRadius: 8,
                                borderColor: rowErrors?.icon ? "#ef4444" : state.isFocused ? "#9d1159" : "#e2e8f0",
                                boxShadow: state.isFocused ? "0 0 0 2px #9d115915" : "none",
                                cursor: "pointer", fontSize: 12,
                                "&:hover": { borderColor: "#9d1159" },
                              }),
                              valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
                              singleValue: (base) => ({ ...base, maxWidth: "100%" }),
                              dropdownIndicator: (base) => ({ ...base, padding: 6 }),
                              indicatorSeparator: () => ({ display: "none" }),
                              menuPortal: (base) => ({ ...base, zIndex: 60 }),
                              menu: (base) => ({ ...base, minWidth: 190, borderRadius: 10, overflow: "hidden" }),
                              option: (base, state) => ({
                                ...base, padding: "9px 12px", fontSize: 13,
                                color: "#334155", cursor: "pointer",
                                backgroundColor: state.isSelected ? "#fdf2f8" : state.isFocused ? "#f8fafc" : "#ffffff",
                              }),
                            }}
                            formatOptionLabel={(option) => {
                              const Icon = option.icon;
                              return (
                                <span className="flex min-w-0 items-center gap-2">
                                  <Icon size={16} style={{ color: option.color }} className="shrink-0" aria-hidden="true" />
                                  <span className="truncate">{option.label}</span>
                                </span>
                              );
                            }}
                          />
                        )}
                      />
                      {rowErrors?.icon && <p id={`${rowId}-icon-error`} className="mt-1 text-xs text-red-500">{t(rowErrors.icon.message)}</p>}
                    </div>

                    <div className="min-w-0">
                      <label htmlFor={`${rowId}-url`} className="sr-only">{t("products.mediaUrl")} {index + 1}</label>
                      <input
                        id={`${rowId}-url`}
                        type="url"
                        inputMode="url"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder={platform?.placeholder || "https://example.com/..."}
                        {...register(`media.${index}.url`)}
                        aria-invalid={!!rowErrors?.url}
                        aria-describedby={rowErrors?.url ? `${rowId}-url-error` : `${sectionId}-hint`}
                        className={`h-10 w-full min-w-0 rounded-lg border bg-white px-3 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#9d1159] focus:ring-2 focus:ring-[#9d1159]/10 ${rowErrors?.url ? "border-red-400" : "border-slate-200"}`}
                      />
                      {rowErrors?.url && <p id={`${rowId}-url-error`} className="mt-1 text-xs text-red-500">{t(rowErrors.url.message)}</p>}
                    </div>

                    {safeUrl ? (
                      <a href={safeUrl} target="_blank" rel="noopener noreferrer" className={`${actionClass} text-slate-500 hover:border-slate-300 hover:text-[#9d1159]`} aria-label={`${t("products.openMediaLink")} ${index + 1}`} title={t("products.openMediaLink")}>
                        <ExternalLink size={15} aria-hidden="true" />
                      </a>
                    ) : (
                      <button type="button" disabled className={`${actionClass} cursor-not-allowed text-slate-300`} aria-label={`${t("products.openMediaLink")} ${index + 1}`}>
                        <ExternalLink size={15} aria-hidden="true" />
                      </button>
                    )}
                    <button type="button" onClick={() => remove(index)} className={`${actionClass} text-rose-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600`} aria-label={`${t("products.removeMediaLink")} ${index + 1}`} title={t("products.removeMediaLink")}>
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="py-3 text-center text-xs text-slate-400">{t("products.mediaEmpty")}</p>
        )}
        <p id={`${sectionId}-hint`} className="mt-3 text-[11px] text-slate-500">{t("products.mediaHint")}</p>
      </div>
    </section>
  );
}
