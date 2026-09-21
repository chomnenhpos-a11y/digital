export const categoryKeys = {
  all: ['categories'],
  lists: () => [...categoryKeys.all, 'list'],
  list: (params) => [...categoryKeys.lists(), params],
};
