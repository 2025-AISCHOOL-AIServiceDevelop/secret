import { useEffect, useRef, useState } from 'react'
import { useTutorStore } from '../stores'
import {
  Mic,
  StopCircle,
  RefreshCw,
  Frown,
  Loader2,
} from 'lucide-react'
import level1 from '../assets/level1.png'
import level2 from '../assets/level2.png'
import level3 from '../assets/level3.png'

const AZURE_LANGUAGE_MAP = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
  vi: 'vi-VN',
  th: 'th-TH',
  ru: 'ru-RU',
  es: 'es-ES',
  fr: 'fr-FR',
}

const normalizeScore = (value) => {
  if (value === null || value === undefined) return null
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return null
  return Math.round(numeric)
}

/**
 * VoiceRecordingBanner - 유아용 음성 녹음 전용 배너
 * 영상과 스크립트 목록 하단에 배치되며, 귀여운 캐릭터와 함께 녹음 기능 제공
 */
function VoiceRecordingBanner({ script, contentsId, language = 'en', userId, onAnalyzed, onRecordingStart, onContinueVideo }) {
  const canvasRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const rafRef = useRef(null)
  const chunksRef = useRef([])

  const { recordingState, startRecording, stopRecording, resetRecording, analyzePronunciation, isAnalyzing } = useTutorStore()

  const [localScore, setLocalScore] = useState(null)
  const [localAccuracy, setLocalAccuracy] = useState(null)
  const [localFluency, setLocalFluency] = useState(null)
  const [localCompleteness, setLocalCompleteness] = useState(null)
  const [localMedal, setLocalMedal] = useState(null)
  const [localFeedbackText, setLocalFeedbackText] = useState('')
  const [localScriptText, setLocalScriptText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingTimerRef = useRef(null)
  const waveformHistoryRef = useRef([])

  const displayedScript = (localScriptText || script?.text || '').trim()
  const scriptWords = displayedScript ? displayedScript.split(/\s+/) : []
  const wordGapClass =
    scriptWords.length <= 3 ? 'gap-10' : scriptWords.length <= 6 ? 'gap-6' : 'gap-4'

  useEffect(() => {
    return () => {
      cleanup()
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  const start = async () => {
    if (!script) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/webm;codecs=opus'
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorder.start(100)

      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser
      source.connect(analyser)

      drawWaveform()
      startRecording()
      setLocalScore(null)
      setLocalAccuracy(null)
      setLocalFluency(null)
      setLocalCompleteness(null)
      setLocalMedal(null)
      setLocalFeedbackText('')
      setLocalScriptText(script?.text ?? '')
      setErrorMessage('')
      setRecordingTime(0)
      waveformHistoryRef.current = []
      
      // 녹음 시간 타이머 시작
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          // 30초 초과 시 자동 중지
          if (newTime >= 30) {
            stop()
            return 0
          }
          return newTime
        })
      }, 1000)
      
      // 녹음 시작 시 부모 컴포넌트에 알림
      if (onRecordingStart) {
        onRecordingStart();
      }
    } catch (err) {
      console.error('Microphone access failed', err)
      setErrorMessage('마이크 접근 권한이 필요해요!')
    }
  }

  const stop = async () => {
    if (!mediaRecorderRef.current) return
    
    // 타이머 정지
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    
    const recorder = mediaRecorderRef.current
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
      
      // 녹음 파일 크기 체크
      if (blob.size < 1000) {
        setErrorMessage('녹음이 너무 짧아요! 다시 시도해주세요.')
        cleanup()
        resetRecording()
        return
      }
      
      const file = new File([blob], 'recording.webm', { type: blob.type })
      
      try {
        const scriptId = script?.id || script?.scriptId
        if (!scriptId) {
          console.error('Script ID is missing')
          setErrorMessage('스크립트 정보가 없습니다. 다시 시도해주세요.')
          cleanup()
          resetRecording()
          return
        }

        if (!userId) {
          console.error('User ID is missing')
          setErrorMessage('사용자 정보를 불러올 수 없어요. 다시 로그인해주세요.')
          cleanup()
          resetRecording()
          return
        }

        const preferredLanguage = script?.language || language
        const languageKey = typeof preferredLanguage === 'string' ? preferredLanguage.toLowerCase() : ''
        const fallbackLanguageKey = typeof language === 'string' ? language.toLowerCase() : ''
        const azureLanguage =
          AZURE_LANGUAGE_MAP[languageKey] ||
          AZURE_LANGUAGE_MAP[fallbackLanguageKey] ||
          preferredLanguage ||
          'en-US'

        const res = await analyzePronunciation(file, userId, contentsId, scriptId, azureLanguage)
        const score = normalizeScore(res?.finalScore ?? res?.score) ?? 0
        const accuracyScore = normalizeScore(res?.accuracy)
        const fluencyScore = normalizeScore(res?.fluency)
        const completenessScore = normalizeScore(res?.completeness)

        setLocalScore(score)
        setLocalAccuracy(accuracyScore)
        setLocalFluency(fluencyScore)
        setLocalCompleteness(completenessScore)
        const medal = res?.medal ? String(res.medal).toUpperCase() : null
        setLocalMedal(medal)
        // 백엔드에서 내려준 평가 문구를 그대로 사용
        setLocalFeedbackText(res?.feedbackText ?? res?.overallComment ?? '')
        setLocalScriptText(res?.scriptText ?? script?.text ?? '')
        setErrorMessage('')
        if (onAnalyzed) onAnalyzed(res, script)
      } catch (e) {
        console.error('Analyze failed', e)
        setErrorMessage(e.message || '발음 분석 중 오류가 발생했습니다. 다시 시도해주세요!')
        setLocalScore(null)
        setLocalFeedbackText('')
        setLocalAccuracy(null)
        setLocalFluency(null)
        setLocalCompleteness(null)
        setLocalMedal(null)
      } finally {
        cleanup()
        resetRecording()
      }
    }
    recorder.stop()
    stopRecording()
  }

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
      } catch (error) {
        console.warn('AudioContext cleanup error:', error)
      }
      audioContextRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    analyserRef.current = null
    mediaRecorderRef.current = null
    waveformHistoryRef.current = []
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return
    const ctx = canvas.getContext('2d')
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)

      // 현재 프레임의 평균 볼륨 계산 (0 ~ 1)
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128 // -1 ~ 1 근처
        sum += Math.abs(v)
      }
      const avgVolume = sum / bufferLength

      // 누적 히스토리에 추가 (최대 canvas.width 포인트 유지)
      const history = waveformHistoryRef.current
      history.push(avgVolume)
      const maxPoints = canvas.width
      if (history.length > maxPoints) {
        history.shift()
      }

      // 배경
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#c8dafc'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (history.length === 0) return

      // 누적 라인 그래프 그리기 (변동을 크게 보기 위해 스케일 업)
      const midY = canvas.height / 2
      const amplitude = canvas.height * 0.45
      const stepX = history.length > 1 ? canvas.width / (history.length - 1) : canvas.width

      ctx.lineWidth = 4
      ctx.strokeStyle = '#b54cff'
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.beginPath()

      history.forEach((value, idx) => {
        // 변화가 더 크게 보이도록 비선형 스케일 적용
        const boosted = Math.min(1, Math.pow(value, 0.5) * 1.8)
        const x = idx * stepX
        const y = midY - boosted * amplitude
        if (idx === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }
    draw()
  }

  const getMedalIcon = (medal) => {
    const className = "w-40 h-40 object-contain drop-shadow-lg -mt-2"
    if (medal === 'GOLD') {
      return <img src={level3} alt="골드 레벨 배지" className={className} />
    }
    if (medal === 'SILVER') {
      return <img src={level2} alt="실버 레벨 배지" className={className} />
    }
    if (medal === 'BRONZE') {
      return <img src={level1} alt="브론즈 레벨 배지" className={className} />
    }
    // 메달 정보가 없을 때는 기본 레벨1 이미지 사용
    return <img src={level1} alt="연습 레벨 배지" className={className} />
  }

return (
  <div
    className="rounded-[50px] shadow-md transition-all flex flex-col px-5 py-7 mb-7 relative"
    style={{
      backgroundColor: '#c8dafc',
      borderColor: recordingState === 'recording' ? '#ffe9a9' : '#e0e7ff',
    }}
  >
    {/* 상단 한 줄: 왼쪽 문구 + 가운데 버튼/타이머 */}
    <div className="relative flex items-center justify-center mb-3 w-full">
      {/* 왼쪽: 안내 문구 (녹음 중일 때는 숨김) */}
      {recordingState !== 'recording' && (
        <div className="absolute left-5 -top-1">
          <span className="text-[30px] font-DnfBitbeatV2 text-[#FFF59D] drop-shadow-sm">
            녹음을 눌러서 따라서 말해봐요!
          </span>
        </div>
      )}

      {/* 가운데: 버튼 + 타이머 */}
      <div className="flex items-center gap-4">
        {recordingState === 'recording' ? (
          <button
            onClick={stop}
            className="
              px-9 py-4 rounded-4xl
              bg-gradient-to-r from-[#FFE79D] to-[#ffe9abff]
              border-5 border-[#ffda6cff]
              shadow-lg hover:shadow-xl
              transform hover:scale-120 active:scale-100
              transition-all
              disabled:opacity-80 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            <StopCircle className="w-8 h-8 text-[#df8b37]" />
            <span className="font-DnfBitbeatV2 text-3xl record-label">
              녹음 멈추기
            </span>
          </button>
        ) : (
          <button
            onClick={start}
            disabled={!script || isAnalyzing}
            className="
              px-9 py-4 rounded-4xl
              bg-gradient-to-r from-[#FFE79D] to-[#ffe9abff]
              border-5 border-[#ffda6cff]
              shadow-lg hover:shadow-xl
              transform hover:scale-120 active:scale-100
              transition-all
              disabled:opacity-80 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            <Mic className="w-8 h-8 text-[#df8b37]" />
            <span className="font-DnfBitbeatV2 text-3xl record-label">
              녹음 시작!
            </span>
          </button>
        )}

        {recordingState === 'recording' && (
          <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFF9E6] rounded-xl border-2 border-[#FFE082] shadow-sm">
            <div className="w-2 h-2 bg-[#FFD54F] rounded-full animate-pulse" />
            <span className="text-sm text-[#F57C00]">{recordingTime} 초</span>
          </div>
        )}
      </div>
    </div>

    {/* 가운데: 파형 + 파란 문장 (간격 좁게) */}
    <div className="mt-2 flex flex-col items-center gap-2 w-full">
      {/* 파형 */}
      <div className="relative h-[70px] w-full">
        <canvas
          ref={canvasRef}
          width={1000}
          height={80}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* 파란 문장 (녹음 중일 때만) */}
      {recordingState === 'recording' && scriptWords.length > 0 && (
        <div
          className={`flex flex-wrap items-center justify-center px-6 ${wordGapClass}`}
        >
          {scriptWords.map((word, idx) => (
            <span
              key={`${word}-${idx}`}
              className="text-[32px] text-[#337AF7]"
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>

    {/* ==== 아래부터는 기존 오버레이/결과 코드 그대로 유지 ==== */}





{isAnalyzing && (
  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-[50px] flex items-center justify-center z-10 p-4">
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-3xl">
      
      {/* 🚀 로켓 애니메이션 */}
      <div className="rocket">
        <div className="rocket-body">
          <div className="body"></div>
          <div className="fin fin-left"></div>
          <div className="fin fin-right"></div>
          <div className="window"></div>
        </div>
        <div className="exhaust-flame"></div>

        <ul className="exhaust-fumes">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>

        <ul className="star">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>

      {/* 🔵 오른쪽 텍스트 */}
      <div className="flex-1 flex justify-center md:justify-end">
      <div className="text-center md:text-left text-xl md:text-2xl text-[#337AF7] font-DnfBitbeatV2 leading-relaxed ">
        <div>AI 선생님이 확인 중!</div>
        <div className="mt-1">조금만 기다려~♪</div>
      </div>
    </div>
  </div>
  </div>
)}









    {errorMessage && !isAnalyzing && (
      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[50px] flex items-center justify-center z-10 p-4">
        <div className="text-center">
          <Frown className="w-12 h-12 mx-auto mb-2 text-[#F57C00]" />
          <div className="text-xl text-[#F57C00] mb-3 ">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage('')}
            className="px-10 py-1 rounded-lg bg-gradient-to-r from-[#66ADFF] to-[#66ADFF] text-white text-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
          >
            확인
          </button>
        </div>
      </div>
    )}

    {localScore !== null && !isAnalyzing && !errorMessage && (
      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[50px] flex items-center justify-center z-10 p-4">
        <div className="w-full h-auto grid grid-cols-[auto_1fr_auto] gap-4 items-stretch">
          <div className="flex flex-col items-center justify-center px-4">
            {getMedalIcon(localMedal)}
          </div>

          <div className="flex flex-col gap-2.5 justify-center mt-4">
            <div className="flex items-center gap-3">
              <span className="text-[32px] text-[#337AF7] ">나의 점수는</span>
              <span className="text-[32px] text-[#337AF7]">
                {localScore}
              </span>
            </div>

            {localFeedbackText && (
              <div className="mt-auto text-[44px] leading-relaxed text-[#B8A3FE] mb-2">
                {localFeedbackText}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center items-end gap-3 pr-10">
            <button
              onClick={start}
              className="w-50 px-5 py-3 rounded-3xl bg-gradient-to-r from-[#74c0e4ff] to-[#4FC3F7] border-5 border-[#5c97fdff] text-white text-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-6 h-6" />
              다시 도전
            </button>
            {onContinueVideo && (
              <button
                onClick={() => {
                  setLocalScore(null);
                  setLocalFeedbackText('');
                  setLocalAccuracy(null);
                  setLocalFluency(null);
                  setLocalCompleteness(null);
                  setLocalMedal(null);
                  setErrorMessage('');

                  // ✅ 현재 문장(script)을 함께 넘기기
                  if (script) {
                    onContinueVideo(script);
                  } else {
                    onContinueVideo(); // 혹시 모를 fallback (원래 동작)
                  }
                }}
                className="w-50 px-5 py-3 rounded-3xl bg-gradient-to-r from-[#FFE082] to-[#FFECB3] border-5 border-[#FFD54F] text-[#F57C00] text-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
              >
                이어서 따라하기
              </button>
            )}


          </div>
        </div>
      </div>
    )}
  </div>
)

}

export default VoiceRecordingBanner

