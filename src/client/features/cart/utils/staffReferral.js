export const REFERRAL_STORAGE_KEY = "staff_reff_sale_by";
export const REFERRAL_RAW_KEY = "staff_reff_raw";
export const REFERRAL_SHOP_KEY = "staff_reff_shop_code";

export const NON_SHOP_PREFIXES = [
  "/login",
  "/signin",
  "/register",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin",
  "/print",
  "/print-receipt",
  "/dashboard",
];

/**
 * Checks whether a given pathname belongs to the customer-facing shop flow
 * (e.g., `/:shop_code` or `/:shop_code/products/:id`).
 *
 * @param {string} pathname
 * @returns {boolean}
 */
export function isShopRoute(pathname) {
  if (!pathname || pathname === "/") return false;
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/") return false;

  const lower = normalized.toLowerCase();
  for (const prefix of NON_SHOP_PREFIXES) {
    if (lower === prefix || lower.startsWith(prefix + "/")) {
      return false;
    }
  }

  return true;
}

/**
 * Extracts only the leading numeric ID from a staff_reff parameter string.
 *
 * Examples:
 * - "93KimSan" -> 93
 * - "78Dara" -> 78
 * - "12" -> 12
 * - "abcKimSan" -> null
 * - null / undefined / "" -> null
 *
 * @param {string | null | undefined} referralParam
 * @returns {number | null} - Extracted positive integer or null
 */
export function extractStaffId(referralParam) {
  if (typeof referralParam !== "string") {
    return null;
  }

  const trimmed = referralParam.trim();
  const match = trimmed.match(/^(\d+)/);
  if (!match) {
    return null;
  }

  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * Checks whether a staff_reff parameter is well-formed.
 *
 * The backend referral format is `{staff_id}{staff_name}` (e.g. "93KimSan"),
 * built by the staff QR-link generator (AdminQRCode) from the backend
 * user record. A well-formed referral therefore requires BOTH:
 *  1. a leading positive numeric staff ID, and
 *  2. a non-empty trailing name/code part.
 *
 * A bare numeric ID alone (e.g. "93") is NOT a valid referral —
 * it must never be captured or attributed without the staff code.
 *
 * @param {string|null|undefined} referralParam
 * @returns {boolean}
 */
export function isWellFormedStaffReff(referralParam) {
  if (typeof referralParam !== "string") {
    return false;
  }

  const trimmed = referralParam.trim();
  if (!trimmed) {
    return false;
  }

  const staffId = extractStaffId(trimmed);
  if (staffId === null) {
    return false;
  }

  // The remaining part after the numeric ID must not be empty,
  // i.e. the value must be more than just the bare numeric ID.
  return trimmed.slice(String(staffId).length).length > 0;
}

/**
 * Normalizes the first URL segment as a shop code (e.g. "/KAM-844e79" -> "KAM-844e79").
 *
 * @param {string} pathname
 * @returns {string} Decoded shop code, or empty string when not determinable
 */
export function extractShopCodeFromPath(pathname) {
  if (typeof pathname !== "string" || !pathname) return "";
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return "";
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Reads staff_reff from the URL or session storage.
 * If present in URL, updates storage. If missing, retrieves from storage.
 *
 * When a shop code is provided, the preserved referral only stays valid for
 * that shop — a referral captured on another shop is never re-applied here,
 * so URL manipulation cannot move an order to a different staff/shop.
 *
 * @param {string} [shopCode] - Current shop code to scope attribution to. Optional
 *   (legacy callers without a shop code keep the old, unscoped behavior).
 * @returns {number | null}
 */
export function getStaffReferralId(shopCode) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);

    if (params.has("staff_reff")) {
      const staffReff = params.get("staff_reff");
      const saleBy = extractStaffId(staffReff);

      if (saleBy !== null && isWellFormedStaffReff(staffReff)) {
        sessionStorage.setItem(REFERRAL_RAW_KEY, staffReff);
        sessionStorage.setItem(REFERRAL_STORAGE_KEY, String(saleBy));
        if (shopCode) {
          sessionStorage.setItem(REFERRAL_SHOP_KEY, shopCode);
        }
        return saleBy;
      } else {
        // Explicit invalid, empty, or bare-numeric referral in URL clears attribution
        clearStaffReferral();
        return null;
      }
    }

    const stored = sessionStorage.getItem(REFERRAL_STORAGE_KEY);
    const storedRaw = sessionStorage.getItem(REFERRAL_RAW_KEY);

    if (stored) {
      // Shop scoping: never apply a referral captured on another shop,
      // and never apply a stored value that is not a well-formed referral.
      if (shopCode) {
        const storedShop = sessionStorage.getItem(REFERRAL_SHOP_KEY);
        if (storedShop && storedShop !== shopCode) {
          return null;
        }
        // Legacy storage without a shop record cannot be trusted for this shop
        if (!storedShop || !isWellFormedStaffReff(storedRaw)) {
          clearStaffReferral();
          return null;
        }
      }

      const parsed = Number(stored);
      if (Number.isSafeInteger(parsed) && parsed > 0) {
        return parsed;
      }
      clearStaffReferral();
    }
  } catch (err) {
    console.warn("Could not access referral storage:", err);
  }

  return null;
}

/**
 * Retrieves the raw captured referral code string (e.g., "93KimSan"),
 * scoped to the given shop code when one is provided.
 *
 * @param {string} [shopCode]
 * @returns {string | null}
 */
export function getStaffReferralRaw(shopCode) {
  if (typeof window === "undefined") return null;

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("staff_reff")) {
      const staffReff = params.get("staff_reff");
      if (isWellFormedStaffReff(staffReff)) {
        return staffReff;
      }
    }

    if (shopCode) {
      const storedShop = sessionStorage.getItem(REFERRAL_SHOP_KEY);
      if (storedShop && storedShop !== shopCode) {
        return null;
      }
    }

    const storedRaw = sessionStorage.getItem(REFERRAL_RAW_KEY);
    return isWellFormedStaffReff(storedRaw) ? storedRaw : null;
  } catch {
    return null;
  }
}

/**
 * Clears preserved staff referral from storage.
 */
export function clearStaffReferral() {
  try {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(REFERRAL_RAW_KEY);
      sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
      sessionStorage.removeItem(REFERRAL_SHOP_KEY);
    }
  } catch (err) {
    console.warn("Could not clear referral storage:", err);
  }
}

/**
 * Helper to construct a URL path within the shop that preserves
 * search parameters (specifically staff_reff) without duplicate keys.
 *
 * @param {string} targetPath - Path such as `/${shop_code}` or `/${shop_code}/products/${id}`
 * @param {string | URLSearchParams} [currentSearch] - The existing search string or params
 * @returns {string} - Preserved target path with search params
 */
export function buildPreservedShopPath(targetPath, currentSearch) {
  if (!targetPath) return targetPath;

  const [pathname, existingQuery = ""] = targetPath.split("?");
  const targetParams = new URLSearchParams(existingQuery);

  // Scope the preserved referral to the shop in the target path itself
  const targetShopCode = extractShopCodeFromPath(pathname);

  const sourceParams = new URLSearchParams(
    typeof currentSearch === "string"
      ? currentSearch
      : currentSearch?.toString() || (typeof window !== "undefined" ? window.location.search : "")
  );

  // If current search has staff_reff, preserve it (only if well-formed)
  if (sourceParams.has("staff_reff")) {
    const code = sourceParams.get("staff_reff");
    if (isWellFormedStaffReff(code)) {
      targetParams.set("staff_reff", code);
    }
  } else {
    // If not in current search, check if a referral was preserved for this shop
    const savedRaw = getStaffReferralRaw(targetShopCode);
    if (savedRaw && isWellFormedStaffReff(savedRaw)) {
      targetParams.set("staff_reff", savedRaw);
    }
  }

  const queryString = targetParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}
