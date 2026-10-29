import React from 'react';
import { useParams, useLocation, Outlet } from 'react-router-dom';
import { usePublicSettingsQuery } from '../queries/settings/useSettingQueries';
import NotFoundPage from '../components/NotFoundPage';
import ShopLoadingSkeleton from '../client/components/common/ShopLoadingSkeleton';
import { sanitizeShopCode, isValidShopData, isValidStaffReferralParam } from './shopValidation';

/**
 * Route guard component that protects shop routes (/:shop_code and /:shop_code/products/:id).
 *
 * The shared link format is MANDATORY (see `setting.md`):
 *
 *   {shop_code}?staff_reff={staff_reff}
 *
 * where staff_reff is the Base64 token encoding `staff_{staff_id}`
 * (e.g. "c3RhZmZfOTY" -> staff 96).
 *
 * Rules:
 * 1. Invalid or nonexistent Shop Code -> Renders NotFoundPage.
 * 2. No staff_reff in URL, an empty one, one that is NOT a Base64 `staff_{id}`
 *    token (e.g. legacy "96KimSan", bare "96", malformed text)
 *    -> Renders NotFoundPage.
 * 3. If the decoded staff does not belong to this shop -> Renders NotFoundPage.
 * 4. Valid Shop Code + valid staff_reff token -> Renders Outlet.
 */
export default function ShopRouteGuard() {
  const { shop_code } = useParams();
  const location = useLocation();
  const cleanShopCode = sanitizeShopCode(shop_code);

  // The shared-link token (staff_reff) is forwarded so this cached settings
  // response already contains the backend-resolved shared staff (data.sharedBy),
  // which the order flow uses as the sell-by attribution.
  const searchParams = new URLSearchParams(location.search);
  const staffReff = searchParams.get('staff_reff') || undefined;

  const { data: settingData, isLoading, isError } = usePublicSettingsQuery(
    cleanShopCode,
    { staffReff },
  );

  // 1. Missing shop code in route parameter
  if (!cleanShopCode) {
    return <NotFoundPage />;
  }

  // 2. While validating the shop against the API, show a page-shaped skeleton
  //    (header + banner + product grid placeholders) instead of a blank
  //    full-screen spinner, so the page never flashes an empty white screen.
  if (isLoading) {
    return <ShopLoadingSkeleton />;
  }

  // 3. Verify shop code validity against backend settings
  const isShopValid = isValidShopData(settingData, cleanShopCode, isError);
  if (!isShopValid) {
    return <NotFoundPage />;
  }

  // 4. The staff_reff parameter is mandatory and must be a well-formed
  //    Base64 `staff_{id}` token belonging to this shop; every other
  //    format (including a missing parameter) is rejected.
  const isReferralValid = isValidStaffReferralParam(
    searchParams.get('staff_reff'),
    settingData,
  );
  if (!isReferralValid) {
    return <NotFoundPage />;
  }

  return <Outlet />;
}
