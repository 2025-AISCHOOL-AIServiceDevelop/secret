import { createPortal } from "react-dom";
import kakaoLogo from '../../assets/kakao.png';
import googleLogo from '../../assets/google.png';
import planetImg from '../../assets/planet.png';
import logoImg from '../../assets/rogo.png'; // ← 두근두근 지구말 PNG (투명)

import { API_BASE_URL } from '../../services/api';

function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  // 클릭 번쩍 효과 트리거
  const onFlash = (e) => {
    const el = e.currentTarget;
    el.classList.remove("is-pressed");
    void el.offsetWidth; // reflow
    el.classList.add("is-pressed");
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="relative flex items-center gap-6 translate-x-10">
        {/* 로그인 배경 사이즈 */}
        <div className="bg-white w-[1100px] max-w-[90%] min-h-[600px] rounded-2xl shadow-2xl flex overflow-hidden relative">

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-[26px] transition"
          >
            ✕
          </button>

          {/* 왼쪽: 배경 + 로고 글로우 */}
          <div
            className="w-[60%] relative overflow-hidden bg-[#B1D2FA] rounded-l-2xl"
            // style={{
            //   backgroundImage: `url(${planetImg})`,
            //   backgroundSize: 'cover',
            //   backgroundPosition: 'center',
            //   backgroundColor: '#FFE79D',
            // }}
          >
            {/* 중앙 정렬 컨테이너 */}
            <div className="absolute inset-0 grid place-items-center p-6">
              <button
                type="button"
                aria-label="두근두근 지구말 로고"
                onClick={onFlash}
                className="bg-transparent p-0 border-0 focus:outline-none"
              >
                <img
                  src={logoImg}
                  alt="두근두근 지구말"
                  className="logo-glow block w-[min(72vw,520px)] max-w-[300px] h-auto"
                  draggable="false"
                />
              </button>
            </div>
          </div>

          {/* 오른쪽 로그인 영역 */}
          <div className="flex-1 p-12 flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-[DungeonFighterOnlineBeatBeat] text-[#333] mb-4">
              간편 로그인 또는 회원가입
            </h2>

            {/* Google */}
            <button onClick={() => handleLogin('google')} className="w-full mb-4">
              <img
                src={googleLogo}
                className="w-full h-auto rounded-xl hover:scale-105 transition-transform"
                alt="구글 로그인"
              />
            </button>

            {/* Kakao */}
            <button onClick={() => handleLogin('kakao')} className="w-full mb-4">
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

      {/* 컴포넌트 내부 스타일(글로우/번쩍) */}
      <style>{`
        .logo-glow{
          transition: filter .25s ease, transform .25s ease, opacity .25s ease;
          filter:
            drop-shadow(0 2px 8px rgba(0,0,0,.12))
            drop-shadow(0 0 8px rgba(231,196,252,.35));
        }
        .logo-glow:hover,
        .logo-glow:focus-visible{
          filter:
            drop-shadow(0 3px 10px rgba(0,0,0,.14))
            drop-shadow(0 0 14px rgba(231,196,252,.55))
            drop-shadow(0 0 28px rgba(231,196,252,.35));
          transform: translateY(-1px);
          outline: none;
        }
        @keyframes flashGlow{
          0%   { filter: drop-shadow(0 0 12px rgba(231,196,252,.65)) drop-shadow(0 0 28px rgba(231,196,252,.45)); }
          60%  { filter: drop-shadow(0 0 28px rgba(231,196,252,.85)) drop-shadow(0 0 48px rgba(231,196,252,.55)); }
          100% { filter: drop-shadow(0 2px 8px rgba(0,0,0,.12)) drop-shadow(0 0 8px rgba(231,196,252,.35)); }
        }
        .is-pressed{ animation: flashGlow .35s ease-out; }
        @media (prefers-reduced-motion: reduce){
          .logo-glow,
          .logo-glow:hover,
          .logo-glow:focus-visible{
            transition:none !important; transform:none !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default LoginModal;
