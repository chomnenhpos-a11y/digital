import React from 'react';
import { useParams, useLocation, Outlet } from 'react-router-dom';
import { usePublicSettingsQuery } from '../queries/settings/useSettingQueries';
import { useDynamicShopBranding } from '../hooks/useDynamicShopBranding';
import NotFoundPage from '../components/NotFoundPage';
import ShopLoadingSkeleton from '../client/components/common/ShopLoadingSkeleton';
import {
  sanitizeShopCode,
  isValidShopData,
  isValidStaffReferralParam,
} from './shopValidation';

/**
 * Protects shop routes:
 * - /:shop_code
 * - /:shop_code/products/:id
 *
 * A staff referral is optional.
 *
 * Rules:
 * 1. An invalid or nonexistent shop renders NotFoundPage.
 * 2. A missing staff_reff allows normal shop browsing.
 * 3. A provided empty or malformed staff_reff renders NotFoundPage.
 * 4. A provided referral must belong to the shop when membership
 *    can be verified from the backend settings.
 */
export default function ShopRouteGuard() {
  const { shop_code } = useParams();
  const location = useLocation();

  const cleanShopCode = sanitizeShopCode(shop_code);
  const searchParams = new URLSearchParams(location.search);
  const rawStaffReff = searchParams.get('staff_reff');

  // Pass the referral to the settings API when provided.
  // This preserves backend-resolved shared staff attribution.
  const staffReff = rawStaffReff || undefined;

  const {
    data: settingData,
    isLoading,
    isError,
  } = usePublicSettingsQuery(cleanShopCode, { staffReff });

  // Top-level hook call: Must be called before any conditional early returns
  useDynamicShopBranding(cleanShopCode, settingData);

  // 1. Missing or invalid route parameter.
  if (!cleanShopCode) {
    return <NotFoundPage />;
  }

  // 2. Show a skeleton while settings are loading.
  if (isLoading) {
    return <ShopLoadingSkeleton />;
  }

  // 3. Validate the requested shop against backend settings.
  const isShopValid = isValidShopData(
    settingData,
    cleanShopCode,
    isError,
  );

  if (!isShopValid) {
    return <NotFoundPage />;
  }

  // 4. Validate the referral only when provided.
  // Missing staff_reff is valid for normal shop browsing.
  const isReferralValid = isValidStaffReferralParam(
    rawStaffReff,
    settingData,
  );

  if (!isReferralValid) {
    return <NotFoundPage />;
  }

  return <Outlet />;
}
