import kakaoLogo from '../assets/kakao.png';
import googleLogo from '../assets/google.png';
import { API_BASE_URL } from '../services/api';

function LoginModal({ onClose }) {
  const handleLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">

      {/* 모달 박스 */}
      <div className="bg-white w-[900px] max-w-[90%] min-h-[560px] rounded-2xl shadow-2xl flex overflow-hidden animate-fadeIn relative">

        {/* 닫기 버튼 */}
        <button
        onClick={onClose}
        className="absolute top-4 right-4 text-black text-2xl hover:text-gray-700 transition"
      >
        ✕
      </button>

        {/* LEFT : 이미지 영역 */}
        <div className="w-[45%] bg-[#e1ecff] grid place-items-center p-8">
          <div
            className="w-[240px] h-[240px] rounded-full shadow-md"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #ffffff, #b7c6ea 60%, #9ab0e0)',
            }}
          />
        </div>

        {/* RIGHT : 로그인 폼 */}
        <div className="flex-1 p-12 flex flex-col justify-center text-center">
          <h2 className="text-[26px] font-extrabold mb-4">간편 로그인 또는 회원가입</h2>
          <p className="text-gray-600 mb-8">두근두근 지구말을 계속 이용하세요!</p>

          <button
            onClick={() => handleLogin('kakao')}
            className="w-full mb-4"
          >
            <img
              src={kakaoLogo}
              className="w-full h-auto rounded-xl hover:scale-105 active:scale-95 transition-transform duration-300"
              alt="카카오 로그인"
            />
          </button>

          <button
            onClick={() => handleLogin('google')}
            className="w-full mb-4"
          >
            <img
              src={googleLogo}
              className="w-full h-auto rounded-xl hover:scale-105 active:scale-95 transition-transform duration-300"
              alt="구글 로그인"
            />
          </button>

          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            로그인 시 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginModal;
