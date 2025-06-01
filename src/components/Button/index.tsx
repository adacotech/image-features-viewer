import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#2196F3',
          color: '#FFFFFF',
          border: 'none',
          '&:hover': '#1976D2'
        }
      case 'secondary':
        return {
          backgroundColor: '#F5F5F5',
          color: '#333333',
          border: '1px solid #CCCCCC',
          '&:hover': '#E0E0E0'
        }
      case 'danger':
        return {
          backgroundColor: '#F44336',
          color: '#FFFFFF',
          border: 'none',
          '&:hover': '#D32F2F'
        }
      default:
        return {
          backgroundColor: '#2196F3',
          color: '#FFFFFF',
          border: 'none',
          '&:hover': '#1976D2'
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '6px 12px',
          fontSize: '12px'
        }
      case 'medium':
        return {
          padding: '8px 16px',
          fontSize: '14px'
        }
      case 'large':
        return {
          padding: '12px 24px',
          fontSize: '16px'
        }
      default:
        return {
          padding: '8px 16px',
          fontSize: '14px'
        }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        backgroundColor: variantStyles.backgroundColor,
        color: variantStyles.color,
        border: variantStyles.border,
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        fontFamily: 'inherit',
        transition: 'all 0.2s ease-in-out',
        opacity: disabled ? 0.6 : 1,
        outline: 'none',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        ...(disabled ? {} : {
          ':hover': {
            backgroundColor: variantStyles['&:hover'],
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
          }
        })
      }}
      onMouseEnter={(e) => {
        if (!disabled && variantStyles['&:hover']) {
          e.currentTarget.style.backgroundColor = variantStyles['&:hover']
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = variantStyles.backgroundColor
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      {children}
    </button>
  )
}

export default Button 