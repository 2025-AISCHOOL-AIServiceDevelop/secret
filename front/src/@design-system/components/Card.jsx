import { forwardRef } from 'react'

// Base Card component
const BaseCard = forwardRef(({
  children,
  variant = 'default',
  padding = 'medium',
  rounded = 'large',
  shadow = 'none',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'border-2 overflow-hidden'

  const variantClasses = {
    default: 'bg-panel border-[#d7c6c6]',
    primary: 'bg-[#e1e8ff] border-[#b9c5ef]',
    secondary: 'bg-[#eef3ff] border-[#c7d3f4]',
    accent: 'bg-[#e6eefc] border-[#bfcde8]',
    login: 'bg-[#bdd0f2] border-[#9fb2d9]',
    form: 'bg-[#e1ecff] border-[#b7c5e9]',
    story: 'bg-[#f1f6ff] border-[#d7c6c6]',
    player: 'bg-[#e1e8ff] border-[#b9c5ef]',
    sidebar: 'bg-[#eef3ff] border-[#c7d3f4]'
  }

  const paddingClasses = {
    none: 'p-0',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
    xl: 'p-10'
  }

  const roundedClasses = {
    none: 'rounded-none',
    small: 'rounded-[10px]',
    medium: 'rounded-[14px]',
    large: 'rounded-[18px]',
    xl: 'rounded-[20px]'
  }

  const shadowClasses = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-md',
    large: 'shadow-lg'
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    roundedClasses[rounded],
    shadowClasses[shadow],
    className
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  )
})

BaseCard.displayName = 'Card'

// Specific card variants for common use cases
export const Card = BaseCard

// Article card for story listings
export const StoryCard = ({ children, ...props }) => (
  <BaseCard variant="story" rounded="large" className="overflow-hidden" {...props}>
    {children}
  </BaseCard>
)

// Sidebar card
export const SidebarCard = ({ children, ...props }) => (
  <BaseCard variant="sidebar" {...props}>
    {children}
  </BaseCard>
)

// Player card
export const PlayerCard = ({ children, ...props }) => (
  <BaseCard variant="player" {...props}>
    {children}
  </BaseCard>
)

// Login card
export const LoginCard = ({ children, ...props }) => (
  <BaseCard variant="login" {...props}>
    {children}
  </BaseCard>
)

// Form card
export const FormCard = ({ children, ...props }) => (
  <BaseCard variant="form" {...props}>
    {children}
  </BaseCard>
)

export default Card
