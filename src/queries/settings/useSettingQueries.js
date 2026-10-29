import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingService } from '../../services/settingService';
import { settingKeys } from './settingKeys';

/**
 * Normalizes every supported settings response shape into one flat object:
 *
 * New (`setting.md`) — `{ data: { shop, sharedBy } }`:
 *   -> `{ ...shop, sharedBy }`
 * so existing consumers keep reading flat shop fields (shop_name, logo, ...)
 * and attribution-aware consumers additionally read `data.sharedBy`.
 *
 * Legacy — a flat shop object (or an array of them) is returned as-is.
 *
 * @param {*} data - Raw API response
 * @returns {object}
 */
export function normalizeSettingsData(data) {
  const root = data?.data ?? data ?? {};

  if (Array.isArray(root)) {
    return root[0] ?? {};
  }

  if (root.shop && typeof root.shop === 'object') {
    return { ...root.shop, sharedBy: root.sharedBy ?? null };
  }

  return root;
}

export function useSettingsQuery(shopCode, options = {}) {
  // staff_reff token: forwarded to the API and included in the cache key,
  // because it changes the response (data.sharedBy).
  const { staffReff, ...queryOptions } = options;

  return useQuery({
    queryKey: settingKeys.byShopCode(shopCode, staffReff),
    queryFn: ({ signal }) =>
      settingService.getByShopCode(shopCode, { signal, staffReff }),
    select: normalizeSettingsData,
    enabled: !!shopCode,
    retry: (failureCount, error) => {
      // Do not retry 404 (nonexistent shop) so error state resolves immediately
      if (error?.response?.status === 404) return false;
      return failureCount < 1;
    },
    ...queryOptions,
  });
}

export function useSettingsShareLinkQuery(linkOrOptions, maybeOptions = {}) {
  const isOptions =
    typeof linkOrOptions === 'object' &&
    linkOrOptions !== null &&
    !Array.isArray(linkOrOptions);
  const link = isOptions ? undefined : linkOrOptions;
  const options = isOptions ? linkOrOptions : maybeOptions;

  return useQuery({
    queryKey: settingKeys.byShareLink(link),
    queryFn: ({ signal }) => settingService.getShareLink({ signal }),
    ...options,
  });
}
export function useSettingByIdQuery(id) {
  return useQuery({
    queryKey: settingKeys.byId(id),
    queryFn: ({ signal }) => settingService.getSettingById(id, { signal }),
    select: (data) => {
      const rawData = data?.data || data || [];
      return Array.isArray(rawData) ? rawData[0] || {} : rawData;
    },
    enabled: !!id,
  });
}

export const usePublicSettingsQuery = useSettingsQuery;

export function useUpdateSettingMutation(shopCode) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      settingService.updateSetting(id, data),

    onSuccess: () => {
      // Refresh this specific shop
      queryClient.invalidateQueries({
        queryKey: settingKeys.byShopCode(shopCode),
      });

      // Optional: refresh all settings queries
      queryClient.invalidateQueries({
        queryKey: settingKeys.all,
      });
    },
  });
}

export function useCreateSettingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingService.createSetting,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingKeys.all,
      });
    },
  });
}