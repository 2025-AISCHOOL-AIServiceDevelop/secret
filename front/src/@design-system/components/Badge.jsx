import { forwardRef } from 'react'

// Base Badge component
const BaseBadge = forwardRef(({
  variant = 'default',
  size = 'medium',
  color = 'default',
  rounded = 'full',
  className = '',
  children,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center font-medium transition-colors'

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    outline: 'border-2 border-current bg-transparent'
  }

  const colorClasses = {
    default: '',
    primary: 'bg-[#B1D2FA] text-[#4a5b82]',
    secondary: 'bg-[#5a6ea0] text-white',
    accent: 'bg-[#ffd857] text-[#2c3a72]',
    muted: 'bg-gray-100 text-gray-600'
  }

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  }

  const roundedClasses = {
    none: 'rounded-none',
    small: 'rounded-[4px]',
    medium: 'rounded-[6px]',
    large: 'rounded-[8px]',
    full: 'rounded-full',
    xl: 'rounded-[12px]'
  }

  // Use color classes if specified, otherwise use variant classes
  const colorOrVariantClasses = color !== 'default' ? colorClasses[color] : variantClasses[variant]

  const classes = [
    baseClasses,
    colorOrVariantClasses,
    sizeClasses[size],
    roundedClasses[rounded],
    className
  ].filter(Boolean).join(' ')

  return (
    <span
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </span>
  )
})

BaseBadge.displayName = 'Badge'

// Specific badge variants for common use cases
export const Badge = BaseBadge

// Age badge for content recommendations
export const AgeBadge = ({ children, ...props }) => (
  <BaseBadge color="primary" size="small" {...props}>
    {children}
  </BaseBadge>
)

// Language badge
export const LanguageBadge = ({ children, ...props }) => (
  <BaseBadge color="secondary" size="small" {...props}>
    {children}
  </BaseBadge>
)

// Category badge
export const CategoryBadge = ({ children, ...props }) => (
  <BaseBadge color="accent" size="small" {...props}>
    {children}
  </BaseBadge>
)

// Dot indicator (for status, etc.)
export const DotIndicator = ({ color = 'default', size = 'medium', ...props }) => {
  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  }

  const colorClasses = {
    default: 'bg-gray-400',
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    accent: 'bg-[#9fb2e9]'
  }

  return (
    <span
      className={`inline-block rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
      {...props}
    />
  )
}

export default Badge