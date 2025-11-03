import { useEffect } from 'react';

// Modal component
export const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-[18px] border-2 border-[#5E5A6A] shadow-lg p-6 max-w-sm w-full mx-4">
        {children}
      </div>
    </div>
  );
};

// Login Prompt Modal
export const LoginPromptModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        {/* 귀여운 이모티콘 */}
        <div className="text-6xl mb-4">🥺</div>

        {/* 메시지 */}
        <h3 className="text-xl font-bold text-[#394b69] mb-2">
          로그인을 해주세요!
        </h3>
        <p className="text-[#6C798A] mb-6">
          더 많은 기능을 이용하시려면<br />
          로그인이 필요해요 😊
        </p>

        {/* 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-full border-2 border-[#bfb3a1] bg-[#f8f4e9] text-[#394b69] font-bold hover:bg-[#f0e8d6] transition-colors duration-150"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-full border-2 border-[#a89a77] bg-[#B1D2FA] text-[#394b69] font-bold hover:bg-[#c9ddff] transition-colors duration-150"
          >
            로그인하기
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
