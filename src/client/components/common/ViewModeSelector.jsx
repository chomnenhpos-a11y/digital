import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Monitor, Smartphone, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "client-view-mode";
const EVENT_NAME = "client-view-mode-change";
const MOBILE_VIEWPORT = "width=device-width, initial-scale=1, viewport-fit=cover";

const VIEW_MODES = [
  {
    value: "mobile",
    icon: Smartphone,
    labelKey: "viewMode.mobile",
    descriptionKey: "viewMode.mobileDescription",
  },
  {
    value: "desktop",
    icon: Monitor,
    labelKey: "viewMode.desktop",
    descriptionKey: "viewMode.desktopDescription",
  },
];

function getSavedViewMode(storageKey = STORAGE_KEY) {
  if (typeof window === "undefined") return "mobile";

  const savedMode = localStorage.getItem(storageKey);
  return savedMode === "desktop" || savedMode === "mobile" ? savedMode : "mobile";
}

function applyViewMode(mode, desktopWidth) {
  if (typeof document === "undefined") return;

  let viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    viewportMeta = document.createElement("meta");
    viewportMeta.name = "viewport";
    document.head.appendChild(viewportMeta);
  }

  document.documentElement.dataset.viewMode = mode;
  viewportMeta.setAttribute(
    "content",
    mode === "desktop" ? `width=${desktopWidth}, viewport-fit=cover` : MOBILE_VIEWPORT
  );
}

export default function ViewModeSelector({
  className = "",
  storageKey = STORAGE_KEY,
  eventName = EVENT_NAME,
  desktopWidth = 1180,
  variant = "menu",
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(() => getSavedViewMode(storageKey));
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const menuRef = useRef(null);

  const currentMode = useMemo(
    () => VIEW_MODES.find((item) => item.value === mode) || VIEW_MODES[0],
    [mode]
  );
  const CurrentIcon = currentMode.icon;
  const isDesktopMode = mode === "desktop";

  useEffect(() => {
    const savedMode = getSavedViewMode(storageKey);
    setMode(savedMode);
    applyViewMode(savedMode, desktopWidth);
    window.dispatchEvent(new Event("resize"));
  }, [desktopWidth, storageKey]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!toastOpen) return undefined;

    const toastTimer = window.setTimeout(() => setToastOpen(false), 2400);
    return () => window.clearTimeout(toastTimer);
  }, [toastOpen]);

  const saveMode = (nextMode, remember = true) => {
    setMode(nextMode);
    applyViewMode(nextMode, desktopWidth);

    if (remember) {
      localStorage.setItem(storageKey, nextMode);
    } else {
      localStorage.removeItem(storageKey);
    }

    setMenuOpen(false);
    setToastOpen(true);
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { mode: nextMode },
    }));
    window.dispatchEvent(new Event("resize"));
  };

  if (variant === "toggle") {
    const nextMode = mode === "desktop" ? "mobile" : "desktop";
    const nextModeConfig = VIEW_MODES.find((item) => item.value === nextMode) || VIEW_MODES[0];
    const NextIcon = nextModeConfig.icon;

    return (
      <button
        type="button"
        onClick={() => saveMode(nextMode)}
        className={`relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-red-900 hover:bg-red-50 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 ${className}`}
        ref={menuRef}
        aria-label={t(nextModeConfig.labelKey)}
        title={t(nextModeConfig.labelKey)}
      >
        <NextIcon className="h-5 w-5" aria-hidden="true" />
        <span
          className={`absolute right-1 top-1 h-2 w-2 rounded-full ${
            mode === "desktop" ? "bg-red-800" : "bg-slate-400"
          }`}
        />
      </button>
    );
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className={`group flex items-center justify-center border md:bg-red-50 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 ${
          isDesktopMode
            ? "h-12 w-12 rounded-full border-slate-200 shadow-2xl shadow-slate-900/15"
            : "h-7 gap-2 rounded-md border-slate-300 px-3"
        }`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={t("viewMode.chooseView")}
      >
        <span
          className={`relative flex shrink-0 items-center justify-center rounded-md ${
            isDesktopMode ? "h-9 w-9  text-red-900" : "text-slate-900"
          }`}
        >
          <CurrentIcon className="h-5 w-5" aria-hidden="true" />
          {isDesktopMode && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-800" />
          )}
        </span>
        <span className={isDesktopMode ? "sr-only" : "hidden md:block"}>
          <span className="block text-left text-[11px] font-medium leading-none text-slate-500">
            {t("viewMode.view")}
          </span>
          <span className="block text-left text-sm leading-tight">
            {t(currentMode.labelKey)}
          </span>
        </span>
      </button>

      {menuOpen && (
        <div
          className={`absolute z-[100] overflow-hidden rounded-lg border border-slate-100 bg-white p-2 shadow-2xl ${
            isDesktopMode ? "bottom-full left-0 mb-3 w-72" : "right-0 top-full mt-2 w-60"
          }`}
        >
          <div className="px-2 pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {t("viewMode.displayMode")}
                </p>
                {isDesktopMode && (
                  <p className="text-xs leading-khmer text-slate-500">
                    {t("viewMode.changeAnytime")}
                  </p>
                )}
              </div>
              {isDesktopMode && (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                  {desktopWidth}px
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            {VIEW_MODES.map((item) => {
              const Icon = item.icon;
              const active = item.value === mode;

              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => saveMode(item.value)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 text-left text-sm transition ${
                    active
                      ? "bg-red-50 text-red-900 ring-1 ring-red-100"
                      : "text-slate-800 hover:bg-slate-50"
                  } ${isDesktopMode ? "py-3.5" : "py-3"}`}
                  role="menuitemradio"
                  aria-checked={active}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                      active ? "bg-white text-red-900" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-tight">
                      {t(item.labelKey)}
                    </span>
                    {isDesktopMode && (
                      <span className="block truncate text-xs leading-khmer text-slate-500">
                        {t(item.descriptionKey)}
                      </span>
                    )}
                  </span>
                  {active && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-800 text-white">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {toastOpen && (
        <div className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[95] md:hidden">
          <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 shadow-2xl">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-800 text-white">
              <Check className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex-1">{t("viewMode.choiceSaved")}</span>
            <button
              type="button"
              onClick={() => setToastOpen(false)}
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label={t("common.close")}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
