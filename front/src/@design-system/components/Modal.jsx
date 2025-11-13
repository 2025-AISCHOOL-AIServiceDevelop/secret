import { useEffect } from 'react';
import { Heart, LogIn, X as XIcon } from 'lucide-react';

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
      <div className="relative max-w-2xl w-full mx-4">
        {children}
      </div>
    </div>
  );
};

// Login Prompt Modal
export const LoginPromptModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* 파란색 외부 박스 */}
      <div className="rounded-[18px] border-[4px] pt-2 px-4 pb-4" style={{ borderColor: '#5976c7', background: '#e8f0ff' }}>
        {/* 상단 로고 */}
        <div className="flex justify-center mb-2">
          <img src="/rogo.png" alt="로고" className="w-10 h-10 object-contain" />
        </div>
        
        {/* 흰색 내부 박스 */}
        <div className="bg-white border-2 border-[#5E5A6A] rounded-b-[12px] p-10 text-center">
          {/* 귀여운 아이콘 */}
          <div className="mb-4">
            <Heart className="w-16 h-16 mx-auto text-pink-400 fill-pink-200 animate-pulse" />
          </div>

          {/* 메시지 */}

          <p className="text-[#6C798A] mb-6">
            더 많은 기능을 이용하시려면<br />
            로그인이 필요해요
          </p>

          {/* 버튼들 */}
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 rounded-full border-2 border-[#a89a77] bg-[#B1D2FA] text-[#394b69] font-bold hover:bg-[#c9ddff] transition-colors duration-150 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              로그인하기
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
