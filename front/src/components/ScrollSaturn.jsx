import { useEffect, useState } from 'react'
import saturn from '../assets/saturn.png'

function ScrollSaturn() {
  const [visible, setVisible] = useState(false)
  const [topPx, setTopPx] = useState(0)
  const [progress, setProgress] = useState(0) // 0 ~ 1
  const [isDragging, setIsDragging] = useState(false)

  // 토성이 움직일 수 있는 세로 범위용 상수
  const ICON_SIZE = 28;       // 토성 아이콘 높이(대략) - h-7 → 28px
  const PADDING_TOP = 35;     // 화면 위에서 35px 떨어진 곳부터
  const PADDING_BOTTOM = 20;  // 화면 아래에서 20px 위까지만

  // 마우스 Y 위치를 → 스크롤 위치로 바꿔주는 헬퍼
  const scrollFromClientY = (clientY) => {
    const doc = document.documentElement
    const scrollable = doc.scrollHeight - doc.clientHeight
    if (scrollable <= 0) return

    const minY = PADDING_TOP + ICON_SIZE / 2
    const maxY = window.innerHeight - PADDING_BOTTOM - ICON_SIZE / 2

    const clampedY = Math.max(minY, Math.min(maxY, clientY))
    const ratio = (clampedY - minY) / (maxY - minY) // 0 ~ 1

    const newScrollTop = ratio * scrollable
    window.scrollTo({ top: newScrollTop, behavior: 'auto' })
  }

  useEffect(() => {
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

      const minY = PADDING_TOP + ICON_SIZE / 2
      const maxY = window.innerHeight - PADDING_BOTTOM - ICON_SIZE / 2
      const y = minY + (maxY - minY) * clamped

      setVisible(true)
      setTopPx(y)
      setProgress(clamped)
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return
      scrollFromClientY(e.clientY)
    }

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (!visible) return null

  const trackRight = 18

  // 막대/토성을 눌렀을 때 드래그 시작
  const startDrag = (e) => {
    e.preventDefault()
    setIsDragging(true)
    scrollFromClientY(e.clientY)
  }

  return (
    <>
      {/* 노란 진행바 트랙 */}
      <div
        onMouseDown={startDrag}
        style={{
          position: 'fixed',
          right: `${trackRight}px`,
          top: `${PADDING_TOP}px`,        // 🔴 고정된 시작 위치
          bottom: `${PADDING_BOTTOM}px`,  // 🔴 고정된 끝 위치
          width: '10px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.4)',
          // boxShadow: '0 0 0 1px rgba(0,0,0,0.01)',
          zIndex: 9998,
          pointerEvents: 'auto',
          cursor: 'pointer'
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
          }}
        />
      </div>

      {/* 토성 아이콘 */}
      <div
        onMouseDown={startDrag}
        style={{
          position: 'fixed',
          right: '3px',
          top: `${topPx - ICON_SIZE / 2}px`, // 중심 y값 기준 → 실제 top 보정
          zIndex: 9999,
          pointerEvents: 'auto',
          cursor: 'grab'
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
