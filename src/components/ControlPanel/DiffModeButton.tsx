import React from 'react'
import { IconButton, Tooltip, Box } from '@mui/material'
import BarChartIcon from '@mui/icons-material/BarChart'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import QueryStatsIcon from '@mui/icons-material/QueryStats'

export type DisplayMode = 'compare' | 'diff' | 'stats'
// Why: 旧名 `DiffMode` の互換 alias。compare/diff/stats の3値を扱うため、
// 新規参照は `DisplayMode` を使う。既存の参照箇所は順次置き換える。
export type DiffMode = DisplayMode

interface DiffModeButtonProps {
  currentMode: DisplayMode
  onModeChange: (mode: DisplayMode) => void
  disabled?: boolean
}

const DiffModeButton: React.FC<DiffModeButtonProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
}) => {
  // Why: マウスクリック時のフォーカスリングは抑制し、キーボード操作時のみ表示してa11yを担保
  const getButtonStyle = (mode: DisplayMode) => ({
    color: currentMode === mode ? '#fff' : '#333333',
    backgroundColor: currentMode === mode ? '#2196F3' : 'transparent',
    '&:hover': {
      backgroundColor:
        currentMode === mode ? '#1976D2' : 'rgba(33, 150, 243, 0.1)',
    },
    '&:focus:not(:focus-visible)': {
      outline: 'none',
      boxShadow: 'none',
    },
    '&:focus-visible': {
      outline: '2px solid #1976D2',
      outlineOffset: '2px',
    },
    '&:disabled': {
      color: '#ccc',
      backgroundColor: 'transparent',
    },
    margin: '0 2px',
  })

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Tooltip title="A / B 比較表示" placement="top">
        <span>
          <IconButton
            aria-label="A / B 比較表示モード"
            onClick={() => onModeChange('compare')}
            disabled={disabled}
            sx={getButtonStyle('compare')}
          >
            <BarChartIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="差分表示 (A − B)" placement="top">
        <span>
          <IconButton
            aria-label="差分表示モード"
            onClick={() => onModeChange('diff')}
            disabled={disabled}
            sx={getButtonStyle('diff')}
          >
            <CompareArrowsIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="統計比較 次数別 (x−μ)/(σ+1)" placement="top">
        <span>
          <IconButton
            aria-label="統計比較モード"
            onClick={() => onModeChange('stats')}
            disabled={disabled}
            sx={getButtonStyle('stats')}
          >
            <QueryStatsIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

export default DiffModeButton
