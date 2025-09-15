import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { AuthStorage } from '@/utils/storage';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/constants/api';

// Complete the auth session when the app is reopened
WebBrowser.maybeCompleteAuthSession();

export class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private constructor() {
    // Set up deep link handling for auth callbacks
    this.setupDeepLinkHandling();
  }

  private setupDeepLinkHandling() {
    // Handle incoming links when app is already running
    Linking.addEventListener('url', this.handleDeepLink);
  }

  private handleDeepLink = (event: { url: string }) => {
    console.log('Deep link received:', event.url);
    // Handle auth callback from deep link
    // This would typically parse auth tokens from the URL
  };

  async login(): Promise<boolean> {
    try {
      // Create redirect URI for the app
      const redirectUri = Linking.createURL('auth');
      
      // Build login URL with redirect
      const loginUrl = `${API_ENDPOINTS.LOGIN}?redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      console.log('Opening auth session:', loginUrl);
      console.log('Redirect URI:', redirectUri);
      
      // Open browser-based auth session
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        redirectUri,
        {
          showInRecents: true,
          createTask: true,
        }
      );
      
      console.log('Auth session result:', result);
      
      if (result.type === 'success' && result.url) {
        // Parse the callback URL for auth tokens
        const success = await this.handleAuthCallback(result.url);
        return success;
      } else if (result.type === 'cancel') {
        throw new Error('Authentication was cancelled');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  private async handleAuthCallback(url: string): Promise<boolean> {
    try {
      // Parse URL parameters to extract auth tokens
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      
      if (error) {
        throw new Error(`Authentication error: ${error}`);
      }
      
      if (token) {
        // Store the auth token
        await AuthStorage.setToken(token);
        return true;
      }
      
      // If no token in URL, the auth might be cookie-based
      // Try to verify authentication status with the server
      return await this.verifyAuthStatus();
    } catch (error) {
      console.error('Auth callback error:', error);
      return false;
    }
  }

  async verifyAuthStatus(): Promise<boolean> {
    try {
      // Try to fetch user data to verify auth status
      await apiClient.get(API_ENDPOINTS.AUTH);
      return true;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await apiClient.post(API_ENDPOINTS.LOGOUT);
      
      // Clear stored token
      await AuthStorage.removeToken();
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if server call fails
      await AuthStorage.removeToken();
      throw error;
    }
  }

  async getStoredToken(): Promise<string | null> {
    return await AuthStorage.getToken();
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      // Check if we have a stored token
      const token = await this.getStoredToken();
      if (!token) {
        return false;
      }
      
      // Verify the token is still valid
      return await this.verifyAuthStatus();
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }
}

export const authService = AuthService.getInstance();