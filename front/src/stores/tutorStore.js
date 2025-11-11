import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tutorAPI } from '../services/api';

const useTutorStore = create(
  persist(
    (set, get) => ({
      // State
      currentFeedback: null,
      feedbackHistory: [],
      isAnalyzing: false,
      isCreatingFeedback: false,
      error: null,
      recordingState: 'idle', // 'idle', 'recording', 'stopped'

  // Actions
  // Create feedback from text input
  createFeedback: async (feedbackRequest) => {
    set({ isCreatingFeedback: true, error: null });

    try {
      const response = await tutorAPI.createFeedback(feedbackRequest);
      const newFeedback = response.data;

      set((state) => ({
        currentFeedback: newFeedback,
        feedbackHistory: [newFeedback, ...state.feedbackHistory],
        isCreatingFeedback: false,
      }));

      return newFeedback;
    } catch (error) {
      console.error('Creating feedback failed:', error);
      set({
        error: error.message,
        isCreatingFeedback: false,
      });
      throw error;
    }
  },

  // Analyze pronunciation from audio file
  analyzePronunciation: async (audioFile, userId, contentsId, scriptId, lang) => {
    set({ isAnalyzing: true, error: null });

    try {
      const response = await tutorAPI.analyzePronunciation(audioFile, userId, contentsId, scriptId, lang);
      const feedback = response.data;

      set((state) => ({
        currentFeedback: feedback,
        feedbackHistory: [feedback, ...state.feedbackHistory],
        isAnalyzing: false,
      }));

      return feedback;
    } catch (error) {
      console.error('Pronunciation analysis failed:', error);
      set({
        error: error.message,
        isAnalyzing: false,
      });
      throw error;
    }
  },

  // Recording state management
  startRecording: () => {
    set({ recordingState: 'recording' });
  },

  stopRecording: () => {
    set({ recordingState: 'stopped' });
  },

  resetRecording: () => {
    set({ recordingState: 'idle' });
  },

  // Clear current feedback
  clearCurrentFeedback: () => {
    set({ currentFeedback: null, error: null });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Get feedback history for user
  getUserFeedbackHistory: (userId) => {
    const { feedbackHistory } = get();
    return feedbackHistory.filter(feedback => feedback.userId === userId);
  },

  // Get feedback history for content
  getContentFeedbackHistory: (contentsId) => {
    const { feedbackHistory } = get();
    return feedbackHistory.filter(feedback => feedback.contentsId === contentsId);
  },

  // Get latest feedback from API
  fetchLatestFeedback: async (userId, contentsId, scriptId) => {
    set({ error: null });

    try {
      const response = await tutorAPI.getLatestFeedback(userId, contentsId, scriptId);
      const latestFeedback = response.data;

      set((state) => ({
        currentFeedback: latestFeedback,
        feedbackHistory: [latestFeedback, ...state.feedbackHistory.filter(f =>
          !(f.userId === userId && f.contentsId === contentsId && f.scriptId === scriptId)
        )]
      }));

      return latestFeedback;
    } catch (error) {
      console.error('Fetching latest feedback failed:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Get latest feedback from local state
  getLatestFeedback: () => {
    const { feedbackHistory } = get();
    return feedbackHistory.length > 0 ? feedbackHistory[0] : null;
  },
    }),
    {
      name: 'tutor-storage', // localStorage key
      partialize: (state) => ({
        feedbackHistory: state.feedbackHistory,
        currentFeedback: state.currentFeedback,
      }),
    }
  )
);

export default useTutorStore;
