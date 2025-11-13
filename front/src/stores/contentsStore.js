import { create } from 'zustand';
import { contentsAPI } from '../services/api';
import { withErrorHandling, getErrorMessage } from '../services/errorHandler';

const useContentsStore = create((set, get) => ({
  // State
  contents: [],
  groupedContents: [], // 그룹화된 검색 결과 (원본 + 번역본)
  searchQuery: '',
  isLoading: false,
  error: null,
  hasSearched: false,
  useGroupedSearch: true, // 그룹화된 검색 사용 여부

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
      set({
        contents: data,
        groupedContents: [],
        searchQuery: '',
        hasSearched: false,
        isLoading: false,
      });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        contents: [],
        groupedContents: [],
        searchQuery: '',
        error: message,
        isLoading: false,
      });
      return [];
    }
  },

  searchContents: async (query, useGrouped = true) => {
    if (!query || query.trim() === '') {
      set({
        contents: [],
        groupedContents: [],
        searchQuery: '',
        hasSearched: false,
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null, searchQuery: query });

    try {
      // useGrouped가 true이면 grouped-search API 사용
      const response = await withErrorHandling(
        () => useGrouped ? contentsAPI.groupedSearch(query) : contentsAPI.searchContents(query),
        { context: 'Search Contents' }
      );

      const data = Array.isArray(response?.data) ? response.data : [];

      if (useGrouped) {
        // Grouped search: 그룹별로 데이터 구조화
        const groupedContents = data;
        // Flatten for backward compatibility
        const contents = groupedContents.flatMap(group =>
          [group?.original, ...(group?.translations || [])].filter(Boolean)
        );
        set({
          contents,
          groupedContents,
          isLoading: false,
          hasSearched: true,
          error: null,
        });
      } else {
        set({
          contents: data,
          groupedContents: [],
          isLoading: false,
          hasSearched: true,
          error: null,
        });
      }
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        contents: [],
        groupedContents: [],
        error: message,
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
