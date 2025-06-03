import React, { useRef, useState } from 'react'
import HeaderComponent from '../../components/Header'
import CanvasComponent from '../../components/Canvas'
import type { CanvasRef, DrawMode } from '../../components/Canvas'
import GraphComponent from '../../components/Graph'
import ClearButton from '../../components/ControlPanel/ClearButton'
import DrawModeButton from '../../components/ControlPanel/DrawModeButton'
import { extractFeatures } from '../../utils/features'

const MainPage: React.FC = () => {
  const canvasRef = useRef<CanvasRef>(null)
  const [features, setFeatures] = useState<number[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [drawMode, setDrawMode] = useState<DrawMode>('freehand')

  const handleImageDataChange = async (imageData: ImageData) => {
    console.log('ImageData updated:', imageData.width, 'x', imageData.height)
    
    setIsCalculating(true)
    
    try {
      // WASM特徴量抽出（非同期）
      const extractedFeatures = await extractFeatures(imageData)
      setFeatures(extractedFeatures)
    } catch (error) {
      console.error('特徴量抽出エラー:', error)
      setFeatures([])
    } finally {
      setIsCalculating(false)
    }
  }

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas()
    setFeatures([])
  }

  const handleModeChange = (mode: DrawMode) => {
    setDrawMode(mode)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HeaderComponent />

      <main style={{ 
        flex: 1, 
        display: 'flex',
        minHeight: 0
      }}>
        <CanvasComponent 
          ref={canvasRef}
          onImageDataChange={handleImageDataChange}
          drawMode={drawMode}
        />

        <GraphComponent 
          features={features}
          isLoading={isCalculating}
        />
      </main>

      <footer style={{ 
        padding: '1rem', 
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'flex-start',
        paddingLeft: 'calc(25% - 4rem)',
        gap: '1rem'
      }}>
        <DrawModeButton 
          currentMode={drawMode}
          onModeChange={handleModeChange}
          disabled={isCalculating}
        />
        <ClearButton onClear={handleClearCanvas} />
      </footer>
    </div>
  )
}

export default MainPage 