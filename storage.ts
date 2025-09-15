import * as SecureStore from 'expo-secure-store';

// Secure storage utilities for mobile
export class MobileStorage {
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Failed to store item:', error);
      throw error;
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    // Note: SecureStore doesn't have a clear all method
    // You would need to track keys if you want to clear everything
    console.warn('SecureStore clear not implemented - remove items individually');
  }
}

// Authentication token storage
export const AuthStorage = {
  TOKEN_KEY: 'auth_token',
  
  async setToken(token: string): Promise<void> {
    await MobileStorage.setItem(this.TOKEN_KEY, token);
  },
  
  async getToken(): Promise<string | null> {
    return await MobileStorage.getItem(this.TOKEN_KEY);
  },
  
  async removeToken(): Promise<void> {
    await MobileStorage.removeItem(this.TOKEN_KEY);
  },
};

// User preferences storage
export const PreferencesStorage = {
  LANGUAGE_KEY: 'user_language',
  THEME_KEY: 'user_theme',
  
  async setLanguage(language: string): Promise<void> {
    await MobileStorage.setItem(this.LANGUAGE_KEY, language);
  },
  
  async getLanguage(): Promise<string | null> {
    return await MobileStorage.getItem(this.LANGUAGE_KEY);
  },
  
  async setTheme(theme: string): Promise<void> {
    await MobileStorage.setItem(this.THEME_KEY, theme);
  },
  
  async getTheme(): Promise<string | null> {
    return await MobileStorage.getItem(this.THEME_KEY);
  },
};