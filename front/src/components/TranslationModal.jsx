import { useState } from 'react';
import { Modal } from '../@design-system';
import { useTranslationStore } from '../stores';
import { useToastStore } from './Toast';

/**
 * TranslationModal - 번역 요청 모달
 * 사용자가 새로운 언어로 번역을 요청할 수 있는 UI
 */
function TranslationModal({ isOpen, onClose, content }) {
  const { translateContent, isTranslating } = useTranslationStore();
  const { success: showSuccessToast, error: showErrorToast } = useToastStore();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 지원하는 언어 목록
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: '영어', flag: '🇺🇸' },
    { code: 'zh', name: '중국어', flag: '🇨🇳' },
    { code: 'ja', name: '일본어', flag: '🇯🇵' },
    { code: 'vi', name: '베트남어', flag: '🇻🇳' },
    { code: 'th', name: '태국어', flag: '🇹🇭' },
    { code: 'ru', name: '러시아어', flag: '🇷🇺' },
  ];

  const handleSubmit = async () => {
    if (!selectedLanguage) {
      setError('언어를 선택해주세요!');
      return;
    }

    if (!content) {
      setError('콘텐츠 정보가 없습니다.');
      return;
    }

    setError('');
    
    try {
      // 번역 요청 DTO 구성
      const translateRequest = {
        sourceKey: content.sourceKey || content.contentsId.toString(),
        targetLang: selectedLanguage,
        title: `${content.title} (${selectedLanguage.toUpperCase()})`,
        parentId: content.parentId || content.contentsId, // 원본 ID
      };

      await translateContent(translateRequest);
      setSuccess(true);
      showSuccessToast('번역 요청이 완료되었습니다! 🎉', 3000);
      
      // 2초 후 모달 닫기
      setTimeout(() => {
        setSuccess(false);
        setSelectedLanguage('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Translation request failed:', err);
      const errorMessage = err.message || '번역 요청 중 오류가 발생했습니다.';
      setError(errorMessage);
      showErrorToast(errorMessage, 4000);
    }
  };

  const handleClose = () => {
    if (!isTranslating) {
      setSelectedLanguage('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="text-center">
        {/* 헤더 */}
        <div className="text-5xl mb-4">🌍</div>
        <h3 className="text-2xl font-bold text-[#394b69] mb-2">
          다른 언어로 번역하기
        </h3>
        <p className="text-sm text-[#6C798A] mb-6">
          이 동화를 다른 언어로 번역 요청할 수 있어요!
        </p>

        {success ? (
          // 성공 메시지
          <div className="py-8">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <p className="text-xl font-bold text-green-600">
              번역 요청 완료!
            </p>
            <p className="text-sm text-gray-600 mt-2">
              번역이 완료되면 목록에 표시됩니다.
            </p>
          </div>
        ) : (
          <>
            {/* 언어 선택 그리드 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  disabled={isTranslating}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedLanguage === lang.code
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white border-blue-600 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md'
                  } ${isTranslating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <div className="text-xs font-bold">{lang.name}</div>
                </button>
              ))}
            </div>

            {/* 현재 콘텐츠 정보 */}
            {content && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-600 mb-1">번역할 콘텐츠</div>
                <div className="text-sm font-bold text-gray-800 truncate">
                  {content.title}
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-bold">⚠️ {error}</p>
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="mb-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                ⏱️ 번역 작업은 몇 분 정도 소요될 수 있습니다.
              </p>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isTranslating}
                className="flex-1 px-4 py-3 rounded-full border-2 border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedLanguage || isTranslating}
                className="flex-1 px-4 py-3 rounded-full border-2 border-blue-600 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTranslating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    번역 중...
                  </span>
                ) : (
                  '번역 요청'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default TranslationModal;

