import React, { useRef, useState } from 'react'
import HeaderComponent from '../../components/Header'
import CanvasComponent from '../../components/Canvas'
import type { CanvasRef, DrawMode } from '../../components/Canvas'
import GraphComponent from '../../components/Graph'
import ClearButton from '../../components/ControlPanel/ClearButton'
import DrawModeButton from '../../components/ControlPanel/DrawModeButton'
import FeatureModeButton from '../../components/ControlPanel/FeatureModeButton'
import { extractFeatures, type FeatureMode } from '../../utils/features'

const MainPage: React.FC = () => {
  const canvasRef = useRef<CanvasRef>(null)
  const [features, setFeatures] = useState<number[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [drawMode, setDrawMode] = useState<DrawMode>('line')
  const [featureMode, setFeatureMode] = useState<FeatureMode>('binary')
  // 直近のImageDataを保持しておくことで、特徴量モード切替時に再計算できる
  const lastImageDataRef = useRef<ImageData | null>(null)

  const computeFeatures = async (imageData: ImageData, mode: FeatureMode) => {
    setIsCalculating(true)
    try {
      const extracted = await extractFeatures(imageData, mode)
      setFeatures(extracted)
    } catch (error) {
      console.error('特徴量抽出エラー:', error)
      setFeatures([])
    } finally {
      setIsCalculating(false)
    }
  }

  const handleImageDataChange = async (imageData: ImageData) => {
    lastImageDataRef.current = imageData
    await computeFeatures(imageData, featureMode)
  }

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas()
    setFeatures([])
  }

  const handleModeChange = (mode: DrawMode) => {
    setDrawMode(mode)
  }

  const handleFeatureModeChange = async (mode: FeatureMode) => {
    setFeatureMode(mode)
    // モード切替の直後に最新Canvas内容で再計算（描画済みの場合のみ）
    if (lastImageDataRef.current) {
      await computeFeatures(lastImageDataRef.current, mode)
    } else {
      setFeatures([])
    }
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
          mode={featureMode}
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
        <FeatureModeButton
          currentMode={featureMode}
          onModeChange={handleFeatureModeChange}
          disabled={isCalculating}
        />
      </footer>
    </div>
  )
}

export default MainPage
