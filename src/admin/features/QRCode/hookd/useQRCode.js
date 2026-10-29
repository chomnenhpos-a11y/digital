import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useSettingsQuery,
  useSettingsShareLinkQuery,
} from '@/queries/settings/useSettingQueries';
import { encodeStaffReff } from '@/client/features/cart/utils/staffReffToken';

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const currentOrigin = () =>
  (typeof window !== 'undefined' ? window.location.origin : '');

/**
 * Builds the storefront URL shared by the QR code and the copy button
 * (see `setting.md`): the share link is composed from the shop code and the
 * staff referral token only.
 *
 *   {origin}/{shop_code}?staff_reff={base64 staff token}
 *
 * @param {string} shopCode - Shop code (e.g. "KAM-844749")
 * @param {string} [staffReff] - Base64 `staff_{id}` token (e.g. "c3RhZmZfOTM")
 * @param {string} [customOrigin] - Optional custom frontend origin
 * @returns {string} Storefront URL, or empty string without a shop code
 */
export function buildStorefrontUrl(shopCode, staffReff = '', customOrigin = '') {
  if (!shopCode) return '';

  const origin = trimTrailingSlash(customOrigin || currentOrigin());

  try {
    const url = new URL(
      `/${encodeURIComponent(shopCode)}`,
      origin || undefined,
    );
    if (staffReff) {
      url.searchParams.set('staff_reff', staffReff);
    }
    return url.toString();
  } catch (error) {
    console.error('Failed to build the storefront URL:', error);
    return '';
  }
}

/**
 * Formats a share response that carries a full API URL
 * (e.g. http://api.host/api/settings?shop_code=KAM-844749&staff_reff=c3RhZmZfOTM)
 * into the storefront URL `/{shop_code}?staff_reff={token}`.
 *
 * @param {string} rawUrl - URL from the backend
 * @param {string} [fallbackShopCode] - Fallback shop code if missing from URL
 * @param {string} [customOrigin] - Optional custom frontend origin
 * @returns {string} Formatted storefront URL
 */
export function formatShareUrl(rawUrl, fallbackShopCode = '', customOrigin = '') {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  const origin = trimTrailingSlash(customOrigin || currentOrigin());

  try {
    const parsed = new URL(rawUrl, 'http://localhost');
    const shopCode = parsed.searchParams.get('shop_code') || fallbackShopCode;
    const staffReff = parsed.searchParams.get('staff_reff') || '';

    if (shopCode) {
      const storeUrl = buildStorefrontUrl(shopCode, staffReff, customOrigin || origin);
      if (storeUrl) return storeUrl;
    }
  } catch (error) {
    console.error('Failed to parse shareUrl:', error);
  }

  // Fallback: replace a localhost origin with the current frontend origin
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(rawUrl)) {
    return origin ? rawUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, origin) : rawUrl;
  }

  return rawUrl;
}

/**
 * Extracts the share information from the share-link/settings API response.
 *
 * Supports the new `setting.md` shape (`{ shop, sharedBy }`) and keeps
 * compatibility with plain `{ shareUrl | shopCode | shopName }` responses.
 *
 * @param {*} shareLinkResponse - Raw API response
 * @returns {{ rawShareUrl: string, shopCode: string, shopName: string, staffReff: string }}
 */
export function extractShareInfo(shareLinkResponse) {
  const root = shareLinkResponse?.data ?? shareLinkResponse ?? {};
  const shop = root.shop && typeof root.shop === 'object' ? root.shop : {};
  const sharedBy = root.sharedBy && typeof root.sharedBy === 'object' ? root.sharedBy : {};

  const rawShareUrl = typeof root.shareUrl === 'string' ? root.shareUrl : '';

  let paramsStaffReff = root.staff_reff || root.staffReff || '';
  if (!paramsStaffReff && rawShareUrl) {
    try {
      const parsed = new URL(rawShareUrl, 'http://localhost');
      paramsStaffReff = parsed.searchParams.get('staff_reff') || '';
    } catch {
      paramsStaffReff = '';
    }
  }

  // No token from the API -> build the standard token from the shared staff
  const sharedStaffId = Number(sharedBy.id);
  if (!paramsStaffReff && Number.isSafeInteger(sharedStaffId) && sharedStaffId > 0) {
    paramsStaffReff = encodeStaffReff(sharedStaffId);
  }

  return {
    rawShareUrl,
    shopCode: shop.shop_code || root.shopCode || '',
    shopName: shop.shop_name || root.shopName || '',
    staffReff: paramsStaffReff,
  };
}

/**
 * Provides the shop link/QR data for the admin QR code page.
 *
 * @param {string} [customOrigin] - Optional override for the frontend origin
 */
export function useQRCode(customOrigin) {
  const { user } = useAuth();
  const {
    data: shareLinkResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useSettingsShareLinkQuery();

  const userShopCode = user?.shop?.code || '';
  const { data: settingsData } = useSettingsQuery(userShopCode);

  const clientOrigin = trimTrailingSlash(customOrigin || currentOrigin());

  const { rawShareUrl, shopCode: shareShopCode, shopName: shareShopName, staffReff: shareStaffReff } =
    useMemo(() => extractShareInfo(shareLinkResponse), [shareLinkResponse]);

  // Same settings response is reused from other admin pages (flat shop fields
  // via the normalized settings query).
  const shopCode = shareShopCode || settingsData?.shop_code || userShopCode;
  const shopName =
    shareShopName || settingsData?.shop_name || user?.shop?.name || '';

  // QR code and link are generated from shop_code and staff_reff only.
  // When the API provides no token, the current staff's token is used.
  const staffReff = shareStaffReff || encodeStaffReff(user?.id);

  const shareUrl = useMemo(
    () => buildStorefrontUrl(shopCode, staffReff, clientOrigin),
    [shopCode, staffReff, clientOrigin],
  );

  return {
    shareUrl,
    rawShareUrl,
    staffReff,
    shopName,
    shopCode,
    isLoading,
    isError,
    error,
    refetch,
    clientOrigin,
  };
}

export default useQRCode;
