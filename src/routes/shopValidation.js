import { decodeStaffReff } from '../client/features/cart/utils/staffReffToken.js';

/**
 * Sanitizes and normalizes a shop code from a URL parameter.
 * Handles trimming and decoding URI encoded characters.
 *
 * @param {string|unknown} shopCode
 * @returns {string} Clean shop code or empty string if invalid
 */
export function sanitizeShopCode(shopCode) {
  if (!shopCode || typeof shopCode !== 'string') return '';
  let cleaned = shopCode.trim();
  try {
    cleaned = decodeURIComponent(cleaned).trim();
  } catch {
    // Keep raw string if URI encoding is malformed
  }
  return cleaned;
}

/**
 * Validates whether the fetched shop settings data represents an active, valid shop.
 *
 * @param {object|null|undefined} settingData - The settings object returned from the API
 * @param {string} requestedShopCode - The shop code requested in the route
 * @param {boolean} isError - Whether the API query failed (e.g. 404, 500, network error)
 * @returns {boolean} True if shop is confirmed valid, false otherwise
 */
export function isValidShopData(settingData, requestedShopCode, isError = false) {
  if (isError) return false;
  if (!settingData || typeof settingData !== 'object') return false;
  if (!settingData.id) return false;

  const expectedCode = sanitizeShopCode(requestedShopCode);
  if (!expectedCode) return false;

  const actualCode = typeof settingData.shop_code === 'string' ? settingData.shop_code.trim() : '';
  if (!actualCode) return false;

  return actualCode.toLowerCase() === expectedCode.toLowerCase();
}

/**
 * Validates a staff referral parameter for the shop route guard.
 *
 * The shared link MUST follow the sample format (see `setting.md`):
 *
 *   {shop_code}?staff_reff={staff_reff}
 *
 * where staff_reff is the Base64 token encoding `staff_{staff_id}`
 * (e.g. "c3RhZmZfOTY" -> staff 96).
 *
 * Rules:
 * 1. If staff_reff parameter is ABSENT -> invalid (false): the storefront is
 *    only reachable through a shared link in the sample format.
 * 2. If staff_reff parameter is present but empty or whitespace only -> invalid (false).
 * 3. If staff_reff is present and NOT a Base64 `staff_{id}` token
 *    (e.g. legacy "96KimSan", bare "96", random text) -> invalid (false).
 * 4. A well-formed token must also belong to the shop: when the backend staff
 *    data exposes the shop's staff records, the decoded staff ID must exist
 *    in that list — a staff of ANOTHER shop -> invalid (false).
 *
 * @param {string|null|undefined} rawStaffReff - The raw staff_reff query value from URL
 * @param {object|null|undefined} settingData - The shop settings data
 * @returns {boolean} True only when a well-formed shop-scoped token is provided
 */
export function isValidStaffReferralParam(rawStaffReff, settingData = null) {
  // The shared-link format is mandatory: no parameter at all is invalid
  if (rawStaffReff === undefined || rawStaffReff === null) {
    return false;
  }

  // If present but empty or whitespace-only
  if (typeof rawStaffReff !== 'string' || !rawStaffReff.trim()) {
    return false;
  }

  // Only the Base64 `staff_{id}` token format is accepted
  // (see `setting.md` — c3RhZmZfOTM -> staff 93).
  const staffId = decodeStaffReff(rawStaffReff.trim());
  if (staffId === null) {
    return false;
  }

  // Membership check: the token's staff must belong to this shop
  const shopStaffData = getShopStaffData(settingData);
  if (shopStaffData) {
    if (shopStaffData.named) {
      return shopStaffData.list.some(
        (staff) => String(staff.id) === String(staffId) && staff.name != null
      );
    }
    return shopStaffData.list.some((id) => Number(id) === staffId);
  }

  return true;
}

/**
 * Resolves the staff records / staff IDs exposed by the shop's backend data.
 * Used to confirm that a staff member belongs to the shop identified by the
 * shop code. Returns null when the backend provides no staff data.
 *
 * Supported (existing) backend shapes:
 * - `staff` / `users` / `sellers`: array of staff records ({ id, name }) or plain IDs
 * - `staff_ids` / `staffIds`: plain array of staff IDs (legacy)
 *
 * @param {object|null|undefined} settingData
 * @returns {{ list: Array, named: boolean } | null}
 */
export function getShopStaffData(settingData) {
  if (!settingData || typeof settingData !== 'object') {
    return null;
  }

  const recordKeys = ['staff', 'users', 'sellers'];
  for (const key of recordKeys) {
    const value = settingData[key];
    if (Array.isArray(value) && value.length > 0) {
      const allNamedRecords = value.every(
        (staff) => typeof staff === 'object' && staff !== null
          && staff.id !== undefined && staff.id !== null
          && staff.name != null
      );
      return { list: value, named: allNamedRecords };
    }
  }

  const idListKeys = ['staff_ids', 'staffIds'];
  for (const key of idListKeys) {
    if (Array.isArray(settingData[key]) && settingData[key].length > 0) {
      return { list: settingData[key], named: false };
    }
  }

  return null;
}
