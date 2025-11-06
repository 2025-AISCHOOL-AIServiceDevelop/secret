import { forwardRef } from 'react'

// Base Input component
const BaseInput = forwardRef(({
  variant = 'default',
  size = 'medium',
  type = 'text',
  placeholder = '',
  disabled = false,
  error = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full border-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    default: 'border-[#a9b9d3] bg-white focus:border-blue-500 focus:ring-blue-500/20',
    outline: 'border-gray-300 bg-transparent focus:border-blue-500 focus:ring-blue-500/20',
    filled: 'border-transparent bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20'
  }

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-sm',
    large: 'px-6 py-4 text-base'
  }

  const stateClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    stateClasses,
    disabledClasses,
    className
  ].filter(Boolean).join(' ')

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={classes}
      {...props}
    />
  )
})

BaseInput.displayName = 'Input'

// Specific input variants
export const Input = BaseInput
export const SearchInput = (props) => <BaseInput {...props} placeholder="검색어를 입력하세요" />
export const FileInput = forwardRef((props, ref) => (
  <BaseInput
    ref={ref}
    type="file"
    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    {...props}
  />
))

FileInput.displayName = 'FileInput'

export default Input