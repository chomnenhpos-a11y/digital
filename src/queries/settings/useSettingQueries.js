import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingService } from '../../services/settingService';
import { settingKeys } from './settingKeys';

export function useSettingsQuery(shopCode) {
  return useQuery({
    queryKey: settingKeys.byShopCode(shopCode),
    queryFn: ({ signal }) => settingService.getByShopCode(shopCode, { signal }),
    select: (data) => {
      const rawData = data?.data || data || {};
      return Array.isArray(rawData) ? rawData[0] || {} : rawData;
    },
    enabled: !!shopCode,
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