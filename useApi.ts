import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/services/apiClient';

// Custom hook for GET requests
export function useApiQuery<TData = unknown, TError = ApiError>(
  queryKey: (string | number)[],
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => apiClient.get<TData>(endpoint),
    ...options,
  });
}

// Custom hook for POST/PUT/DELETE requests
export function useApiMutation<TData = unknown, TVariables = unknown, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  const queryClient = useQueryClient();
  
  return useMutation<TData, TError, TVariables>({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      // Call the original onSuccess if provided
      options?.onSuccess?.(data, variables, context);
      
      // You can add global success handling here
    },
    onError: (error, variables, context) => {
      // Call the original onError if provided
      options?.onError?.(error, variables, context);
      
      // You can add global error handling here
      console.error('API Mutation Error:', error);
    },
  });
}

// Convenience hooks for common operations
export function useCreateMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  return useApiMutation(
    (data: TVariables) => apiClient.post<TData>(endpoint, data),
    options
  );
}

export function useUpdateMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  return useApiMutation(
    (data: TVariables) => apiClient.put<TData>(endpoint, data),
    options
  );
}

export function useDeleteMutation<TData = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, ApiError, void>
) {
  return useApiMutation(
    () => apiClient.delete<TData>(endpoint),
    options
  );
}