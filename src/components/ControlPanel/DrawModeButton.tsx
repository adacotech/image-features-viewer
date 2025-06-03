import React from 'react'
import { IconButton, Tooltip, Box } from '@mui/material'
import DrawIcon from '@mui/icons-material/Draw'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'

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
  const getButtonStyle = (mode: DrawMode) => ({
    color: currentMode === mode ? '#fff' : '#333333',
    backgroundColor: currentMode === mode ? '#2196F3' : 'transparent',
    '&:hover': {
      backgroundColor: currentMode === mode ? '#1976D2' : 'rgba(33, 150, 243, 0.1)'
    },
    '&:focus': {
      outline: 'none',
      boxShadow: 'none'
    },
    '&:disabled': {
      color: '#ccc',
      backgroundColor: 'transparent'
    },
    margin: '0 2px'
  })
  
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Tooltip title="自由線モード" placement="top">
        <span>
          <IconButton
            onClick={() => onModeChange('freehand')}
            disabled={disabled}
            sx={getButtonStyle('freehand')}
          >
            <DrawIcon />
          </IconButton>
        </span>
      </Tooltip>
      
      <Tooltip title="直線モード（Shift+ドラッグで8方向制限）" placement="top">
        <span>
          <IconButton
            onClick={() => onModeChange('line')}
            disabled={disabled}
            sx={getButtonStyle('line')}
          >
            <HorizontalRuleIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

export default DrawModeButton 