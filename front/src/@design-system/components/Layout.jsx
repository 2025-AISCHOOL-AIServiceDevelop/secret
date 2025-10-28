// Layout components for consistent spacing and structure

// Container component for max-width layouts
export const Container = ({ children, size = 'default', className = '', ...props }) => {
  const sizeClasses = {
    small: 'max-w-4xl',
    default: 'max-w-7xl',
    large: 'max-w-screen-2xl',
    full: 'w-full'
  }

  return (
    <div
      className={`mx-auto px-5 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Section component for content sections
export const Section = ({ children, className = '', ...props }) => (
  <section className={`py-8 ${className}`} {...props}>
    {children}
  </section>
)

// Grid components for responsive layouts
export const Grid = ({
  children,
  cols = 1,
  gap = 4,
  className = '',
  ...props
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  }

  const gapClasses = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  }

  return (
    <div
      className={`grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Flex components for flexible layouts
export const Flex = ({
  children,
  direction = 'row',
  justify = 'start',
  align = 'center',
  wrap = 'nowrap',
  gap = 3,
  className = '',
  ...props
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  }

  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse'
  }

  const gapClasses = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  }

  return (
    <div
      className={`flex ${directionClasses[direction]} ${justifyClasses[justify]} ${alignClasses[align]} ${wrapClasses[wrap]} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Spacer component for consistent spacing
export const Spacer = ({ size = 'medium', className = '', ...props }) => {
  const sizeClasses = {
    small: 'h-4',
    medium: 'h-8',
    large: 'h-12',
    xl: 'h-16'
  }

  return (
    <div
      className={`${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
}

// Divider component
export const Divider = ({ className = '', ...props }) => (
  <hr
    className={`border-t border-headerBorder my-4 ${className}`}
    {...props}
  />
)
