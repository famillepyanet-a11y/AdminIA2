import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/constants/api';
import { authService } from '@/services/authService';
import type { User } from '@shared/schema';

interface AuthUser extends User {
  isAuthenticated: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useApiQuery<User>(['auth', 'user'], API_ENDPOINTS.AUTH, {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Login mutation using the auth service
  const loginMutation = useApiMutation<boolean, void>(
    async () => {
      const success = await authService.login();
      if (success) {
        // Refresh user data after successful login
        await refetch();
      }
      return success;
    },
    {
      onSuccess: (success) => {
        if (success) {
          queryClient.invalidateQueries({ queryKey: ['auth'] });
        }
      },
      onError: (error) => {
        console.error('Login failed:', error);
      },
    }
  );

  // Logout mutation using the auth service
  const logoutMutation = useApiMutation<void, void>(
    async () => {
      await authService.logout();
    },
    {
      onSuccess: () => {
        queryClient.clear(); // Clear all cached data
      },
      onError: (error) => {
        console.error('Logout failed:', error);
        // Clear cache anyway
        queryClient.clear();
      },
    }
  );

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        queryClient.clear();
      }
      return isAuth;
    } catch (error) {
      console.error('Auth status check failed:', error);
      return false;
    }
  };

  const isAuthenticated = !!user && !error;

  return {
    user: user as AuthUser | undefined,
    isAuthenticated,
    isLoading,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    checkAuthStatus,
    refetch,
  };
}