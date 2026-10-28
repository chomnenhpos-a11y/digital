import { useId, useState } from "react";
import { ExternalLink, Play, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PRODUCT_MEDIA_PLATFORMS } from "../../../../config/productMediaPlatforms.js";
import {
  getProductMediaUrl,
  normalizeProductMedia,
} from "../../../../utils/productMedia.js";
import { getProductMediaEmbed } from "../../../../utils/productMediaEmbed.js";
import ProductVideoModal from "./ProductVideoModal";

export default function ProductMediaGuides({ media }) {
  const { t } = useTranslation();
  const headingId = useId();
  const [activeVideo, setActiveVideo] = useState(null);

  const fallback = PRODUCT_MEDIA_PLATFORMS.find(
    (platform) => platform.value === "website",
  );

  const links = normalizeProductMedia(media).flatMap((entry) => {
    const url = getProductMediaUrl(entry.url);
    if (!url) return [];

    const platform =
      PRODUCT_MEDIA_PLATFORMS.find(
        (option) => option.value === entry.icon,
      ) || fallback;

    if (!platform) return [];

    return [{ url, platform }];
  });

  if (!links.length) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 space-y-2 border-t border-slate-100 pt-3"
    >
      <div className="flex items-center gap-1.5">
        <Video size={14} className="text-[#9d1159]" />
        <h2 id={headingId} className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {t("product.mediaGuidesTitle")}
        </h2>
      </div>

      {/* Single Row of Media Frames */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none sm:gap-3">
        {links.map(({ url, platform }, index) => {
          const Icon = platform.icon;
          const isFacebook = platform.value === "facebook";
          // Facebook opens externally directly; other supported platforms resolve an embed iframe
          const embed = isFacebook ? null : getProductMediaEmbed(url, platform.value);
          const isVideo = isFacebook || Boolean(embed);
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
              title={label}
              aria-label={label}
              onClick={(event) => {
                if (isFacebook) {
                  // Facebook auto-opens external link in new tab, does not display modal
                  return;
                }

                if (embed) {
                  event.preventDefault();
                  setActiveVideo({
                    ...embed,
                    platform,
                    originalUrl: url,
                  });
                }
              }}
              className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:scale-105 hover:border-[#9d1159]/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d1159] sm:h-14 sm:w-14"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors sm:h-9 sm:w-9"
                style={{
                  color: platform.color,
                  backgroundColor: `${platform.color}15`,
                }}
              >
                <Icon size={20} className="sm:text-[22px]" aria-hidden="true" />
              </span>

              {/* Video frame play badge indicator so user knows it's a video */}
              {isVideo ? (
                <span
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white shadow-xs ring-2 ring-white transition-transform group-hover:scale-110 sm:h-4.5 sm:w-4.5"
                  aria-hidden="true"
                >
                  <Play size={8} className="fill-white translate-x-[0.5px]" />
                </span>
              ) : (
                <span
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-500 text-white shadow-xs ring-2 ring-white transition-transform group-hover:scale-110 sm:h-4.5 sm:w-4.5"
                  aria-hidden="true"
                >
                  <ExternalLink size={8} />
                </span>
              )}
            </a>
          );
        })}
      </div>

      {/* Draggable & Resizable Video Modal with Fullscreen Support */}
      {activeVideo && (
        <ProductVideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </section>
  );
}
