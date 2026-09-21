import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import { categoryKeys } from './categoryKeys';

export function useCategoriesQuery(params = {}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: ({ signal }) => categoryService.getCategories(params, { signal }),
    select: (data) => {
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
      const rawCategories = data?.data || data || [];
      return rawCategories.map((cat) => {
        if (cat.image && !cat.image.startsWith('http')) {
          return {
            ...cat,
            image: `${baseUrl}${cat.image.startsWith('/') ? '' : '/'}${cat.image}`,
          };
        }
        return cat;
      });
    },
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
