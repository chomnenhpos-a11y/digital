import React from 'react';
import { useParams, useLocation, Outlet } from 'react-router-dom';
import { usePublicSettingsQuery } from '../queries/settings/useSettingQueries';
import NotFoundPage from '../components/NotFoundPage';
import ShopLoadingSkeleton from '../client/components/common/ShopLoadingSkeleton';
import { sanitizeShopCode, isValidShopData, isValidStaffReferralParam } from './shopValidation';

/**
 * Route guard component that protects shop routes (/:shop_code and /:shop_code/products/:id).
 *
 * Rules:
 * 1. Invalid or nonexistent Shop Code -> Renders NotFoundPage.
 * 2. If staff_reff is present in URL but empty, malformed, or only the bare numeric
 *    ID (without the staff code) -> Renders NotFoundPage.
 * 3. If staff_reff does not match the backend staff data 100% exactly
 *    ({id}{staff_name}) or the staff member does not belong to this shop
 *    -> Renders NotFoundPage.
 * 4. Valid Shop Code + Valid Staff Referral (or no referral) -> Renders Outlet for normal shopping.
 */
export default function ShopRouteGuard() {
  const { shop_code } = useParams();
  const location = useLocation();
  const cleanShopCode = sanitizeShopCode(shop_code);

  const { data: settingData, isLoading, isError } = usePublicSettingsQuery(cleanShopCode);

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

  // 4. If staff_reff query parameter is present in URL, validate it against
  //    the shop staff data resolved from the backend (exact {id}{name} match)
  const searchParams = new URLSearchParams(location.search);
  if (searchParams.has('staff_reff')) {
    const rawStaffReff = searchParams.get('staff_reff');
    const isReferralValid = isValidStaffReferralParam(rawStaffReff, settingData);
    if (!isReferralValid) {
      return <NotFoundPage />;
    }
  }

  return <Outlet />;
}
