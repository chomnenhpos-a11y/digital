import { useEffect } from "react";

/**
 * Dynamically updates browser tab icon and title based on shop code and settings.
 * Ensures routes like /print/receipt/:id and /print/sticker/:id reflect the active shop branding.
 *
 * @param {string|null|undefined} shopCode
 * @param {object|null|undefined} settings
 */
export function useDynamicShopBranding(shopCode, settings) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.updateShopBranding && shopCode) {
      window.updateShopBranding(shopCode, settings);
    }
  }, [shopCode, settings]);
}

export default useDynamicShopBranding;
