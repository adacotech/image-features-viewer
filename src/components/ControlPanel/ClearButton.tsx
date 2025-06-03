import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

interface ClearButtonProps {
  onClear: () => void
  disabled?: boolean
}

const ClearButton: React.FC<ClearButtonProps> = ({ onClear, disabled = false }) => {
  return (
    <Tooltip title="描画クリア" placement="top">
      <span>
        <IconButton
          onClick={onClear}
          disabled={disabled}
          sx={{
            color: '#ff2323',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.1)'
            },
            '&:focus': {
              outline: 'none',
              boxShadow: 'none'
            },
            '&:disabled': {
              color: '#ccc'
            }
          }}
        >
          <DeleteIcon />
        </IconButton>
      </span>
    </Tooltip>
  )
}

export default ClearButton 