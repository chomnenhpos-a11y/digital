import React from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { Popover } from "@base-ui/react/popover";
import { Tooltip } from "@base-ui/react/tooltip";
import { PRODUCT_MEDIA_PLATFORMS } from "../../../../config/productMediaPlatforms.js";
import { getProductMediaUrl, normalizeProductMedia } from "../../../../utils/productMedia.js";

export default function ProductMediaIcons({ media }) {
  const { t } = useTranslation();
  const fallback = PRODUCT_MEDIA_PLATFORMS.find((platform) => platform.value === "website");
  const links = normalizeProductMedia(media).flatMap((entry) => {
    const url = getProductMediaUrl(entry.url);
    if (!url) return [];
    const platform = PRODUCT_MEDIA_PLATFORMS.find((option) => option.value === entry.icon) || fallback;
    return [{
      ...entry,
      url,
      platform,
      label: platform.value === "website"
        ? t("products.openMediaLink")
        : t("products.watchMedia", { platform: t(platform.labelKey) }),
    }];
  });

  if (!links.length) return null;

  const remaining = links.slice(2);

  return (
    <Tooltip.Provider delay={200}>
      <div className="flex items-center gap-2" role="group" aria-label={t("products.mediaLinks")}>
        {links.slice(0, 2).map((link, index) => {
          const Icon = link.platform.displayIcon || link.platform.icon;
          return (
            <Tooltip.Root key={`${link.url}-${index}`}>
              <Tooltip.Trigger
                render={<a href={link.url} target="_blank" rel="noopener noreferrer" />}
                aria-label={link.label}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white shadow-sm ring-1 ring-inset ring-black/5 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d1159]"
                style={{ backgroundColor: link.platform.color }}
              >
                <Icon size={18} aria-hidden="true" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="top" sideOffset={8} collisionPadding={8} className="z-[60]">
                  <Tooltip.Popup role="tooltip" className="rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
                    {link.label}
                    <Tooltip.Arrow className="size-2 rotate-45 bg-slate-800 data-[side=top]:-bottom-1 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1" />
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}

        {remaining.length > 0 && (
          <Popover.Root>
            <Popover.Trigger
              aria-label={t("products.showMoreMedia", { count: remaining.length })}
              className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-[#9d1159]/30 hover:bg-[#9d1159]/5 hover:text-[#9d1159] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d1159]"
            >
              +{remaining.length}
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner side="bottom" align="start" sideOffset={8} collisionPadding={12} className="z-50">
                <Popover.Popup className="max-h-80 w-64 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl outline-none">
                  <Popover.Title className="px-2 pb-2 pt-1 text-xs font-semibold text-slate-500">
                    {t("products.moreMediaLinks")}
                  </Popover.Title>
                  {remaining.map((link, index) => {
                    const Icon = link.platform.displayIcon || link.platform.icon;
                    return (
                      <a
                        key={`${link.url}-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-2 text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#9d1159]/30"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ color: link.platform.color, backgroundColor: `${link.platform.color}12` }}>
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold">{t(link.platform.labelKey)}</span>
                          <span className="block truncate text-[11px] text-slate-400">{link.url.replace(/^https?:\/\/(www\.)?/, "")}</span>
                        </span>
                        <ExternalLink size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
                      </a>
                    );
                  })}
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        )}
      </div>
    </Tooltip.Provider>
  );
}
