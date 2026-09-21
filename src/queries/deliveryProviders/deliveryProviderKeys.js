export const deliveryProviderKeys = {
  all: ['deliveryProviders'],
  lists: () => [...deliveryProviderKeys.all, 'list'],
  list: (filters) => [...deliveryProviderKeys.lists(), { filters }],
  details: () => [...deliveryProviderKeys.all, 'detail'],
  detail: (id) => [...deliveryProviderKeys.details(), id],
};
