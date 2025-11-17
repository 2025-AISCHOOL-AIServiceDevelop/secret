import { useEffect } from 'react';
import { LogIn, X } from 'lucide-react';
import saturn from '../../assets/saturn.png';  // 토성 이미지

// Modal component
export const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => (document.body.style.overflow = 'unset');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-w-xl w-full mx-4">
        {children}
      </div>

    </div>
  );
};

// Login Prompt Modal
export const LoginPromptModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className="relative rounded-[18px] border-[4px] pt-2 px-4 pb-4"
        style={{ borderColor: '#5E5A6A', background: '#e8f0ff' }}
      >

        {/* X 닫기 버튼 */}
        <button
          onClick={onClose}
          className="
            absolute right-4 top-4
            text-[#5E5A6A]
            hover:text-[#2d3450]
            transition
          "
        >
          <X className="w-6 h-6" />
        </button>

        {/* 상단 토성 로고 */}
        <div className="flex justify-center mb-2 mt-2">
          <img
            src={saturn}
            alt="토성 로고"
            className="w-12 h-12 object-contain drop-shadow-sm"
          />
        </div>

        {/* 흰색 내부 박스 */}
        <div className="bg-white border-2 border-[#6C798A] rounded-b-[12px] p-10 text-center">

          {/* 안내 문구 */}
          <p className="text-[#6C798A] mb-6 font-semibold">
            더 많은 기능을 이용하려면<br />
            로그인이 필요해요!
          </p>

          {/* 버튼 */}
          <div className="flex justify-center">
            <button
              onClick={onConfirm}
              className="
                w-[250px]
                px-4 py-2 rounded-full 
                border-2 border-[#6C798A]
                bg-[#B1D2FA] text-[#394b69] font-bold 
                hover:bg-[#c9ddff] 
                transition-colors duration-150 
                flex items-center justify-center gap-2
              "
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
