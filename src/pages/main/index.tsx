import React, { useRef, useState } from 'react'
import HeaderComponent from '../../components/Header'
import CanvasComponent from '../../components/Canvas'
import type { CanvasRef } from '../../components/Canvas'
import GraphComponent from '../../components/Graph'
import ClearButton from '../../components/ControlPanel/ClearButton'
import { extractFeatures } from '../../utils/features'

const MainPage: React.FC = () => {
  const canvasRef = useRef<CanvasRef>(null)
  const [features, setFeatures] = useState<number[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  const handleImageDataChange = async (imageData: ImageData) => {
    console.log('ImageData updated:', imageData.width, 'x', imageData.height)
    
    setIsCalculating(true)
    
    try {
      // WASM特徴量抽出（非同期）
      const extractedFeatures = await extractFeatures(imageData)
      setFeatures(extractedFeatures)
    } catch (error) {
      console.error('特徴量抽出エラー:', error)
      setFeatures([]) // エラー時は空配列
    } finally {
      setIsCalculating(false)
    }
  }

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas()
    setFeatures([]) // グラフもクリア
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Title Header Area */}
      <HeaderComponent />

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        display: 'flex',
        minHeight: 0
      }}>
        {/* Canvas Area */}
        <CanvasComponent 
          ref={canvasRef}
          onImageDataChange={handleImageDataChange} 
        />

        {/* Graph Area */}
        <GraphComponent 
          features={features}
          isLoading={isCalculating}
        />
      </main>

      {/* Control Panel Area */}
      <footer style={{ 
        padding: '1rem', 
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <ClearButton onClear={handleClearCanvas} />
      </footer>
    </div>
  )
}

export default MainPage 