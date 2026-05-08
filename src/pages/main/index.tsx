import React, { useId, useRef, useState } from 'react'
import HeaderComponent from '../../components/Header'
import CanvasComponent from '../../components/Canvas'
import type { CanvasRef, DrawMode } from '../../components/Canvas'
import GraphComponent from '../../components/Graph'
import DrawModeButton from '../../components/ControlPanel/DrawModeButton'
import FeatureModeButton from '../../components/ControlPanel/FeatureModeButton'
import DiffModeButton from '../../components/ControlPanel/DiffModeButton'
import type { DisplayMode } from '../../components/ControlPanel/DiffModeButton'
import { extractFeatures, type FeatureMode } from '../../utils/features'

type CanvasTarget = 'A' | 'B'

const MainPage: React.FC = () => {
  const canvasRefA = useRef<CanvasRef>(null)
  const canvasRefB = useRef<CanvasRef>(null)
  const [featuresA, setFeaturesA] = useState<number[]>([])
  const [featuresB, setFeaturesB] = useState<number[]>([])
  const [isCalculatingA, setIsCalculatingA] = useState(false)
  const [isCalculatingB, setIsCalculatingB] = useState(false)
  const [drawMode, setDrawMode] = useState<DrawMode>('line')
  const [featureMode, setFeatureMode] = useState<FeatureMode>('binary')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('compare')
  // Why: 直近のImageDataをA/B別々に保持し、特徴量モード切替時に再計算する
  const lastImageDataRefA = useRef<ImageData | null>(null)
  const lastImageDataRefB = useRef<ImageData | null>(null)

  const setFeaturesFor = (target: CanvasTarget, value: number[]) => {
    if (target === 'A') setFeaturesA(value)
    else setFeaturesB(value)
  }

  const setIsCalculatingFor = (target: CanvasTarget, value: boolean) => {
    if (target === 'A') setIsCalculatingA(value)
    else setIsCalculatingB(value)
  }

  const computeFeatures = async (
    imageData: ImageData,
    mode: FeatureMode,
    target: CanvasTarget,
  ) => {
    setIsCalculatingFor(target, true)
    try {
      const extracted = await extractFeatures(imageData, mode)
      setFeaturesFor(target, extracted)
    } catch (error) {
      console.error(`特徴量抽出エラー (${target}):`, error)
      setFeaturesFor(target, [])
    } finally {
      setIsCalculatingFor(target, false)
    }
  }

  const makeImageDataChangeHandler =
    (target: CanvasTarget) => async (imageData: ImageData) => {
      const ref = target === 'A' ? lastImageDataRefA : lastImageDataRefB
      ref.current = imageData
      await computeFeatures(imageData, featureMode, target)
    }

  const makeClearHandler = (target: CanvasTarget) => () => {
    const canvasRef = target === 'A' ? canvasRefA : canvasRefB
    const dataRef = target === 'A' ? lastImageDataRefA : lastImageDataRefB
    canvasRef.current?.clearCanvas()
    // Why: クリア後にモード切替が走っても古い ImageData を使い回さないよう ref を破棄
    dataRef.current = null
    setFeaturesFor(target, [])
  }

  const handleDrawModeChange = (mode: DrawMode) => {
    setDrawMode(mode)
  }

  const handleFeatureModeChange = async (mode: FeatureMode) => {
    setFeatureMode(mode)
    // Why: A/B それぞれの最後のImageDataで再計算（並列）
    const tasks: Promise<void>[] = []
    if (lastImageDataRefA.current) {
      tasks.push(computeFeatures(lastImageDataRefA.current, mode, 'A'))
    } else {
      setFeaturesA([])
    }
    if (lastImageDataRefB.current) {
      tasks.push(computeFeatures(lastImageDataRefB.current, mode, 'B'))
    } else {
      setFeaturesB([])
    }
    await Promise.all(tasks)
  }

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode)
  }

  const isCalculating = isCalculatingA || isCalculatingB

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HeaderComponent />

      <main
        style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <CanvasComponent
            ref={canvasRefA}
            onImageDataChange={makeImageDataChangeHandler('A')}
            drawMode={drawMode}
            label="A"
            onClear={makeClearHandler('A')}
          />
          <CanvasComponent
            ref={canvasRefB}
            onImageDataChange={makeImageDataChangeHandler('B')}
            drawMode={drawMode}
            label="B"
            onClear={makeClearHandler('B')}
          />
        </div>

        <GraphComponent
          featuresA={featuresA}
          featuresB={featuresB}
          isLoading={isCalculating}
          mode={featureMode}
          displayMode={displayMode}
        />
      </main>

      <footer
        style={{
          padding: '1rem',
          backgroundColor: '#f9f9f9',
          borderTop: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'flex-start',
          paddingLeft: 'calc(25% - 4rem)',
          gap: '1.5rem',
          alignItems: 'flex-end',
        }}
      >
        <ControlGroup label="描画モード">
          <DrawModeButton
            currentMode={drawMode}
            onModeChange={handleDrawModeChange}
            disabled={isCalculating}
          />
        </ControlGroup>

        <GroupDivider />

        <ControlGroup label="計算特徴量">
          <FeatureModeButton
            currentMode={featureMode}
            onModeChange={handleFeatureModeChange}
            disabled={isCalculating}
          />
        </ControlGroup>

        <GroupDivider />

        <ControlGroup label="特徴グラフの表示モード">
          <DiffModeButton
            currentMode={displayMode}
            onModeChange={handleDisplayModeChange}
            disabled={isCalculating}
          />
        </ControlGroup>
      </footer>
    </div>
  )
}

// Why: フッター各メニューの役割を明示するためのラベル付きラッパー。
// 視覚的なグルーピングに加え、role="group" + aria-labelledby で
// スクリーンリーダーがラベルとボタン群の関連を読み取れるようにする。
const ControlGroup: React.FC<{
  label: string
  children: React.ReactNode
}> = ({ label, children }) => {
  const labelId = useId()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span
        id={labelId}
        style={{
          fontSize: '0.75rem',
          color: '#666',
          fontFamily: '"Noto Sans JP", Arial, sans-serif',
          paddingLeft: '0.25rem',
        }}
      >
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {children}
      </div>
    </div>
  )
}

const GroupDivider: React.FC = () => (
  <div
    aria-hidden="true"
    style={{
      width: '1px',
      alignSelf: 'stretch',
      backgroundColor: '#ddd',
      margin: '0.25rem 0',
    }}
  />
)

export default MainPage
