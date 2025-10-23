// Media components for images, videos, and interactive elements

// Image component with consistent styling
export const Image = ({
  src,
  alt,
  variant = 'default',
  rounded = 'none',
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: '',
    avatar: 'w-12 h-12',
    thumbnail: 'w-24 h-24',
    cover: 'w-full h-[180px]',
    player: 'w-full h-[360px]'
  }

  const roundedClasses = {
    none: 'rounded-none',
    small: 'rounded-[10px]',
    medium: 'rounded-[14px]',
    large: 'rounded-[18px]',
    full: 'rounded-full'
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${variantClasses[variant]} ${roundedClasses[rounded]} ${className}`}
      {...props}
    />
  )
}

// Avatar component
export const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'medium',
  fallback,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div
      className={`rounded-full overflow-hidden bg-[#f0f0f0] ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-radial text-white font-bold text-lg">
          {fallback || '?'}
        </div>
      )}
    </div>
  )
}

// Progress bar component
export const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'medium',
  className = '',
  ...props
}) => {
  const percentage = Math.min((value / max) * 100, 100)

  const variantClasses = {
    default: 'bg-[#f4f7ff] border-[#c8d3f0]',
    primary: 'bg-[#f4f7ff] border-[#c8d3f0]',
    accent: 'bg-[#f4f7ff] border-[#c8d3f0]'
  }

  const sizeClasses = {
    small: 'h-1.5',
    medium: 'h-2.5',
    large: 'h-4'
  }

  return (
    <div
      className={`rounded-full overflow-hidden border-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <div
        className="h-full bg-gradient-to-r from-[#a9a3ff] to-[#82b2ff] transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

// Video player placeholder
export const VideoPlayer = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`rounded-[14px] overflow-hidden bg-gradient-to-br from-[#6657c7] to-[#6aa0ff] grid place-items-center ${className}`}
    {...props}
  >
    {children}
  </div>
)

// Audio controls component
export const AudioControls = ({
  isPlaying = false,
  onPlayPause,
  progress = 0,
  duration = '00:00',
  currentTime = '00:00',
  onSpeedChange,
  className = '',
  ...props
}) => (
  <div className={`grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center ${className}`} {...props}>
    <button
      onClick={onPlayPause}
      className="w-9 h-9 rounded-full border-2 bg-[#ffe182] border-[#c9a94b] hover:bg-[#ffe182]/90 transition-colors"
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      <div className={`w-0 h-0 ml-0.5 border-l-[6px] border-l-[#3a3a3a] border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ${isPlaying ? 'ml-0.5' : ''}`} />
    </button>

    <ProgressBar value={progress} />

    <span className="text-[#6d7a9f] text-xs whitespace-nowrap">
      {currentTime} / {duration}
    </span>

    <button
      onClick={onSpeedChange}
      className="rounded-[10px] px-3 py-2 text-sm font-bold border-2 bg-white border-[#c9d2f1] text-[#4a5b82] hover:bg-[#f0f4ff] transition-colors"
    >
      느리게
    </button>
  </div>
)

// Placeholder image component
export const PlaceholderImage = ({
  width = 60,
  height = 60,
  text = '이미지',
  className = '',
  ...props
}) => (
  <div
    className={`bg-[#f0f0f0] flex items-center justify-center text-[#666] text-sm border-2 border-dashed border-[#a9b9d3] ${className}`}
    style={{ width, height }}
    {...props}
  >
    <div className="text-center">
      <div className="text-lg mb-1">📷</div>
      <div className="text-xs">{text}</div>
    </div>
  </div>
)
