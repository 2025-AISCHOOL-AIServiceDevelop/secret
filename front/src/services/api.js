import axios from 'axios';

// Backend API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ 반드시 있어야 함
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
  
  // Search contents with grouped results (original + translations)
  groupedSearch: (query) => api.get('/api/contents/grouped-search', { params: { query } }),
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
  createFeedback: (feedbackRequest) => {
    return api.post('/api/tutor/feedback', feedbackRequest)
      .catch(error => {
        // Handle specific tutor API errors
        if (error.response?.status === 400) {
          throw new Error('필수 정보가 누락되었습니다. (userId, contentsId, scriptId, lang)');
        }
        if (error.response?.status === 422) {
          throw new Error('음성 분석에 실패했습니다. 다시 녹음해주세요.');
        }
        if (error.response?.status === 502) {
          throw new Error('AI 분석 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
        }
        throw error;
      });
  },

  // Analyze pronunciation from audio file
  analyzePronunciation: (audioFile, userId, contentsId, scriptId, lang) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('userId', userId);
    formData.append('contentsId', contentsId);
    formData.append('scriptId', scriptId);
    formData.append('lang', lang);

    return api.post('/api/tutor/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).catch(error => {
      // Handle specific pronunciation analysis errors
      if (error.response?.status === 400) {
        throw new Error('필수 정보가 누락되었습니다.');
      }
      if (error.response?.status === 415) {
        throw new Error('지원되지 않는 음성 파일 형식입니다. webm 또는 wav 파일을 사용해주세요.');
      }
      if (error.response?.status === 422) {
        throw new Error('음성 변환 또는 분석에 실패했습니다. 다시 녹음해주세요.');
      }
      if (error.response?.status === 502) {
        throw new Error('Azure AI 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
      }
      if (error.response?.status === 504) {
        throw new Error('AI 분석 요청이 시간 초과되었습니다. 다시 시도해주세요.');
      }
      throw error;
    });
  },

  // Get latest feedback for a specific user, content, and script
  getLatestFeedback: (userId, contentsId, scriptId) => {
    return api.get('/api/tutor/feedback/latest', {
      params: { userId, contentsId, scriptId }
    }).catch(error => {
      // Handle specific feedback retrieval errors
      if (error.response?.status === 400) {
        throw new Error('필수 정보가 누락되었습니다.');
      }
      if (error.response?.status === 404) {
        throw new Error('이 문장에 대한 발음 피드백 기록이 없습니다.');
      }
      throw error;
    });
  },
};

// Export API_BASE_URL for components that need direct access
export { API_BASE_URL };
export default api;
