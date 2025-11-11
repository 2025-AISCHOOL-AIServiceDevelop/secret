// Error handling utilities for consistent error management
import { useToastStore } from '../components/Toast';

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 * @param {Error} error - API 호출에서 발생한 에러
 * @returns {string} 사용자에게 표시할 에러 메시지
 */
export const getErrorMessage = (error) => {
  if (!error) return '알 수 없는 오류가 발생했습니다.';

  // Network error
  if (!error.response) {
    return '네트워크 연결을 확인해주세요.';
  }

  const { status, data } = error.response;

  // HTTP status code에 따른 메시지
  switch (status) {
    case 400:
      return data?.message || '잘못된 요청입니다.';
    case 401:
      return '로그인이 필요합니다.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 409:
      return '중복된 데이터가 있습니다.';
    case 422:
      return '입력값을 확인해주세요.';
    case 429:
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    case 503:
      return '서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.';
    default:
      return data?.message || `오류가 발생했습니다. (${status})`;
  }
};

/**
 * 에러 로깅 유틸리티
 * @param {Error} error - 로깅할 에러
 * @param {string} context - 에러가 발생한 컨텍스트
 */
export const logError = (error, context = '') => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // 개발 환경에서는 콘솔에 상세 로그 출력
  if (import.meta.env.DEV) {
    console.error(`[${context}] Error:`, errorInfo);
  }

  // 프로덕션 환경에서는 에러 추적 서비스로 전송 (추후 구현)
  // 예: Sentry, LogRocket 등
};

/**
 * API 호출을 위한 래퍼 함수
 * @param {Function} apiCall - API 호출 함수
 * @param {Object} options - 옵션 객체
 * @returns {Promise} API 호출 결과 또는 표준화된 에러
 */
export const withErrorHandling = async (apiCall, options = {}) => {
  const {
    showToast = true,
    logError: shouldLogError = true,
    context = 'API Call'
  } = options;

  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    if (shouldLogError) {
      logError(error, context);
    }

    // 사용자에게 에러 표시
    if (showToast) {
      const message = getErrorMessage(error);
      console.warn(`[${context}] ${message}`);
      
      // 토스트 알림 표시
      const toast = useToastStore.getState();
      toast.error(message, 4000);
    }

    throw error;
  }
};

/**
 * 폼 유효성 검사 에러 처리
 * @param {Object} errors - 폼 유효성 검사 에러 객체
 * @returns {string} 첫 번째 에러 메시지
 */
export const getFormErrorMessage = (errors) => {
  if (!errors || typeof errors !== 'object') return '';

  const firstError = Object.values(errors)[0];
  return Array.isArray(firstError) ? firstError[0] : firstError;
};

export default {
  getErrorMessage,
  logError,
  withErrorHandling,
  getFormErrorMessage
};
