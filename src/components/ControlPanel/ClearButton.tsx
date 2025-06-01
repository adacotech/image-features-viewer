import React from 'react'
import Button from '../Button'

interface ClearButtonProps {
  onClear: () => void
  disabled?: boolean
}

const ClearButton: React.FC<ClearButtonProps> = ({ onClear, disabled = false }) => {
  return (
    <Button
      variant="danger"
      size="medium"
      onClick={onClear}
      disabled={disabled}
    >
      描画クリア
    </Button>
  )
}

export default ClearButton 