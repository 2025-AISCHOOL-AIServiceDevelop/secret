import { create } from 'zustand';
import { contentsAPI } from '../services/api';
import { withErrorHandling } from '../services/errorHandler';

const useContentsStore = create((set, get) => ({
  // State
  contents: [],
  searchQuery: '',
  isLoading: false,
  error: null,
  hasSearched: false,

  // Actions
  // Load all contents (for initial display)
  loadContents: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await withErrorHandling(
        () => contentsAPI.searchContents(''),
        { context: 'Load Contents' }
      );

      set({
        contents: response.data,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        contents: [],
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  searchContents: async (query) => {
    if (!query || query.trim() === '') {
      set({
        contents: [],
        searchQuery: '',
        hasSearched: false,
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null, searchQuery: query });

    try {
      const response = await withErrorHandling(
        () => contentsAPI.searchContents(query),
        { context: 'Search Contents' }
      );

      set({
        contents: response.data,
        isLoading: false,
        hasSearched: true,
      });
    } catch (error) {
      set({
        contents: [],
        error: error.message,
        isLoading: false,
        hasSearched: true,
      });
    }
  },

  // Clear search results
  clearSearch: () => {
    set({
      contents: [],
      searchQuery: '',
      hasSearched: false,
      error: null,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Get content by ID
  getContentById: (contentId) => {
    const { contents } = get();
    return contents.find(content => content.contentsId === contentId);
  },
}));

export default useContentsStore;
