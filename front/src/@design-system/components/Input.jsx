import { forwardRef } from 'react'

// Base Input component
const BaseInput = forwardRef(({
  variant = 'default',
  size = 'medium',
  rounded = 'full',
  className = '',
  error = false,
  ...props
}, ref) => {
  const baseClasses = 'border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    default: 'bg-white border-[#a9b9d3] text-textMain placeholder-textMain/60 focus:border-accent focus:ring-accent',
    search: 'bg-white border-[#a9b9d3] text-textMain placeholder-textMain/60 focus:border-accent focus:ring-accent',
    file: 'bg-[#f0f0f0] border-dashed border-[#a9b9d3] text-textMain focus:border-accent focus:ring-accent'
  }

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-sm',
    large: 'px-6 py-4 text-base'
  }

  const roundedClasses = {
    none: 'rounded-none',
    small: 'rounded-[10px]',
    medium: 'rounded-[14px]',
    large: 'rounded-[18px]',
    full: 'rounded-full'
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    error && 'border-red-400 focus:border-red-400 focus:ring-red-400',
    className
  ].filter(Boolean).join(' ')

  return (
    <input
      ref={ref}
      className={classes}
      {...props}
    />
  )
})

BaseInput.displayName = 'Input'

// Specific input variants
export const Input = BaseInput
export const SearchInput = (props) => <BaseInput {...props} variant="search" placeholder="검색어를 입력하세요..." />
export const FileInput = (props) => <BaseInput {...props} variant="file" type="file" />

export default Input
