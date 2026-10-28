import { useEffect } from "react";

/**
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
