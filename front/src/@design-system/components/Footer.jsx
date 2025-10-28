import { Caption } from './Typography'

// Footer component
export const Footer = () => {
  return (
    <footer className="bg-header border-t-2 border-headerBorder">
      <div className="w-full max-w-screen-2xl mx-auto px-5 py-3">
        <Caption className="text-[#6c5d3d]">
          모든 이미지는 두근두근 지구말의 소유로 임의 복제 또는 배포를 금합니다.
        </Caption>
      </div>
    </footer>
  )
}

export default Footer
