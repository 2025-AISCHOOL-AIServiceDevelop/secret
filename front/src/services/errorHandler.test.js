import { getErrorMessage, getFormErrorMessage } from './errorHandler'

describe('errorHandler', () => {
  describe('getErrorMessage', () => {
    it('should return default message for null/undefined error', () => {
      expect(getErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다.')
      expect(getErrorMessage(undefined)).toBe('알 수 없는 오류가 발생했습니다.')
    })

    it('should return network error message for network errors', () => {
      const networkError = new Error('Network Error')
      networkError.response = null

      expect(getErrorMessage(networkError)).toBe('네트워크 연결을 확인해주세요.')
    })

    it('should return appropriate message for HTTP status codes', () => {
      const badRequestError = {
        response: { status: 400, data: { message: '잘못된 요청' } }
      }
      const unauthorizedError = {
        response: { status: 401 }
      }
      const notFoundError = {
        response: { status: 404 }
      }
      const serverError = {
        response: { status: 500 }
      }

      expect(getErrorMessage(badRequestError)).toBe('잘못된 요청')
      expect(getErrorMessage(unauthorizedError)).toBe('로그인이 필요합니다.')
      expect(getErrorMessage(notFoundError)).toBe('요청한 리소스를 찾을 수 없습니다.')
      expect(getErrorMessage(serverError)).toBe('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    })

    it('should return custom error message from response data', () => {
      const customError = {
        response: {
          status: 422,
          data: { message: '이메일 형식이 올바르지 않습니다.' }
        }
      }

      expect(getErrorMessage(customError)).toBe('이메일 형식이 올바르지 않습니다.')
    })
  })

  describe('getFormErrorMessage', () => {
    it('should return empty string for invalid input', () => {
      expect(getFormErrorMessage(null)).toBe('')
      expect(getFormErrorMessage(undefined)).toBe('')
      expect(getFormErrorMessage('')).toBe('')
      expect(getFormErrorMessage(123)).toBe('')
    })

    it('should return first error message from object', () => {
      const errors = {
        email: '이메일 형식이 올바르지 않습니다.',
        password: '비밀번호는 8자 이상이어야 합니다.'
      }

      expect(getFormErrorMessage(errors)).toBe('이메일 형식이 올바르지 않습니다.')
    })

    it('should handle array error messages', () => {
      const errors = {
        email: ['이메일은 필수입니다.', '이메일 형식이 올바르지 않습니다.']
      }

      expect(getFormErrorMessage(errors)).toBe('이메일은 필수입니다.')
    })
  })
})

