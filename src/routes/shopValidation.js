import { decodeStaffReff } from '../client/features/cart/utils/staffReffToken.js';

/**
 * Sanitizes and normalizes a shop code from a URL parameter.
 *
 * @param {unknown} shopCode
 * @returns {string}
 */
export function sanitizeShopCode(shopCode) {
  if (!shopCode || typeof shopCode !== 'string') {
    return '';
  }

  let cleaned = shopCode.trim();

  try {
    cleaned = decodeURIComponent(cleaned).trim();
  } catch {
    // Keep the raw string if URI encoding is malformed.
  }

  return cleaned;
}

/**
 * Validates whether the fetched settings represent the requested shop.
 *
 * @param {object|null|undefined} settingData
 * @param {string} requestedShopCode
 * @param {boolean} isError
 * @returns {boolean}
 */
export function isValidShopData(
  settingData,
  requestedShopCode,
  isError = false,
) {
  if (isError) {
    return false;
  }

  if (!settingData || typeof settingData !== 'object') {
    return false;
  }

  if (!settingData.id) {
    return false;
  }

  const expectedCode = sanitizeShopCode(requestedShopCode);

  if (!expectedCode) {
    return false;
  }

  const actualCode =
    typeof settingData.shop_code === 'string'
      ? settingData.shop_code.trim()
      : '';

  if (!actualCode) {
    return false;
  }

  return actualCode.toLowerCase() === expectedCode.toLowerCase();
}

export function isValidStaffReferralParam(
  rawStaffReff,
  settingData = null,
) {
  // No referral: allow normal shop browsing.
  if (rawStaffReff === undefined || rawStaffReff === null) {
    return true;
  }

  // Reject empty or whitespace-only referrals.
  if (typeof rawStaffReff !== 'string' || !rawStaffReff.trim()) {
    return false;
  }

  const staffId = decodeStaffReff(rawStaffReff.trim());

  if (staffId === null) {
    return false;
  }

  // Verify membership when staff data is available.
  const shopStaffData = getShopStaffData(settingData);

  if (shopStaffData) {
    if (shopStaffData.named) {
      return shopStaffData.list.some(
        (staff) =>
          String(staff.id) === String(staffId) &&
          staff.name != null,
      );
    }

    return shopStaffData.list.some(
      (id) => Number(id) === staffId,
    );
  }

  return true;
}

export function getShopStaffData(settingData) {
  if (!settingData || typeof settingData !== 'object') {
    return null;
  }

  const recordKeys = ['staff', 'users', 'sellers'];

  for (const key of recordKeys) {
    const value = settingData[key];

    if (Array.isArray(value) && value.length > 0) {
      const allNamedRecords = value.every(
        (staff) =>
          typeof staff === 'object' &&
          staff !== null &&
          staff.id !== undefined &&
          staff.id !== null &&
          staff.name != null,
      );

      return {
        list: value,
        named: allNamedRecords,
      };
    }
  }

  const idListKeys = ['staff_ids', 'staffIds'];

  for (const key of idListKeys) {
    const value = settingData[key];

    if (Array.isArray(value) && value.length > 0) {
      return {
        list: value,
        named: false,
      };
    }
  }

  return null;
}