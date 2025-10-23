import { forwardRef } from 'react'

// Base Badge component
const BaseBadge = forwardRef(({
  children,
  variant = 'default',
  size = 'medium',
  rounded = 'full',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center font-medium border-2 transition-all duration-200'

  const variantClasses = {
    default: 'bg-white text-[#5a6ea0] border-[#c6ccee]',
    primary: 'bg-accent text-panel border-accent',
    secondary: 'bg-muted text-textMain border-muted',
    age: 'bg-white text-[#5a6ea0] border-[#c6ccee]',
    language: 'bg-white text-[#5a6ea0] border-[#c6ccee]',
    category: 'bg-[#f1f6ff] text-[#5a6ea0] border-[#c6ccee]'
  }

  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1 text-xs',
    large: 'px-4 py-1.5 text-sm'
  }

  const roundedClasses = {
    none: 'rounded-none',
    small: 'rounded-[6px]',
    medium: 'rounded-[8px]',
    large: 'rounded-[10px]',
    full: 'rounded-full'
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
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

// Specific badge variants
export const Badge = BaseBadge

// Age group badges
export const AgeBadge = ({ children, ...props }) => (
  <BaseBadge variant="age" {...props}>
    {children}
  </BaseBadge>
)

// Language badges
export const LanguageBadge = ({ children, ...props }) => (
  <BaseBadge variant="language" {...props}>
    {children}
  </BaseBadge>
)

// Category badges
export const CategoryBadge = ({ children, ...props }) => (
  <BaseBadge variant="category" {...props}>
    {children}
  </BaseBadge>
)

// Dot indicator for pagination/carousel
export const DotIndicator = ({ active = false, className = '', ...props }) => (
  <span
    className={`inline-block w-2 h-2 rounded-full transition-all duration-200 ${
      active ? 'bg-accent scale-125' : 'bg-[#9fb2e9]'
    } ${className}`}
    {...props}
  />
)

export default Badge
