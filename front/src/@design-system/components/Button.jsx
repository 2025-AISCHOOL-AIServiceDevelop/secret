import { Link } from 'react-router-dom'
import { forwardRef } from 'react'
import { Play } from 'lucide-react'

// Base Button component
const BaseButton = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  rounded = 'full',
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const baseClasses = 'font-extrabold no-underline transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    primary: 'bg-accent text-panel border-2 border-accent hover:bg-accent/90 focus:ring-accent',
    secondary: 'bg-header text-textMain border-2 border-headerBorder hover:bg-header/90 focus:ring-header',
    outline: 'bg-transparent text-textMain border-2 border-headerBorder hover:bg-header/10 focus:ring-headerBorder',
    play: 'bg-[#FEEBB1] text-[#3a3a3a] border-2 border-[#e0b685] hover:bg-[#FEEBB1]/90 focus:ring-[#e0b685]',
    kakao: 'bg-[#fff3a8] text-[#3a3a3a] border-2 border-[#d2c277] hover:bg-[#fff3a8]/90 focus:ring-[#d2c277]',
    google: 'bg-white text-[#3a3a3a] border-2 border-[#d2c277] hover:bg-white/90 focus:ring-[#d2c277]',
    tag: 'bg-[#B1D2FA] text-[#4a5b82] border-2 border-[#B1D2FA] hover:bg-[#B1D2FA]/90 focus:ring-[#B1D2FA]',
    speed: 'bg-[#B1D2FA] text-[#4a5b82] border-2 border-[#B1D2FA] hover:bg-[#B1D2FA]/90 focus:ring-[#B1D2FA]'
  }

  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  }

  const roundedClasses = {
    none: 'rounded-none',
    small: 'rounded-[10px]',
    medium: 'rounded-[12px]',
    large: 'rounded-[14px]',
    full: 'rounded-full',
    xl: 'rounded-[18px]'
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  ].filter(Boolean).join(' ')

  if (props.to) {
    return (
      <Link
        ref={ref}
        to={props.to}
        className={classes}
        {...props}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

BaseButton.displayName = 'Button'

// Specific button variants for common use cases
export const Button = BaseButton

export const PrimaryButton = (props) => <BaseButton {...props} variant="primary" />
export const SecondaryButton = (props) => <BaseButton {...props} variant="secondary" />
export const OutlineButton = (props) => <BaseButton {...props} variant="outline" />
export const PlayButton = ({ children, ...props }) => (
  <BaseButton {...props} variant="play" size="small" rounded="full">
    <span className="flex items-center gap-1.5">
      <Play className="w-3 h-3 fill-current" />
      {children}
    </span>
  </BaseButton>
)
export const KakaoButton = (props) => <BaseButton {...props} variant="kakao" rounded="medium" />
export const GoogleButton = (props) => <BaseButton {...props} variant="google" rounded="medium" />
export const TagButton = (props) => <BaseButton {...props} variant="tag" size="small" rounded="full" />
export const SpeedButton = (props) => <BaseButton {...props} variant="speed" size="small" rounded="small" />

export default Button
