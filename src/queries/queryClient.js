import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes — reuse cached data between pages
      gcTime: 0,               // immediately remove inactive queries on unmount
    },
  },
});
