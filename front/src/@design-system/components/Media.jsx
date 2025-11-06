import { forwardRef } from 'react'

// Image component with lazy loading and error handling
export const Image = forwardRef(({
  src,
  alt = '',
  fallback = '/vite.svg',
  className = '',
  onError,
  ...props
}, ref) => {
  const handleError = (e) => {
    if (e.target.src !== fallback) {
      e.target.src = fallback
    }
    onError?.(e)
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
      {...props}
    />
  )
})

Image.displayName = 'Image'

// Avatar component for user profiles
export const Avatar = forwardRef(({
  src,
  alt = '',
  size = 'medium',
  fallback = '/vite.svg',
  className = '',
  children,
  ...props
}, ref) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div
      ref={ref}
      className={`relative rounded-full overflow-hidden bg-gray-200 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fallback={fallback}
          className="w-full h-full object-cover"
        />
      ) : children ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-semibold">
          {children}
        </div>
      ) : null}
    </div>
  )
})

Avatar.displayName = 'Avatar'

// Progress bar component
export const ProgressBar = forwardRef(({
  value = 0,
  max = 100,
  color = 'primary',
  size = 'medium',
  showLabel = false,
  className = '',
  ...props
}, ref) => {
  const percentage = Math.min((value / max) * 100, 100)

  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  }

  const colorClasses = {
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }

  return (
    <div
      ref={ref}
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <div
        className={`h-full ${colorClasses[color]} transition-all duration-300 ease-in-out`}
        style={{ width: `${percentage}%` }}
      />
      {showLabel && (
        <div className="text-xs text-center mt-1 text-gray-600">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'

// Video player component (simplified)
export const VideoPlayer = forwardRef(({
  src,
  poster,
  controls = true,
  autoplay = false,
  muted = false,
  className = '',
  onPlay,
  onPause,
  onEnded,
  ...props
}, ref) => {
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      controls={controls}
      autoPlay={autoplay}
      muted={muted}
      className={`w-full h-auto ${className}`}
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
      {...props}
    >
      브라우저가 비디오 태그를 지원하지 않습니다.
    </video>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

// Audio controls component
export const AudioControls = forwardRef(({
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  volume = 1,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  className = '',
  ...props
}, ref) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 p-2 bg-gray-100 rounded-lg ${className}`}
      {...props}
    >
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>

      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-gray-600 min-w-[35px]">
          {formatTime(currentTime)}
        </span>
        <ProgressBar
          value={currentTime}
          max={duration}
          size="small"
          color="primary"
          className="flex-1 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            onSeek?.(percent * duration)
          }}
        />
        <span className="text-xs text-gray-600 min-w-[35px]">
          {formatTime(duration)}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
        className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
})

AudioControls.displayName = 'AudioControls'

// Placeholder image component
export const PlaceholderImage = forwardRef(({
  width = 400,
  height = 300,
  text = '이미지',
  bgColor = '#f3f4f6',
  textColor = '#6b7280',
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`flex items-center justify-center bg-gray-100 text-gray-500 font-medium ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: bgColor,
        color: textColor
      }}
      {...props}
    >
      {text}
    </div>
  )
})

PlaceholderImage.displayName = 'PlaceholderImage'

export default {
  Image,
  Avatar,
  ProgressBar,
  VideoPlayer,
  AudioControls,
  PlaceholderImage
}