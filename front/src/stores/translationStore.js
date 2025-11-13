import { create } from 'zustand';
import { translationAPI } from '../services/api';

const useTranslationStore = create((set, get) => ({
  // State
  currentTranslation: null,
  scripts: [],
  isTranslating: false,
  isLoadingScripts: false,
  error: null,

  // Actions
  translateContent: async (translateRequest) => {
    set({ isTranslating: true, error: null });

    try {
      const response = await translationAPI.translate(translateRequest);
      set({
        currentTranslation: response.data,
        isTranslating: false,
      });
      return response.data;
    } catch (error) {
      console.error('Translation failed:', error);
      set({
        error: error.message,
        isTranslating: false,
      });
      throw error;
    }
  },

  // Load scripts for a content
  loadScripts: async (contentsId, lang) => {
    set({ isLoadingScripts: true, error: null });

    try {
      const response = await translationAPI.getScripts(contentsId, lang);
      set({
        scripts: response.data,
        isLoadingScripts: false,
      });
      return response.data;
    } catch (error) {
      console.error('Loading scripts failed:', error);
      set({
        scripts: [],
        error: error.message,
        isLoadingScripts: false,
      });
      throw error;
    }
  },

  // Clear current translation
  clearTranslation: () => {
    set({
      currentTranslation: null,
      scripts: [],
      error: null,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Get script by order number
  getScriptByOrder: (orderNo) => {
    const { scripts } = get();
    return scripts.find(script => script.orderNo === orderNo);
  },

  // Get current script for display (first script or specific one)
  getCurrentScript: () => {
    const { scripts } = get();
    return scripts.length > 0 ? scripts[0] : null;
  },
}));

export default useTranslationStore;
