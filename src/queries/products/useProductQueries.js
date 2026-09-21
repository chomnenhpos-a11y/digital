import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import { productKeys } from './productKeys';
import { useCategoriesQuery } from '../categories/useCategoryQueries';
import { useMemo } from 'react';

// Shared mapping logic moved out of Context
const mapProduct = (item, categories = []) => {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

  const formatImageUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${baseUrl}${path}`;
  };

  const mappedImages = Array.isArray(item.images)
    ? item.images.map(formatImageUrl)
    : item.image
      ? [formatImageUrl(item.image)]
      : [];

  const rawImages = Array.isArray(item.images) ? item.images : [];

  const matchedCategory = categories.find(
    (cat) => String(cat.id) === String(item.categoryId || item.category_id)
  );

  return {
    id: item.id,
    name: item.name || '',
    price: Number(item.price || 0),
    discountPrice: Number(item.discountPrice || 0),
    salePrice: Number(item.salePrice || 0),
    sku: item.sku || '',
    stockQuantity: item.stockQuantity ?? item.stock ?? 0,
    stock: item.stockQuantity ?? item.stock ?? 0,
    images: mappedImages,
    rawImages,
    image: mappedImages[0] || '',
    description: item.description || '',
    categoryId: item.categoryId || item.category_id,
    categoryName: item.categoryName || matchedCategory?.name || '',
    createdAt: item.createdAt,
  };
};

export function useProductsQuery(params = {}) {
  const { data: categories = [] } = useCategoriesQuery(params.shop_code ? { shop_code: params.shop_code } : {});

  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async ({ signal }) => {
      const data = await productService.getProducts(params, { signal });
      const rawProducts = data?.data || data || [];
      return rawProducts;
    },
    // select allows us to map the data after fetching, and cache the raw data
    select: (rawProducts) => rawProducts.map((p) => mapProduct(p, categories)),
  });
}

// Optional selector hook to get low stock products efficiently
export function useLowStockProductsQuery() {
  const { data: products = [], ...rest } = useProductsQuery();

  const totalLowStockProducts = useMemo(() => {
    return products.filter(
      (product) => product.stockQuantity > 0 && product.stockQuantity <= 10
    ).length;
  }, [products]);

  return { totalLowStockProducts, ...rest };
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
