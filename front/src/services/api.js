import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  // Get current user info
  getCurrentUser: () => api.get('/api/me'),
};

// Contents API
export const contentsAPI = {
  // Search contents by title
  searchContents: (query) => api.get('/api/contents/search', { params: { query } }),
};

// Translation API
export const translationAPI = {
  // Translate content
  translate: (translateRequest) => api.post('/api/translate', translateRequest),

  // Get scripts for content
  getScripts: (contentsId) => api.get(`/api/translate/${contentsId}/scripts`),
};

// Tutor API
export const tutorAPI = {
  // Create feedback from text
  createFeedback: (feedbackRequest) => api.post('/api/tutor/feedback', feedbackRequest),

  // Analyze pronunciation from audio file
  analyzePronunciation: (audioFile, userId, contentsId, lang) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('userId', userId);
    formData.append('contentsId', contentsId);
    formData.append('lang', lang);

    return api.post('/api/tutor/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
