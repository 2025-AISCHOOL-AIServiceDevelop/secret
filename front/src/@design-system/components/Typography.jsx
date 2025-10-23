import { forwardRef } from 'react'

// Base Text component
const BaseText = forwardRef(({
  as: Component = 'span',
  variant = 'body',
  weight = 'normal',
  color = 'default',
  size = 'medium',
  className = '',
  ...props
}, ref) => {
  const baseClasses = ''

  const variantClasses = {
    heading: 'font-black',
    subheading: 'font-extrabold',
    body: '',
    caption: 'text-xs',
    label: 'text-sm font-medium'
  }

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black'
  }

  const colorClasses = {
    default: 'text-textMain',
    muted: 'text-muted',
    accent: 'text-accent',
    primary: 'text-[#6f58b1]',
    secondary: 'text-[#5a6ea0]',
    highlight: 'text-[#ffd857]',
    warning: 'text-[#e0c354]',
    error: 'text-red-500'
  }

  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl',
    '3xl': 'text-2xl',
    '4xl': 'text-3xl',
    '5xl': 'text-4xl',
    '6xl': 'text-5xl'
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
    weightClasses[weight],
    colorClasses[color],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <Component
      ref={ref}
      className={classes}
      {...props}
    />
  )
})

BaseText.displayName = 'Text'

// Typography components
export const Text = BaseText

// Heading components
export const Heading1 = ({ children, ...props }) => (
  <BaseText as="h1" variant="heading" size="4xl" weight="black" {...props}>
    {children}
  </BaseText>
)

export const Heading2 = ({ children, ...props }) => (
  <BaseText as="h2" variant="heading" size="3xl" weight="black" {...props}>
    {children}
  </BaseText>
)

export const Heading3 = ({ children, ...props }) => (
  <BaseText as="h3" variant="subheading" size="2xl" weight="extrabold" {...props}>
    {children}
  </BaseText>
)

export const Heading4 = ({ children, ...props }) => (
  <BaseText as="h4" variant="subheading" size="xl" weight="extrabold" {...props}>
    {children}
  </BaseText>
)

// Body text
export const BodyText = ({ children, ...props }) => (
  <BaseText variant="body" {...props}>
    {children}
  </BaseText>
)

// Caption text
export const Caption = ({ children, ...props }) => (
  <BaseText variant="caption" color="muted" {...props}>
    {children}
  </BaseText>
)

// Label text
export const Label = ({ children, ...props }) => (
  <BaseText variant="label" {...props}>
    {children}
  </BaseText>
)

// Special text components for the app
export const AppTitle = ({ children, ...props }) => (
  <BaseText
    as="h1"
    size="2xl"
    weight="extrabold"
    color="primary"
    className="no-underline"
    {...props}
  >
    {children}
  </BaseText>
)

export const StoryTitle = ({ children, ...props }) => (
  <BaseText
    weight="extrabold"
    className="mb-1"
    {...props}
  >
    {children}
  </BaseText>
)

export const StoryDescription = ({ children, ...props }) => (
  <BaseText
    variant="caption"
    color="muted"
    {...props}
  >
    {children}
  </BaseText>
)

export const SectionTitle = ({ children, ...props }) => (
  <BaseText
    weight="black"
    color="secondary"
    {...props}
  >
    {children}
  </BaseText>
)

export const PlayerText = ({ children, ...props }) => (
  <BaseText
    weight="black"
    color="highlight"
    {...props}
  >
    {children}
  </BaseText>
)

export const PlayerSubText = ({ children, ...props }) => (
  <BaseText
    weight="black"
    color="secondary"
    {...props}
  >
    {children}
  </BaseText>
)

export default Text
