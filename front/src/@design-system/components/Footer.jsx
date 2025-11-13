import { Link } from 'react-router-dom'
import { memo } from 'react'

// Footer component
export const Footer = memo(() => {
  return (
    <footer className="bg-[#5E5A6A]  py-8 border-[3px] border-[#5E5A6A] rounded-[18px] shadow-sm w-full">
      <div className="w-full max-w-screen-2xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/rogo.png" alt="두근두근 지구말" className="h-12 w-auto" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              어린이를 위한 다국어 학습 플랫폼입니다.
              동화를 통해 자연스럽게 외국어를 배워보세요!
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-[#ffd857] mb-4">메뉴</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  홈
                </Link>
              </li>
              <li>
                <Link to="/player" className="text-gray-300 hover:text-white transition-colors text-sm">
                  동화 재생
                </Link>
              </li>
              <li>
                <Link to="/mypage" className="text-gray-300 hover:text-white transition-colors text-sm">
                  마이페이지
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-[#ffd857] mb-4">고객지원</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@dugeunji.com" className="text-gray-300 hover:text-white transition-colors text-sm">
                  문의하기
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-600 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 두근두근 지구말. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">페이스북</span>
              📘
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">인스타그램</span>
              📷
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">유튜브</span>
              📺
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
})

Footer.displayName = 'Footer'

export default Footer