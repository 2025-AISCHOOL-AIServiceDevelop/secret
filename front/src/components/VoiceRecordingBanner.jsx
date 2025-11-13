import { useEffect, useRef, useState } from 'react'
import { useTutorStore } from '../stores'
import {
  Mic,
  StopCircle,
  Award,
  RefreshCw,
  Frown,
  Loader2,
  FileText,
  MessageCircle,
  Star,
  ThumbsUp,
  Smile,
  Sparkles
} from 'lucide-react'

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
  const [localMessage, setLocalMessage] = useState('')
  const [localFeedbackText, setLocalFeedbackText] = useState('')
  const [localScriptText, setLocalScriptText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingTimerRef = useRef(null)

  const breakdownItems = [
    { label: '정확도', value: localAccuracy, color: '#81D4FA' },
    { label: '유창성', value: localFluency, color: '#BA68C8' },
    { label: '완성도', value: localCompleteness, color: '#FFD54F' }
  ]

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
      setLocalMessage('')
      setLocalFeedbackText('')
      setLocalScriptText(script?.text ?? '')
      setErrorMessage('')
      setRecordingTime(0)
      
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

        setLocalScore(score)
        setLocalAccuracy(normalizeScore(res?.accuracy))
        setLocalFluency(normalizeScore(res?.fluency))
        setLocalCompleteness(normalizeScore(res?.completeness))
        const medal = res?.medal ? String(res.medal).toUpperCase() : null
        setLocalMedal(medal)
        const messageObj = buildMessage(score, medal)
        setLocalMessage(messageObj)
        setLocalFeedbackText(res?.feedbackText ?? '')
        setLocalScriptText(res?.scriptText ?? script?.text ?? '')
        setErrorMessage('')
        if (onAnalyzed) onAnalyzed(res, script)
      } catch (e) {
        console.error('Analyze failed', e)
        setErrorMessage(e.message || '발음 분석 중 오류가 발생했습니다. 다시 시도해주세요!')
        setLocalScore(null)
        setLocalMessage(null)
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

  const buildMessage = (score, medal) => {
    if (medal === 'GOLD' || score >= 90) return { icon: Star, text: '와우! 정말 완벽해요! 천재인가요?' }
    if (medal === 'SILVER' || score >= 75) return { icon: ThumbsUp, text: '정말 잘했어요! 조금만 더 연습하면 완벽해요!' }
    if (score >= 60) return { icon: Smile, text: '좋아요! 다시 한번 또박또박 말해볼까요?' }
    return { icon: Sparkles, text: '괜찮아요! 천천히 따라 해봐요!' }
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
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return
    const ctx = canvas.getContext('2d')
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 귀여운 배경 그라디언트
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#fff5f5')
      gradient.addColorStop(0.5, '#ffe8f0')
      gradient.addColorStop(1, '#fff0e8')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 중앙선
      const centerY = canvas.height / 2
      ctx.strokeStyle = '#ffc0cb'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(canvas.width, centerY)
      ctx.stroke()
      ctx.setLineDash([])

      // 귀여운 파도 모양 막대 그래프
      const barCount = 40
      const barWidth = canvas.width / barCount
      const barSpacing = 4
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength)
        const value = dataArray[dataIndex]
        const normalizedValue = value / 255
        const barHeight = normalizedValue * (canvas.height * 0.7)
        
        const x = i * barWidth
        const y = centerY - barHeight / 2
        
        // 무지개 색상 (유아 친화적)
        const hue = (i / barCount) * 360
        const saturation = 70 + normalizedValue * 30
        const lightness = 60 + normalizedValue * 20
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`
        
        // 둥근 모서리 막대
        ctx.beginPath()
        ctx.roundRect(x + barSpacing / 2, y, barWidth - barSpacing, barHeight, [8, 8, 8, 8])
        ctx.fill()

        // 반짝이는 효과
        if (normalizedValue > 0.5) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.beginPath()
          ctx.roundRect(x + barSpacing / 2, y, barWidth - barSpacing, barHeight * 0.3, [8, 8, 0, 0])
          ctx.fill()
        }
      }
    }
    draw()
  }

  const getMedalIcon = (medal) => {
    const className = "w-12 h-12"
    if (medal === 'GOLD') return <Award className={`${className} text-yellow-400 fill-yellow-400`} />
    if (medal === 'SILVER') return <Award className={`${className} text-gray-400 fill-gray-400`} />
    if (medal === 'BRONZE') return <Award className={`${className} text-orange-600 fill-orange-600`} />
    return <Award className={`${className} text-purple-400 fill-purple-400`} />
  }

  return (
    <div className="h-full rounded-[16px] p-3 border-2 shadow-md transition-all flex overflow-hidden gap-3 relative" 
         style={{ 
           background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 25%, #FFF9E6 50%, #E1F5FE 75%, #FCE4EC 100%)',
           borderColor: recordingState === 'recording' ? '#FFE082' : '#81D4FA'
         }}>
      
      {/* 왼쪽: 스크립트 + 녹음 버튼 */}
      <div className="flex-1 flex flex-col gap-2">
        {/* 스크립트 표시 */}
        {script ? (
          <div className="flex-1 p-3 bg-white/95 rounded-lg border-2 border-[#81D4FA] overflow-y-auto shadow-sm">
            <div className="text-base font-bold text-[#01579B] leading-relaxed">
              {script.text}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-3 bg-[#E1F5FE] rounded-lg border-2 border-[#B3E5FC] flex items-center justify-center">
            <div className="text-sm text-[#0277BD]">스크립트를 선택해주세요</div>
          </div>
        )}
        
        {/* 녹음 버튼 */}
        {recordingState === 'recording' ? (
          <button 
            onClick={stop} 
            className="py-3 rounded-lg bg-gradient-to-r from-[#FFE082] to-[#FFECB3] border-2 border-[#FFD54F] text-[#F57C00] font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <StopCircle className="w-5 h-5" />
            녹음 멈추기
          </button>
        ) : (
          <button 
            onClick={start} 
            disabled={!script || isAnalyzing} 
            className="py-3 rounded-lg bg-gradient-to-r from-[#FFE082] to-[#FFECB3] border-2 border-[#FFD54F] text-[#F57C00] font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Mic className="w-6 h-6" />
            녹음 시작!
          </button>
        )}
        
        {/* 녹음 시간 표시 */}
        {recordingState === 'recording' && (
          <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-[#FFF9E6] rounded-lg border-2 border-[#FFE082]">
            <div className="w-2 h-2 bg-[#FFD54F] rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-[#F57C00]">{recordingTime}초</span>
          </div>
        )}
      </div>

      {/* 오른쪽: 음성 시각화 */}
      <div className="flex-[2] relative rounded-lg overflow-hidden bg-white border-2 border-[#81D4FA]">
        <canvas ref={canvasRef} width={1000} height={180} className="w-full h-full" />
        {!recordingState || recordingState === 'idle' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#E1F5FE] via-[#F3E5F5] to-[#FFF9E6] gap-2">
            <Mic className="w-16 h-16 text-[#81D4FA] animate-pulse" />
            <div className="text-sm font-medium text-[#0277BD]">왼쪽 녹음 버튼을 눌러주세요</div>
          </div>
        ) : null}
      </div>

      {/* 분석 중 오버레이 */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[16px] flex items-center justify-center z-10">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#81D4FA]" />
            <div className="text-base font-bold text-[#0277BD]">AI가 분석 중...</div>
          </div>
        </div>
      )}

      {/* 에러 메시지 오버레이 */}
      {errorMessage && !isAnalyzing && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[16px] flex items-center justify-center z-10">
          <div className="text-center">
            <Frown className="w-12 h-12 mx-auto mb-2 text-[#F57C00]" />
            <div className="text-sm font-bold text-[#F57C00] mb-3">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage('')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#81D4FA] to-[#4FC3F7] border-2 border-[#0277BD] text-white font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 분석 결과 오버레이 */}
      {localScore !== null && !isAnalyzing && !errorMessage && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[16px] flex items-center justify-center z-10 p-4">
          <div className="w-full h-full grid grid-cols-[auto_1fr] gap-4">
            {/* 왼쪽: 점수 + 메달 */}
            <div className="flex flex-col items-center justify-center gap-2 px-4">
              {getMedalIcon(localMedal)}
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-[#FFE082] via-[#81D4FA] to-[#BA68C8] bg-clip-text text-transparent">
                  {(localScore ?? 0)}점
                </div>
                {localMedal && (
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#0277BD] block mt-1">
                    {localMedal}
                  </span>
                )}
              </div>
            </div>

            {/* 오른쪽: 상세 정보 */}
            <div className="flex flex-col gap-2.5 justify-center">
              {/* 메시지 */}
              {localMessage && (
                <div className="flex items-center gap-2 text-sm text-[#0277BD] font-bold">
                  {localMessage.icon && <localMessage.icon className="w-5 h-5 text-[#FFD54F]" />}
                  <span>{localMessage.text || localMessage}</span>
                </div>
              )}

              {/* 스크립트 */}
              {localScriptText && (
                <div className="flex items-start gap-2 p-2 bg-[#E1F5FE] rounded-lg border border-[#B3E5FC] shadow-sm">
                  <FileText className="w-4 h-4 text-[#0277BD] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#01579B] leading-relaxed">{localScriptText}</p>
                </div>
              )}

              {/* 세부 점수 */}
              <div className="grid grid-cols-3 gap-2">
                {breakdownItems.map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="p-2 rounded-lg border-2 shadow-sm bg-white flex flex-col items-center justify-center gap-0.5"
                    style={{ borderColor: color }}
                  >
                    <span className="text-xs font-semibold text-[#0277BD]">{label}</span>
                    <span className="text-xl font-bold text-[#01579B]">
                      {value !== null ? `${value}` : '-'}
                    </span>
                  </div>
                ))}
              </div>

              {/* 피드백 텍스트 */}
              {localFeedbackText && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg border-2 border-[#FFD54F] bg-gradient-to-r from-[#FFFDE7] to-[#FFECB3] shadow-sm">
                  <MessageCircle className="w-4 h-4 text-[#F57C00] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#F57C00] leading-relaxed line-clamp-2">{localFeedbackText}</p>
                </div>
              )}

              {/* 버튼 */}
              <div className="flex justify-between gap-2.5 mt-1">
                <button
                  onClick={start}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#81D4FA] to-[#4FC3F7] border-2 border-[#0277BD] text-white font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  다시 도전!
                </button>
                {onContinueVideo && (
                  <button
                    onClick={() => {
                      setLocalScore(null)
                      setLocalMessage('')
                      setLocalFeedbackText('')
                      setLocalAccuracy(null)
                      setLocalFluency(null)
                      setLocalCompleteness(null)
                      setLocalMedal(null)
                      setErrorMessage('')
                      onContinueVideo()
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFE082] to-[#FFECB3] border-2 border-[#FFD54F] text-[#F57C00] font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
                  >
                    ▶ 영상 이어보기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceRecordingBanner

