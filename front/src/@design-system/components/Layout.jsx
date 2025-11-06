import { forwardRef } from 'react'

// Container component for max-width and centering
export const Container = forwardRef(({
  size = 'default',
  center = true,
  className = '',
  children,
  ...props
}, ref) => {
  const baseClasses = 'w-full mx-auto'

  const sizeClasses = {
    small: 'max-w-2xl',
    default: 'max-w-4xl',
    large: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  const centerClasses = center ? 'px-4 sm:px-6 lg:px-8' : ''

  const classes = [
    baseClasses,
    sizeClasses[size],
    centerClasses,
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

Container.displayName = 'Container'

// Section component for content sections
export const Section = forwardRef(({
  padding = 'default',
  className = '',
  children,
  ...props
}, ref) => {
  const baseClasses = 'w-full'

  const paddingClasses = {
    none: 'py-0',
    small: 'py-4',
    default: 'py-8',
    large: 'py-12',
    xl: 'py-16'
  }

  const classes = [
    baseClasses,
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ')

  return (
    <section
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </section>
  )
})

Section.displayName = 'Section'

// Grid component for responsive grids
export const Grid = forwardRef(({
  cols = 1,
  gap = 'default',
  className = '',
  children,
  ...props
}, ref) => {
  const baseClasses = 'grid'

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  const gapClasses = {
    none: 'gap-0',
    small: 'gap-2',
    default: 'gap-4',
    medium: 'gap-6',
    large: 'gap-8'
  }

  const classes = [
    baseClasses,
    colClasses[cols],
    gapClasses[gap],
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

Grid.displayName = 'Grid'

// Flex component for flexible layouts
export const Flex = forwardRef(({
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  gap = 'default',
  className = '',
  children,
  ...props
}, ref) => {
  const baseClasses = 'flex'

  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse'
  }

  const gapClasses = {
    none: 'gap-0',
    small: 'gap-2',
    default: 'gap-4',
    medium: 'gap-6',
    large: 'gap-8'
  }

  const classes = [
    baseClasses,
    directionClasses[direction],
    alignClasses[align],
    justifyClasses[justify],
    wrapClasses[wrap],
    gapClasses[gap],
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

Flex.displayName = 'Flex'

// Spacer component for consistent spacing
export const Spacer = ({ size = 'default', className = '', ...props }) => {
  const sizeClasses = {
    small: 'h-2',
    default: 'h-4',
    medium: 'h-6',
    large: 'h-8',
    xl: 'h-12',
    '2xl': 'h-16'
  }

  return (
    <div
      className={`${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
}

// Divider component
export const Divider = ({ orientation = 'horizontal', className = '', ...props }) => {
  const baseClasses = 'bg-gray-200'
  const orientationClasses = orientation === 'vertical' ? 'w-px h-full' : 'w-full h-px'

  return (
    <div
      className={`${baseClasses} ${orientationClasses} ${className}`}
      {...props}
    />
  )
}

export default {
  Container,
  Section,
  Grid,
  Flex,
  Spacer,
  Divider
}