import { useEffect, useRef, useState } from 'react'
import { useTutorStore } from '../stores'

/**
 * VoiceRecordingBanner - 유아용 음성 녹음 전용 배너
 * 영상과 스크립트 목록 하단에 배치되며, 귀여운 캐릭터와 함께 녹음 기능 제공
 */
function VoiceRecordingBanner({ script, contentsId, language = 'en', userId, onAnalyzed }) {
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
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    return () => {
      cleanup()
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
      setErrorMessage('')
    } catch (err) {
      console.error('Microphone access failed', err)
      setErrorMessage('마이크 접근 권한이 필요해요! 🎤')
    }
  }

  const stop = async () => {
    if (!mediaRecorderRef.current) return
    const recorder = mediaRecorderRef.current
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
      const file = new File([blob], 'recording.webm', { type: blob.type })
      try {
        const scriptId = script?.id || script?.scriptId
        if (!scriptId) {
          console.error('Script ID is missing')
          return
        }

        const res = await analyzePronunciation(file, userId, contentsId, scriptId, language)
        const score = Number(res?.finalScore ?? res?.score ?? 0)
        setLocalScore(score)
        setLocalAccuracy(res?.accuracy ?? null)
        setLocalFluency(res?.fluency ?? null)
        setLocalCompleteness(res?.completeness ?? null)
        setLocalMedal(res?.medal ?? null)
        setLocalMessage(buildMessage(score, res?.medal))
        setErrorMessage('')
        if (onAnalyzed) onAnalyzed(res, script)
      } catch (e) {
        console.error('Analyze failed', e)
        setErrorMessage(e.message || '발음 분석 중 오류가 발생했습니다. 다시 시도해주세요! 🔄')
        setLocalScore(null)
        setLocalMessage('')
      } finally {
        cleanup()
        resetRecording()
      }
    }
    recorder.stop()
    stopRecording()
  }

  const buildMessage = (score, medal) => {
    if (medal === 'GOLD' || score >= 90) return '🌟 와우! 정말 완벽해요! 천재인가요?'
    if (medal === 'SILVER' || score >= 75) return '👍 정말 잘했어요! 조금만 더 연습하면 완벽해요!'
    if (score >= 60) return '😊 좋아요! 다시 한번 또박또박 말해볼까요?'
    return '💪 괜찮아요! 천천히 따라 해봐요!'
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

  const getMedalEmoji = (medal) => {
    if (medal === 'GOLD') return '🥇'
    if (medal === 'SILVER') return '🥈'
    if (medal === 'BRONZE') return '🥉'
    return '⭐'
  }

  return (
    <div className="h-full rounded-[20px] p-3 border-3 shadow-lg transition-all flex flex-col overflow-hidden" 
         style={{ 
           background: 'linear-gradient(135deg, #ffeef8 0%, #e8f5ff 50%, #fff4e8 100%)',
           borderColor: recordingState === 'recording' ? '#ff6b9d' : '#a8d8ff'
         }}>
      
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{recordingState === 'recording' ? '🎤' : '🎵'}</div>
          <p className="text-md text-gray-600 font-bold">
            {script ? '준비 완료! 녹음 시작을 눌러주세요' : '스크립트를 선택해주세요'}
          </p>
        </div>
        {recordingState === 'recording' && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 rounded-full border border-red-400 animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-red-600">녹음 중!</span>
          </div>
        )}
      </div>

      {/* 선택된 스크립트 표시 */}
      {script && (
        <div className="mb-1.5 p-1.5 bg-white rounded-lg border border-blue-200 flex-shrink-0">
          <div className="text-[9px] text-gray-500 mb-0.5 font-bold">🎯 따라할 문장</div>
          <div className="text-xs font-bold text-gray-800 line-clamp-1">{script.text}</div>
        </div>
      )}

      {/* 음성 시각화 캔버스 */}
      <div className="relative flex-1 rounded-[12px] overflow-hidden bg-white border-2 border-purple-200 shadow-md mb-1.5 min-h-[100px]">
        <canvas ref={canvasRef} width={1000} height={120} className="w-full h-full" />
        {!recordingState || recordingState === 'idle' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl mb-1 animate-pulse">🎙️</div>
            <div className="text-sm font-bold text-gray-600">아래 버튼을 눌러 녹음 시작!</div>
            <div className="text-[10px] text-gray-500 mt-0.5">또박또박 말해보세요 ✨</div>
          </div>
        ) : null}
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center justify-center gap-2 mb-1.5 flex-shrink-0">
        {recordingState === 'recording' ? (
          <button 
            onClick={stop} 
            className="relative px-5 py-2 rounded-full bg-gradient-to-r from-red-400 to-pink-500 text-white font-bold text-base shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <span className="w-3 h-3 bg-white rounded-sm animate-pulse"></span>
            녹음 멈추기
          </button>
        ) : (
          <button 
            onClick={start} 
            disabled={!script || isAnalyzing} 
            className="relative px-6 py-2 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white font-bold text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1.5"
          >
            <span className="text-xl">🎤</span>
            녹음 시작!
          </button>
        )}
      </div>

      {/* 결과 표시 영역 */}
      {(isAnalyzing || localScore !== null || errorMessage) && (
        <div className="rounded-[12px] p-2 border-2 shadow-md transition-all flex-shrink-0" style={{
          background: errorMessage 
            ? 'linear-gradient(135deg, #ffe0e0, #fff0f0)' 
            : isAnalyzing 
            ? 'linear-gradient(135deg, #e0f0ff, #f0e0ff)'
            : 'linear-gradient(135deg, #fff9e0, #e0ffe0)',
          borderColor: errorMessage ? '#ff6b6b' : isAnalyzing ? '#9d6bff' : '#6bff9d'
        }}>
          {errorMessage ? (
            <div className="text-center py-1">
              <div className="text-3xl mb-1">😢</div>
              <div className="text-xs font-bold text-red-600">{errorMessage}</div>
            </div>
          ) : isAnalyzing ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                <div className="absolute inset-0 flex items-center justify-center text-sm">🤖</div>
              </div>
              <div className="text-sm font-bold text-purple-700">분석 중...</div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* 점수 및 메달 */}
              <div className="flex items-center justify-center gap-3">
                <div className="text-4xl">{getMedalEmoji(localMedal)}</div>
                <div className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {Math.round(localScore)}
                </div>
              </div>

              {/* 메시지 */}
              <div className="text-center">
                <div className="text-sm font-black text-gray-800">{localMessage}</div>
              </div>

              {/* 상세 점수 */}
              {(localAccuracy !== null || localFluency !== null || localCompleteness !== null) && (
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-white/80 rounded-lg p-1.5 border border-blue-200 text-center">
                    <div className="text-lg">🎯</div>
                    <div className="text-[9px] text-gray-600 font-bold">정확도</div>
                    <div className="text-sm font-black text-blue-600">
                      {localAccuracy !== null ? localAccuracy : '-'}
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-1.5 border border-purple-200 text-center">
                    <div className="text-lg">💬</div>
                    <div className="text-[9px] text-gray-600 font-bold">유창성</div>
                    <div className="text-sm font-black text-purple-600">
                      {localFluency !== null ? localFluency : '-'}
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-1.5 border border-pink-200 text-center">
                    <div className="text-lg">✨</div>
                    <div className="text-[9px] text-gray-600 font-bold">완성도</div>
                    <div className="text-sm font-black text-pink-600">
                      {localCompleteness !== null ? localCompleteness : '-'}
                    </div>
                  </div>
                </div>
              )}

              {/* 다시 하기 버튼 */}
              <div className="text-center">
                <button
                  onClick={start}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold text-sm shadow-sm hover:shadow-md transform hover:scale-105 transition-all inline-flex items-center gap-1.5"
                >
                  <span className="text-base">🔄</span>
                  다시 도전!
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VoiceRecordingBanner

