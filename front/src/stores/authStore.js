import { create } from 'zustand';
import { authAPI, API_BASE_URL } from '../services/api';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ✅ 로그인 상태 확인
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

  // ✅ 로그인 (백엔드 OAuth2)
  login: () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  },

  // ✅ 로그아웃 (백엔드 세션 + 프론트 상태 둘 다 종료)
  logout: async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/logout`, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }

    // 상태 초기화
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });

    // 홈으로 이동
    window.location.href = '/';
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
