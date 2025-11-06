import { Component } from 'react';
import { logError } from '../services/errorHandler';

/**
 * 전역 에러 바운더리 컴포넌트
 * 애플리케이션에서 발생하는 예기치 않은 에러를 잡아서
 * 사용자에게 친화적인 에러 화면을 표시합니다.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) { // eslint-disable-line no-unused-vars
    // 다음 렌더링에서 폴백 UI를 표시하도록 상태 업데이트
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅
    logError(error, 'ErrorBoundary');
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[18px] border-2 border-red-200 shadow-lg p-6 text-center">
            {/* 에러 아이콘 */}
            <div className="text-6xl mb-4">😵</div>

            {/* 에러 메시지 */}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              죄송합니다!
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              예상치 못한 오류가 발생했습니다.<br />
              잠시 후 다시 시도해주세요.
            </p>

            {/* 개발 환경에서만 상세 정보 표시 */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left bg-gray-50 p-3 rounded-lg">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  개발자 정보 (펼치기)
                </summary>
                <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* 액션 버튼들 */}
            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-full font-bold hover:bg-gray-600 transition-colors"
              >
                홈으로
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
