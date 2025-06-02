import React from 'react'
import Button from '../Button'

export type DrawMode = 'freehand' | 'line'

interface DrawModeButtonProps {
  currentMode: DrawMode
  onModeChange: (mode: DrawMode) => void
  disabled?: boolean
}

const DrawModeButton: React.FC<DrawModeButtonProps> = ({ 
  currentMode, 
  onModeChange, 
  disabled = false 
}) => {
  const nextMode = currentMode === 'freehand' ? 'line' : 'freehand'
  const buttonText = currentMode === 'freehand' ? '直線モード' : '自由線モード'
  
  return (
    <Button
      variant="primary"
      size="medium"
      onClick={() => onModeChange(nextMode)}
      disabled={disabled}
    >
      {buttonText}
    </Button>
  )
}

export default DrawModeButton 