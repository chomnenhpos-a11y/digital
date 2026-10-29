import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  extractShopCodeFromPath,
  isShopRoute,
  isWellFormedStaffReff,
  REFERRAL_RAW_KEY,
  REFERRAL_SHOP_KEY,
  REFERRAL_STORAGE_KEY,
  clearStaffReferral,
} from "../utils/staffReferral";

/**
 * Custom hook that monitors route transitions and ensures staff_reff
 * query parameters are captured, preserved, and restored across shop routes.
 *
 * Attribution rules (see `setting.md`):
 * - The shared link follows the strict format `{shop_code}?staff_reff={staff_reff}`
 *   where staff_reff is the Base64 `staff_{id}` token (e.g. "c3RhZmZfOTM").
 * - A referral in the URL is only captured when it is a well-formed token;
 *   anything else clears any previous attribution.
 * - A captured referral is scoped to the shop it was validated on; it is
 *   restored back into the URL (after a user clears it) ONLY while the
 *   customer keeps shopping on that same shop, so the order keeps its
 *   original sell-by attribution.
 * - A referral captured on another shop is never applied to a different shop.
 */
export function useStaffReferral() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only manage referral query persistence on customer-facing shop routes
    if (!isShopRoute(location.pathname)) {
      return;
    }

    // The shop code is the first URL segment (e.g. /KAM-844e79/products/1)
    const shopCode = extractShopCodeFromPath(location.pathname);

    try {
      const searchParams = new URLSearchParams(location.search);

      if (searchParams.has("staff_reff")) {
        const staffReff = searchParams.get("staff_reff");

        if (isWellFormedStaffReff(staffReff)) {
          sessionStorage.setItem(REFERRAL_RAW_KEY, staffReff);
          sessionStorage.setItem(
            REFERRAL_STORAGE_KEY,
            String(extractStaffId(staffReff)),
          );
          if (shopCode) {
            sessionStorage.setItem(REFERRAL_SHOP_KEY, shopCode);
          }
        } else {
          // Invalid or non-token referral in URL clears any previous
          // attribution: the staff code did not match the shared format.
          clearStaffReferral();
        }
      } else {
        // Query param is absent from URL: restore a referral previously
        // captured AND validated for THIS shop, so the attribution survives
        // the user clearing the URL parameter while still ordering.
        const savedRaw = sessionStorage.getItem(REFERRAL_RAW_KEY);
        const savedId = sessionStorage.getItem(REFERRAL_STORAGE_KEY);
        const savedShop = sessionStorage.getItem(REFERRAL_SHOP_KEY);

        if (
          savedRaw &&
          savedId &&
          savedShop &&
          shopCode &&
          savedShop === shopCode &&
          isWellFormedStaffReff(savedRaw)
        ) {
          searchParams.set("staff_reff", savedRaw);
          navigate(
            {
              pathname: location.pathname,
              search: `?${searchParams.toString()}`,
            },
            { replace: true }
          );
        }
      }
    } catch (err) {
      console.warn("Could not sync staff referral:", err);
    }
  }, [location.pathname, location.search, navigate]);
}

export default useStaffReferral;

