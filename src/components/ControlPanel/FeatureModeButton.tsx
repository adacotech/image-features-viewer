import React from 'react'
import { IconButton, Tooltip, Box } from '@mui/material'
import LooksTwoIcon from '@mui/icons-material/LooksTwo'
import GradientIcon from '@mui/icons-material/Gradient'
import type { FeatureMode } from '../../utils/features'

interface FeatureModeButtonProps {
  currentMode: FeatureMode
  onModeChange: (mode: FeatureMode) => void
  disabled?: boolean
}

const FeatureModeButton: React.FC<FeatureModeButtonProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
}) => {
  const getButtonStyle = (mode: FeatureMode) => ({
    color: currentMode === mode ? '#fff' : '#333333',
    backgroundColor: currentMode === mode ? '#2196F3' : 'transparent',
    '&:hover': {
      backgroundColor:
        currentMode === mode ? '#1976D2' : 'rgba(33, 150, 243, 0.1)',
    },
    '&:focus': {
      outline: 'none',
      boxShadow: 'none',
    },
    '&:disabled': {
      color: '#ccc',
      backgroundColor: 'transparent',
    },
    margin: '0 2px',
  })

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Tooltip title="2値HLAC（25次元）" placement="top">
        <span>
          <IconButton
            onClick={() => onModeChange('binary')}
            disabled={disabled}
            sx={getButtonStyle('binary')}
          >
            <LooksTwoIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="濃淡HLAC（35次元）" placement="top">
        <span>
          <IconButton
            onClick={() => onModeChange('grayscale')}
            disabled={disabled}
            sx={getButtonStyle('grayscale')}
          >
            <GradientIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

export default FeatureModeButton
