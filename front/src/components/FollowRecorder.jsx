import { useEffect, useRef, useState } from 'react'
import { useTutorStore } from '../stores'

/**
 * FollowRecorder renders a bottom panel that lets the user record their voice
 * while watching a sentence, shows a live pitch/amplitude visualization, 
 * and submits the audio for pronunciation analysis when recording completes.
 */
function FollowRecorder({ script, contentsId, language = 'en', userId, onAnalyzed }) {
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
  const [localMessage, setLocalMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showDetails, setShowDetails] = useState(false)

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

      // Set up recording
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/webm;codecs=opus'
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorder.start(100)

      // Set up waveform
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
      setLocalMessage('')
      setErrorMessage('')
      setShowDetails(false)
    } catch (err) {
      console.error('Microphone access failed', err)
    }
  }

  const stop = async () => {
    if (!mediaRecorderRef.current) return
    const recorder = mediaRecorderRef.current
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
      const file = new File([blob], 'recording.webm', { type: blob.type })
      try {
        const scriptId = script?.id || script?.scriptId;
        if (!scriptId) {
          console.error('Script ID is missing');
          return;
        }

        const res = await analyzePronunciation(file, userId, contentsId, scriptId, language)
        const score = Number(res?.finalScore ?? res?.score ?? 0)
        setLocalScore(score)
        setLocalAccuracy(res?.accuracy ?? null)
        setLocalFluency(res?.fluency ?? null)
        setLocalCompleteness(res?.completeness ?? null)
        setLocalMessage(buildMessage(score))
        setErrorMessage('') // 성공 시 에러 메시지 초기화
        if (onAnalyzed) onAnalyzed(res, script)
      } catch (e) {
        console.error('Analyze failed', e)
        setErrorMessage(e.message || '발음 분석 중 오류가 발생했습니다.')
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

  const buildMessage = (score) => {
    if (score >= 85) return '아주 잘 했어요! 정확도가 높아요.'
    if (score >= 70) return '좋아요! 조금만 더 또렷하게 해봐요.'
    return '아쉬워요! 다시 한 번 또박또박 말해볼까요?'
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
    const timeData = new Uint8Array(analyser.fftSize)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      
      // Get frequency data for amplitude bars
      analyser.getByteFrequencyData(dataArray)
      // Get time domain data for waveform
      analyser.getByteTimeDomainData(timeData)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#e8f0ff')
      gradient.addColorStop(1, '#d8e2ff')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate average amplitude for dynamic visualization
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength

      // Draw center line
      const centerY = canvas.height / 2
      ctx.strokeStyle = '#c8d3f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(canvas.width, centerY)
      ctx.stroke()

      // Draw frequency bars (음성 높낮이 시각화)
      const barCount = 60
      const barWidth = canvas.width / barCount
      const barSpacing = 2
      
      for (let i = 0; i < barCount; i++) {
        // Sample frequency data
        const dataIndex = Math.floor((i / barCount) * bufferLength)
        const value = dataArray[dataIndex]
        const barHeight = (value / 255) * (canvas.height * 0.8)
        
        const x = i * barWidth
        const y = centerY - barHeight / 2
        
        // Color based on amplitude (음성 크기에 따른 색상 변화)
        const intensity = value / 255
        const hue = 240 - (intensity * 60) // Blue to purple
        ctx.fillStyle = `hsl(${hue}, 80%, ${50 + intensity * 20}%)`
        
        ctx.fillRect(x, y, barWidth - barSpacing, barHeight)
      }

      // Draw waveform overlay (파형 오버레이)
      ctx.strokeStyle = '#6b7cff'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      const sliceWidth = canvas.width / analyser.fftSize
      let x = 0
      
      for (let i = 0; i < analyser.fftSize; i++) {
        const v = timeData[i] / 128.0
        const y = (v * canvas.height) / 2
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }
      ctx.stroke()

      // Draw amplitude indicator
      const indicatorHeight = (average / 255) * 20
      ctx.fillStyle = average > 30 ? '#4caf50' : '#9e9e9e'
      ctx.fillRect(10, 10, 5, indicatorHeight)
    }
    draw()
  }

  return (
    <div className="rounded-[18px] p-4 border-2" style={{ background: '#dfe7ff', borderColor: '#b7c7ff' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-black text-[#ffd857] text-[18px]">🎤 음성 녹음 전용 배너</div>
        {recordingState === 'recording' && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-red-600">녹음 중</span>
          </div>
        )}
      </div>
      
      <div className="h-[160px] rounded-[14px] overflow-hidden bg-white border-2 relative" style={{ borderColor: '#c8d3f0' }}>
        <canvas ref={canvasRef} width={900} height={160} className="w-full h-full" />
        {!recordingState || recordingState === 'idle' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 bg-opacity-90">
            <div className="text-center">
              <div className="text-4xl mb-2">🎙️</div>
              <div className="text-sm text-gray-600">녹음 버튼을 눌러 시작하세요</div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="text-[#2c3a72] font-bold text-md truncate mr-3 flex-1">
          {script ? `"${script.text}"` : '스크립트를 선택해주세요'}
        </div>
        {recordingState === 'recording' ? (
          <button 
            onClick={stop} 
            className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-md flex items-center gap-2"
          >
            <span className="w-3 h-3 bg-white rounded-sm"></span>
            녹음 정지
          </button>
        ) : (
          <button 
            onClick={start} 
            disabled={!script || isAnalyzing} 
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
          >
            <span className="text-lg">🎤</span>
            음성 녹음하기
          </button>
        )}
      </div>

      {/* Analysis Result or Error */}
      {(isAnalyzing || localScore !== null || errorMessage) && (
        <div className="mt-3 rounded-[14px] p-4" style={{
          background: errorMessage ? '#ffeaea' : '#eaf1ff',
          border: `2px solid ${errorMessage ? '#f5c6c6' : '#c9d6f2'}`
        }}>
          {errorMessage ? (
            <div className="text-sm text-red-600 text-center">
              ⚠️ {errorMessage}
            </div>
          ) : isAnalyzing ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <div className="text-sm text-[#2c3a72] font-bold">AI가 발음을 분석하고 있습니다...</div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-4 mb-3">
                <div className="text-center">
                  <div className="text-[48px] font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {Math.round(localScore)}
                  </div>
                  <div className="text-xs text-gray-500">점수</div>
                </div>
                <div>
                  <div className="text-base font-bold text-[#2c3a72] mb-2">
                    {localMessage}
                  </div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {showDetails ? '상세 정보 숨기기 ▲' : '상세 정보 보기 ▼'}
                  </button>
                </div>
              </div>
              
              {showDetails && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-white rounded">
                      <div className="text-gray-500 mb-1">정확도</div>
                      <div className="font-bold text-blue-600">
                        {localAccuracy !== null ? localAccuracy : '-'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <div className="text-gray-500 mb-1">유창성</div>
                      <div className="font-bold text-purple-600">
                        {localFluency !== null ? localFluency : '-'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <div className="text-gray-500 mb-1">완성도</div>
                      <div className="font-bold text-pink-600">
                        {localCompleteness !== null ? localCompleteness : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center">
                    💡 더 나은 결과를 위해 천천히 또박또박 말해보세요!
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FollowRecorder


