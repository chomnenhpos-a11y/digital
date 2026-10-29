import { useEffect } from "react";

/**
 * Syncs shop branding with window.updateShopBranding
 *
 * @param {string|null|undefined} shopCode
 * @param {object|null|undefined} settings
 */
export function useDynamicShopBranding(shopCode, settings) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.updateShopBranding && shopCode && settings) {
      window.updateShopBranding(shopCode, settings);
    }
  }, [shopCode, settings]);
}

export default useDynamicShopBranding;
