import { createPortal } from "react-dom";
import kakaoLogo from '../../assets/kakao.png';
import googleLogo from '../../assets/google.png';
import planetImg from '../../assets/planet.png';
import logoImg from '../../assets/rogo.png'; // 두근두근 지구말 PNG (투명)
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
        <div className="bg-white w-[1100px] max-w-[90%] min-h-[500px] rounded-2xl shadow-2xl flex overflow-hidden relative">

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
            className="w-[60%] relative overflow-hidden bg-[#B1D2FA] rounded-l-2xl"
            style={{
              // backgroundImage: `url(${planetImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
              
            }}
            
          >
            
            {/* 중앙 정렬 컨테이너 */}
            <div className="absolute inset-0 flex flex-col items-center text-xl justify-center gap-4
                            transform translate-y-10 sm:translate-y-5">
              <div className="relative flex flex-col items-center">
              <div className="earth">
                <div className="earth-loader">
                  {/* SVG 1 */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <path
                      transform="translate(100 100)"
                      d="M29.4,-17.4C33.1,1.8,27.6,16.1,11.5,31.6C-4.7,47,-31.5,63.6,-43,56C-54.5,48.4,-50.7,16.6,-41,-10.9C-31.3,-38.4,-15.6,-61.5,-1.4,-61C12.8,-60.5,25.7,-36.5,29.4,-17.4Z"
                      fill="#fcf9f0ff"
                      fill-opacity="0.35"
                    ></path>
                  </svg>
                  {/* SVG 2 */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <path
                      transform="translate(100 100)"
                      d="M31.7,-55.8C40.3,-50,45.9,-39.9,49.7,-29.8C53.5,-19.8,55.5,-9.9,53.1,-1.4C50.6,7.1,43.6,14.1,41.8,27.6C40.1,41.1,43.4,61.1,37.3,67C31.2,72.9,15.6,64.8,1.5,62.2C-12.5,59.5,-25,62.3,-31.8,56.7C-38.5,51.1,-39.4,37.2,-49.3,26.3C-59.1,15.5,-78,7.7,-77.6,0.2C-77.2,-7.2,-57.4,-14.5,-49.3,-28.4C-41.2,-42.4,-44.7,-63,-38.5,-70.1C-32.2,-77.2,-16.1,-70.8,-2.3,-66.9C11.6,-63,23.1,-61.5,31.7,-55.8Z"
                      fill="#fcf9f0ff"
                      fill-opacity="0.35"
                    ></path>
                  </svg>
                  {/* SVG 3 */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <path
                      transform="translate(100 100)"
                      d="M30.6,-49.2C42.5,-46.1,57.1,-43.7,67.6,-35.7C78.1,-27.6,84.6,-13.8,80.3,-2.4C76.1,8.9,61.2,17.8,52.5,29.1C43.8,40.3,41.4,53.9,33.7,64C26,74.1,13,80.6,2.2,76.9C-8.6,73.1,-17.3,59,-30.6,52.1C-43.9,45.3,-61.9,45.7,-74.1,38.2C-86.4,30.7,-92.9,15.4,-88.6,2.5C-84.4,-10.5,-69.4,-20.9,-60.7,-34.6C-52.1,-48.3,-49.8,-65.3,-40.7,-70C-31.6,-74.8,-15.8,-67.4,-3.2,-61.8C9.3,-56.1,18.6,-52.3,30.6,-49.2Z"
                      fill="#fcf9f0ff"
                      fill-opacity="0.35"
                    ></path>
                  </svg>
                  {/* SVG 4 */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <path
                      transform="translate(100 100)"
                      d="M39.4,-66C48.6,-62.9,51.9,-47.4,52.9,-34.3C53.8,-21.3,52.4,-10.6,54.4,1.1C56.3,12.9,61.7,25.8,57.5,33.2C53.2,40.5,39.3,42.3,28.2,46C17,49.6,8.5,55.1,1.3,52.8C-5.9,50.5,-11.7,40.5,-23.6,37.2C-35.4,34,-53.3,37.5,-62,32.4C-70.7,27.4,-70.4,13.7,-72.4,-1.1C-74.3,-15.9,-78.6,-31.9,-73.3,-43C-68.1,-54.2,-53.3,-60.5,-39.5,-60.9C-25.7,-61.4,-12.9,-56,1.1,-58C15.1,-59.9,30.2,-69.2,39.4,-66Z"
                      fill="#fcf9f0ff"
                      fill-opacity="0.35"
                    ></path>
                  </svg>
                </div>
                
                </div>
              </div>
              <div className="text-[#ffffffff] flex flex-col items-center justify-center gap-4 ">
              
            {/* <button
              type="button"
              aria-label="두근두근 지구말 로고"
              onClick={onFlash}
              className="bg-transparent p-0 border-0 focus:outline-none -mt-6 md:-mt-8 z-10"
            >
              <img
                src={logoImg}
                alt="두근두근 지구말"
                className="logo-glow block w-[min(20vw,520px)] max-w-[200px] h-auto -mt-6 "
                draggable="false"
            </button> */}
            <div className="mt-8 md:mt-10 text-[#535455ff] text-center">
              <p className="text-sm md:text-base">어린이들을 위한 다국어 학습 플랫폼</p>
              <p className="text-sm md:text-base">
                재미있고 유쾌한 전래동화와 함께 다양한 언어를 말해보아요!
              </p>
            </div>
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
