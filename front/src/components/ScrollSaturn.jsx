import { useEffect, useState } from 'react'
import saturn from '../assets/saturn.png'

/**
 * 윈도우 스크롤 위치에 따라 "스크롤바 바로 위"에서 떠다니는 토성 아이콘 + 노란색 채워지는 진행바
 * - 기본 스크롤바는 그대로 두고, 오른쪽에 커스텀 스크롤 진행 표시를 따로 그려줌
 */
function ScrollSaturn() {
  const [visible, setVisible] = useState(false)
  const [topPx, setTopPx] = useState(0)
  const [progress, setProgress] = useState(0) // 0 ~ 1

  useEffect(() => {
    const ICON_SIZE = 32 // w-8 h-8

    const handleScroll = () => {
      const doc = document.documentElement
      const scrollTop = window.scrollY || doc.scrollTop || 0
      const scrollable = doc.scrollHeight - doc.clientHeight

      if (scrollable <= 0) {
        setVisible(false)
        setProgress(0)
        return
      }

      const rawProgress = scrollTop / scrollable
      const clamped = Math.max(0, Math.min(1, rawProgress))

      // 아이콘 중심이 화면 위/아래에 딱 붙지 않도록, 아이콘 높이 절반 만큼만 여유
      const margin = ICON_SIZE / 1
      const maxY = window.innerHeight - margin
      const minY = margin
      const y = minY + (maxY - minY) * clamped

      setVisible(true)
      setTopPx(y)
      setProgress(clamped)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  const trackRight = 18 // 실제 스크롤바 바로 왼쪽에 얇은 진행바를 붙임

  return (
    <>
      {/* 스크롤 진행도에 따라 위에서부터 노란색으로 채워지는 커스텀 스크롤바 배경 */}
      <div
        style={{
          position: 'fixed',
          right: `${trackRight}px`,
          top: '35px',
          bottom: '20px',
          width: '10px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.4)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.01)',
          zIndex: 9998,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: `${progress * 100}%`,
            borderRadius: '999px',
            background: 'linear-gradient(180deg, #FEEBB1 0%, #B1D2FA 100%)',
            boxShadow: '0 0 6px rgba(255, 193, 7, 0.01)'
          }}
        />
      </div>

      {/* 스크롤바 바로 위에 올라탄 것처럼 보이는 토성 아이콘 */}
      <div
        style={{
          position: 'fixed',
          right: '3px', // 조금 더 오른쪽(화면 바깥 방향)으로 밀어서 스크롤바 쪽에 더 가까이
          top: `${topPx}px`,
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        <img
          src={saturn}
          alt="스크롤 토성"
          className="w-full h-7 drop-shadow-lg"
        />
      </div>
    </>
  )
}

export default ScrollSaturn




