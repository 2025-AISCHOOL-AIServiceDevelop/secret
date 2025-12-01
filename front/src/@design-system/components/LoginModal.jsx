import { createPortal } from "react-dom";
import kakaoLogo from '../../assets/kakao.png';
import googleLogo from '../../assets/google.png';
import logoImg from '../../assets/rogo.png'; // 두근두근 지구말 PNG (투명)
import homeImg from '../../assets/home.png';
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center login-earth pt-10 md:pt-16">
      <div className="relative flex items-center gap-6 translate-x-10">
        {/* 로그인 배경 사이즈 */}
        <div className="bg-white w-[1200px] max-w-[90%] h-[600px] rounded-2xl shadow-2xl flex overflow-hidden relative">

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-[26px] transition"
            aria-label="닫기"
          >
            ✕
          </button>

          {/* 왼쪽: 지구 로더 */}
          <div
            className="w-[60%] h-full relative overflow-hidden rounded-l-2xl"
            style={{
              backgroundImage: `url(${homeImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >


            
            {/* 중앙 정렬 컨테이너 */}
            <div className="absolute inset-0 flex flex-col items-center text-xl justify-center gap-4
                            transform translate-y-10 sm:translate-y-5">
              <div className="relative flex flex-col items-center">
              </div>
            </div>
            
          </div>

          {/* 오른쪽 로그인 영역 */}
          <div className="flex-1 p-10 flex flex-col justify-center items-center text-center">
            <button
              type="button"
              aria-label="두근두근 지구말 로고"
              onClick={onFlash}
              className="bg-transparent p-0 border-0 focus:outline-none -mt-6 md:-mt-3 z-10"
            >
              <img
                src={logoImg}
                alt="두근두근 지구말"
                className="logo-glow block w-[min(20vw,520px)] max-w-[170px] h-auto mb-0 mt-0 "
                draggable="false"
              />
            </button>

            <h2 className="text-2xl font-[DungeonFighterOnlineBeatBeat] text-[#333] mb-3">
              {/* 간편 로그인 / 회원가입 */}
            </h2>

            {/* Google */}
            <button onClick={() => handleLogin('google')} className="w-full mt-2 ">
              <img
                src={googleLogo}
                className="w-full h-auto rounded-xl hover:scale-105 transition-transform"
                alt="구글 로그인"
              />
            </button>

            {/* Kakao */}
            <button onClick={() => handleLogin('kakao')} className="w-full mt-3 mb-6">
              <img
                src={kakaoLogo}
                className="w-full h-auto rounded-xl hover:scale-105 transition-transform"
                alt="카카오 로그인"
              />
            </button>

            <p className="text-xs text-gray-500 mt-0 leading-relaxed">
              로그인 시 서비스 이용약관 및<br />개인정보 처리방침에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 컴포넌트 내부 스타일(글로우/번쩍 + 지구로더) */}
      <style>{`
        /* ---------- 로고 글로우 ---------- */
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

        /* ---------- 지구 로더 (원본 CSS를 범위 내로 스코프) ---------- */
        .login-earth .earth-loader {
          --watercolor: #baa7ffff;
          --watercolor-alpha: 9;        /* 투명도(0~1) */
          --landcolor: #fffebaff;
          width: 7.5em;
          height: 7.5em;
          background-color: var(--watercolor);
          position: relative;
          overflow: hidden;
          border-radius: 50%;
          box-shadow:
            inset 0em 0.5em rgba(255, 255, 255, 0.25),
            inset 0em -0.5em rgba(0, 0, 0, 0.25);
          border: solid 0.15em white;
          animation: startround 1s;
          animation-iteration-count: 1;
        }
          
        .login-earth .earth p {
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-top: 0.5em;
          font-size: 1.0em;
          font-family: "Gill Sans","Gill Sans MT",Calibri,"Trebuchet MS",sans-serif;
        }
        .login-earth .earth-loader svg:nth-child(1) {
          position: absolute;
          bottom: -2em;
          width: 7em;
          height: auto;
          animation: round1 5s infinite linear 0.75s;
        }
        .login-earth .earth-loader svg:nth-child(2) {
          position: absolute;
          top: -3em;
          width: 7em;
          height: auto;
          animation: round1 5s infinite linear;
        }
        .login-earth .earth-loader svg:nth-child(3) {
          position: absolute;
          top: -2.5em;
          width: 7em;
          height: auto;
          animation: round2 5s infinite linear;
        }
        .login-earth .earth-loader svg:nth-child(4) {
          position: absolute;
          bottom: -2.2em;
          width: 7em;
          height: auto;
          animation: round2 5s infinite linear 0.75s;
        }

        @keyframes startround {
          0% { filter: brightness(500%); box-shadow: none; }
          75% { filter: brightness(500%); box-shadow: none; }
          100% {
            filter: brightness(100%);
            box-shadow:
              inset 0em 0.5em rgba(255, 255, 255, 0.25),
              inset 0em -0.5em rgba(0, 0, 0, 0.25);
          }
        }
        @keyframes round1 {
          0%   { left: -2em; opacity: 1; transform: skewX(0deg) rotate(0deg); }
          30%  { left: -6em; opacity: 1; transform: skewX(-25deg) rotate(25deg); }
          31%  { left: -6em; opacity: 0; transform: skewX(-25deg) rotate(25deg); }
          35%  { left: 7em;  opacity: 0; transform: skewX(25deg) rotate(-25deg); }
          45%  { left: 7em;  opacity: 1; transform: skewX(25deg) rotate(-25deg); }
          100% { left: -2em; opacity: 1; transform: skewX(0deg) rotate(0deg); }
        }
        @keyframes round2 {
          0%   { left: 5em; opacity: 1; transform: skewX(0deg) rotate(0deg); }
          75%  { left: -7em; opacity: 1; transform: skewX(-25deg) rotate(25deg); }
          76%  { left: -7em; opacity: 0; transform: skewX(-25deg) rotate(25deg); }
          77%  { left: 8em;  opacity: 0; transform: skewX(25deg) rotate(-25deg); }
          80%  { left: 8em;  opacity: 1; transform: skewX(25deg) rotate(-25deg); }
          100% { left: 5em; opacity: 1; transform: skewX(0deg) rotate(0deg); }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default LoginModal;
