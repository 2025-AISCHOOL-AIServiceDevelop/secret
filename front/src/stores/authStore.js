import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  checkAuthStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.getCurrentUser();
      const { authenticated, attributes } = response.data;

      if (authenticated) {
        set({
          user: attributes,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({
        user: null,
        isAuthenticated: false,
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Login (OAuth2 redirect will be handled by backend)
  login: () => {
    // Redirect to backend OAuth2 login endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  },

  // Logout
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
    // Clear any local storage if needed
    localStorage.removeItem('auth_token');
    // Redirect to logout or home page
    window.location.href = '/';
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
