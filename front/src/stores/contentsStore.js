import { create } from 'zustand';
import { contentsAPI } from '../services/api';
import { withErrorHandling } from '../services/errorHandler';
import { buildMockContents } from '../services/mockData';

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

      const data = Array.isArray(response?.data) ? response.data : [];
      const contents = data.length > 0 ? data : buildMockContents('');
      set({ contents, isLoading: false });
      return response.data;
    } catch (error) {
      const contents = buildMockContents('');
      set({ contents, error: null, isLoading: false });
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

      const data = Array.isArray(response?.data) ? response.data : [];
      const contents = data.length > 0 ? data : buildMockContents(query);
      set({ contents, isLoading: false, hasSearched: true });
    } catch (error) {
      const contents = buildMockContents(query);
      set({ contents, error: null, isLoading: false, hasSearched: true });
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
