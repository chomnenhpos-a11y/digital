import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { usePublicSettingsQuery } from '@/queries/settings/useSettingQueries';
/**
 * Resolves the order's sell-by attribution (saleBy) from the shared staff.
 *
 * Business rules (see `setting.md`):
 * 1. A shared link always carries `staff_reff` (Base64 `staff_{id}` token):
 *    `/{shop_code}?staff_reff=c3RhZmZfOTM`
 * 2. The token is forwarded AS-IS to `api/settings?shop_code=...&staff_reff=...`
 *    and the backend answers with the shared staff in `data.sharedBy`.
 * 3. Only the backend-resolved `sharedBy.id` is trusted for attribution —
 *    the client never parses the token to decide who sold the order.
 * 4. Direct visits without a shared link resolve to `null`, so the order is
 *    submitted WITHOUT a sell-by attribution instead of guessing.
 *
 * The settings request is shop-scoped by the route's shop code, so a staff
 * from another shop can never be attributed here.
 *
 * @param {object} [options]
 * @param {string} [options.shopCode] - Current shop code from the route
 * @returns {number|null} Shared staff ID to use as the order saleBy, or null
 */
export default function useSharedSaleBy({ shopCode } = {}) {
  const { search } = useLocation();

  // Raw staff_reff token from the current visit (shared link entry point).
  // Reading it on every render is cheap; useLocation makes the value
  // re-evaluate whenever the URL query changes.
  const staffReff = new URLSearchParams(search).get('staff_reff');

  // Only a visit that actually came from a shared link fetches the
  // staff-scoped settings — direct visits can never gain attribution.
  const { data: settingsData } = usePublicSettingsQuery(shopCode, {
    staffReff: staffReff || undefined,
    enabled: !!shopCode && !!staffReff,
  });

  const sharedSaleBy = Number(settingsData?.sharedBy?.id);

  return useMemo(
    () => (Number.isSafeInteger(sharedSaleBy) && sharedSaleBy > 0 ? sharedSaleBy : null),
    [sharedSaleBy],
  );
}
