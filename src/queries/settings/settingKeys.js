export const settingKeys = {
  all: ['settings'],
  // shopCode + optional staff_reff token: a token changes the response
  // (sharedBy), so it must be part of the cache key.
  byShopCode: (shopCode, staffReff) =>
    staffReff
      ? [...settingKeys.all, shopCode, 'staff', staffReff]
      : [...settingKeys.all, shopCode],
  byId: (id) => [...settingKeys.all, 'id', id],
  byShareLink: (link) => (link ? [...settingKeys.all, 'share-link', link] : [...settingKeys.all, 'share-link']),
};