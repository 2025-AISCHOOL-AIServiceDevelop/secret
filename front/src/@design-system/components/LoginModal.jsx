import { createPortal } from "react-dom";
import kakaoLogo from '../../assets/kakao.png';
import googleLogo from '../../assets/google.png';
import mascotImg from '../../assets/mascot2.png';
import planetImg from '../../assets/planet.png';
import { API_BASE_URL } from '../../services/api';

function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center">

      <div className="relative flex items-center gap-6 translate-x-10">

        <div className="bg-white w-[1100px] max-w-[90%] min-h-[600px] rounded-2xl shadow-2xl flex overflow-hidden relative">

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-[26px] transition"
          >
            ✕
          </button>

          {/* 왼쪽 이미지 영역 */}
          <div
            className="w-[55%] bg-[#e1ecff] relative overflow-hidden rounded-l-2xl"
            style={{
              backgroundImage: `url(${planetImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>

          {/* 오른쪽 로그인 영역 */}
          <div className="flex-1 p-12 flex flex-col justify-center items-center text-center">

            <h2
              className="
              text-3xl
              font-[DungeonFighterOnlineBeatBeat]
              text-[#333]
              mb-4
            ">
              간편 로그인 또는 회원가입
            </h2>

            {/* Google */}
            <button
              onClick={() => handleLogin('google')}
              className="w-full mb-4"
            >
              <img
                src={googleLogo}
                className="w-full h-auto rounded-xl hover:scale-105 transition-transform"
                alt="구글 로그인"
              />
            </button>

            {/* Kakao */}
            <button
              onClick={() => handleLogin('kakao')}
              className="w-full mb-4"
            >
              <img
                src={kakaoLogo}
                className="w-full h-auto rounded-xl hover:scale-105 transition-transform"
                alt="카카오 로그인"
              />
            </button>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              로그인 시 서비스 이용약관 및<br/> 개인정보 처리방침에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default LoginModal;
