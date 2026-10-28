import { extractStaffId } from '../client/features/cart/utils/staffReferral.js';

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
 * Validates a staff referral parameter if present in the URL.
 *
 * Rules:
 * 1. If staff_reff parameter is absent, returns true (normal shopping without referral).
 * 2. If staff_reff parameter is present but empty or whitespace only -> invalid (false).
 * 3. If staff_reff parameter is malformed (no leading numeric ID, bare numeric ID
 *    without the staff code, <= 0) -> invalid (false).
 * 4. If backend staff data provides the shop's staff records ({ id, name }),
 *    the ENTIRE staff_reff value must match the backend record 100% exactly:
 *    `staff_reff === `${staff.id}${staff.name}``. Any differing character,
 *    letter, or number (or a staff member of ANOTHER shop) -> invalid (false).
 *    A bare numeric ID (e.g. "93") can never pass this full match.
 * 5. If the backend only provides an ID list (legacy) without names, the numeric
 *    ID must at least belong to that shop's list.
 *
 * @param {string|null|undefined} rawStaffReff - The raw staff_reff query value from URL
 * @param {object|null|undefined} settingData - The shop settings data
 * @returns {boolean} True if valid or absent, false if invalid/malformed or staff does not belong to shop
 */
export function isValidStaffReferralParam(rawStaffReff, settingData = null) {
  // If the parameter was not passed at all, normal shopping is allowed
  if (rawStaffReff === undefined || rawStaffReff === null) {
    return true;
  }

  // If present but empty or whitespace-only
  if (typeof rawStaffReff !== 'string' || !rawStaffReff.trim()) {
    return false;
  }

  const cleaned = rawStaffReff.trim();

  // Extract numeric ID prefix (e.g. '93KimSan' -> 93)
  const staffId = extractStaffId(cleaned);
  if (staffId === null) {
    return false;
  }

  // Exactly matching the backend is required: a referrer must never be
  // confirmed from its numeric ID alone (e.g. "93").
  const nameSuffix = cleaned.slice(String(staffId).length);
  if (!nameSuffix) {
    return false;
  }

  // If the shop settings expose staff records, verify full + exact membership
  const shopStaffData = getShopStaffData(settingData);
  if (shopStaffData) {
    // Full { id, name } staff records -> require an exact 100% match
    if (shopStaffData.named) {
      return shopStaffData.list.some(
        (staff) => String(staff.id) === String(staffId) && staff.name != null
          && cleaned === `${staff.id}${String(staff.name).trim()}`
      );
    }
    // Legacy staff_ids list without names -> the ID must belong to the shop
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
