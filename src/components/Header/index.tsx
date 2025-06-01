import React from 'react'
import { APP_CONFIG } from '../../constants/app'

const HeaderComponent: React.FC = () => {
  return (
    <header style={{
      display: 'flex',
      width: '100%',
      padding: '24px',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '10px',
      background: '#353A45',
      boxSizing: 'border-box'
    }}>
      <h1 style={{
        alignSelf: 'stretch',
        color: '#F6F7F9',
        fontFeatureSettings: "'liga' off, 'clig' off",
        fontFamily: '"Noto Sans JP"',
        fontSize: '24px',
        fontStyle: 'normal',
        fontWeight: 700,
        lineHeight: '100%',
        margin: 0
      }}>
        {APP_CONFIG.name}
      </h1>
    </header>
  )
}

export default HeaderComponent 