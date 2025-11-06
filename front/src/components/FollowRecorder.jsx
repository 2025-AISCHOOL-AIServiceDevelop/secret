import { useEffect, useRef, useState } from 'react'
import { useTutorStore } from '../stores'

/**
 * FollowRecorder renders a bottom panel that lets the user record their voice
 * while watching a sentence, shows a live waveform, and submits the audio
 * for pronunciation analysis when recording completes.
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
      setLocalMessage('')
      setErrorMessage('')
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
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // background
      ctx.fillStyle = '#d8e2ff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // axis baseline
      ctx.strokeStyle = '#8a78ff'
      ctx.lineWidth = 3
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        x += sliceWidth
      }
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }
    draw()
  }

  return (
    <div className="rounded-[18px] p-4 border-2" style={{ background: '#dfe7ff', borderColor: '#b7c7ff' }}>
      <div className="font-black text-[#ffd857] text-[18px] mb-2">따라 해봐요!</div>
      <div className="h-[140px] rounded-[14px] overflow-hidden bg-white border-2" style={{ borderColor: '#c8d3f0' }}>
        <canvas ref={canvasRef} width={900} height={140} className="w-full h-full" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="text-[#2c3a72] font-bold text-sm truncate mr-3">{script ? script.text : '스크립트를 선택해주세요'}</div>
        {recordingState === 'recording' ? (
          <button onClick={stop} className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold">정지</button>
        ) : (
          <button onClick={start} disabled={!script || isAnalyzing} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold disabled:opacity-50">바로 따라하기</button>
        )}
      </div>

      {/* Analysis Result or Error */}
      {(isAnalyzing || localScore !== null || errorMessage) && (
        <div className="mt-3 rounded-[14px] p-3" style={{
          background: errorMessage ? '#ffeaea' : '#eaf1ff',
          border: `2px solid ${errorMessage ? '#f5c6c6' : '#c9d6f2'}`
        }}>
          {errorMessage ? (
            <div className="text-sm text-red-600 text-center">
              ⚠️ {errorMessage}
            </div>
          ) : (
            <div className="grid grid-cols-[80px_1fr] items-center gap-3">
              <div className="text-[36px] font-black text-[#6b7cff] text-center">
                {localScore !== null ? Math.round(localScore) : '···'}
              </div>
              <div className="text-sm text-[#2c3a72]">
                {isAnalyzing ? '분석 중입니다…' : localMessage}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FollowRecorder


