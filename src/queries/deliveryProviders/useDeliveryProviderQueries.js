import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryProvidersService } from '../../services/delivery_providersService';
import { deliveryProviderKeys } from './deliveryProviderKeys';

export function useDeliveryProvidersQuery(params = {}) {
  return useQuery({
    queryKey: deliveryProviderKeys.list(params),
    queryFn: () => deliveryProvidersService.getDeliveryProviders(params),
    select: (data) => {
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
      const rawProviders = data?.data || data || [];
      return rawProviders.map((provider) => {
        if (provider.logo && !provider.logo.startsWith('http')) {
          return {
            ...provider,
            logo: `${baseUrl}${provider.logo.startsWith('/') ? '' : '/'}${provider.logo}`,
          };
        }
        return provider;
      });
    },
  });
}

export function useCreateDeliveryProviderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deliveryProvidersService.createDeliveryProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryProviderKeys.all });
    },
  });
}

export function useUpdateDeliveryProviderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => deliveryProvidersService.updateDeliveryProvider(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryProviderKeys.all });
    },
  });
}

export function useDeleteDeliveryProviderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deliveryProvidersService.deleteDeliveryProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryProviderKeys.all });
    },
  });
}
