import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

const SettingsTabs = ({ tabs, activeTab, onChange, errorTabs = new Set() }) => {
  const { t } = useTranslation();
  const tabRefs = useRef([]);

  // Keyboard navigation: arrow keys move focus within tab bar
  const handleKeyDown = (e, index) => {
    let next = index;
    if (e.key === "ArrowRight") {
      next = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = tabs.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    onChange(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={t("settings.generalSettings", "General Settings")}
      className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeTab === index;
        const hasError = errorTabs?.has(index);

        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onChange(index)}
            className={`
        flex min-w-0 items-center justify-center gap-2
        rounded-md px-4 py-1 text-sm font-semibold
        transition-colors
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-inset focus-visible:ring-[#870d4c]
        ${
          isActive
            ? "bg-[#870d4c] text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }
      `}
          >
            <Icon size={18} className="shrink-0" aria-hidden="true" />

            <span className="whitespace-normal leading-relaxed">
              {t(tab.labelKey, tab.labelFallback)}
            </span>

            {hasError && (
              <>
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full bg-red-500"
                />
                <span className="sr-only">
                  {t("settings.tabHasErrors", "This tab contains errors")}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SettingsTabs;
