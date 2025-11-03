import { create } from 'zustand';
import { contentsAPI } from '../services/api';

const useContentsStore = create((set, get) => ({
  // State
  contents: [],
  searchQuery: '',
  isLoading: false,
  error: null,
  hasSearched: false,

  // Actions
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
      const response = await contentsAPI.searchContents(query);
      set({
        contents: response.data,
        isLoading: false,
        hasSearched: true,
      });
    } catch (error) {
      console.error('Content search failed:', error);
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
