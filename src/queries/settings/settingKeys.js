export const settingKeys = {
  all: ['settings'],
  byShopCode: (shopCode) => [...settingKeys.all, shopCode],
  byId: (id) => [...settingKeys.all, 'id', id],
};