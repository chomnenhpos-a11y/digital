import { useEffect } from "react";

export function useDynamicShopBranding(shopCode, settings) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.updateShopBranding && shopCode && settings) {
      window.updateShopBranding(shopCode, settings);
    }
  }, [shopCode, settings]);
}

export default useDynamicShopBranding;
