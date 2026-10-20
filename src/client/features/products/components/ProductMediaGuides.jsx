import { useId } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PRODUCT_MEDIA_PLATFORMS } from "../../../../config/productMediaPlatforms.js";
import { getProductMediaUrl, normalizeProductMedia } from "../../../../utils/productMedia.js";

export default function ProductMediaGuides({ media }) {
  const { t } = useTranslation();
  const headingId = useId();
  const fallback = PRODUCT_MEDIA_PLATFORMS.find((platform) => platform.value === "website");
  const links = normalizeProductMedia(media).flatMap((entry) => {
    const url = getProductMediaUrl(entry.url);
    if (!url) return [];
    const platform = PRODUCT_MEDIA_PLATFORMS.find((option) => option.value === entry.icon) || fallback;
    return [{ url, platform }];
  });

  if (!links.length) return null;

return (
  <section
    aria-labelledby={headingId}
    className="min-w-0 space-y-2 border-t border-slate-100 pt-3"
  >
    <div>
      <h1
        id={headingId}
        className="text-sm font-bold text-slate-900"
      >
        {t("product.mediaGuidesTitle")}
      </h1>

      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        {t("product.mediaGuidesDescription")}
      </p>
    </div>

    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      {links.map(({ url, platform }, index) => {
        const Icon = platform.icon;
        const label =
          platform.value === "website"
            ? t("products.openMediaLink")
            : t("products.watchMedia", {
                platform: t(platform.labelKey),
              });

        return (
          <a
            key={`${url}-${index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 transition-colors hover:border-[#9d1159]/30 hover:bg-[#9d1159]/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d1159] sm:gap-3 sm:p-3"
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md sm:h-8 sm:w-8"
              style={{
                color: platform.color,
                backgroundColor: `${platform.color}12`,
              }}
            >
              <Icon size={16} aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block break-words text-[10px] md:text-xs font-semibold leading-5 text-slate-900">
                {label}
              </span>

              <span className="md:mt-0.5 block break-words text-[8px] md:text-[11px] leading-4 text-slate-500">
                {t("product.mediaGuideDetails")}
              </span>
            </span>

            <ExternalLink
              size={14}
              className="hidden shrink-0 text-slate-400 transition-colors group-hover:text-[#9d1159] sm:block"
              aria-hidden="true"
            />
          </a>
        );
      })}
    </div>
  </section>
);
}
