import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

interface CanvasComponentProps {
  onImageDataChange?: (imageData: ImageData) => void
}

export interface CanvasRef {
  clearCanvas: () => void
}

// Canvas固定サイズ
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 480

const CanvasComponent = forwardRef<CanvasRef, CanvasComponentProps>(({ onImageDataChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // クリア後のImageData変更を通知
    if (onImageDataChange) {
      const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      onImageDataChange(imageData)
    }
  }

  useImperativeHandle(ref, () => ({
    clearCanvas
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas固定サイズ設定（一度だけ）
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    
    // 黒背景で初期化
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // 描画設定
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getCanvasPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    
    // 表示サイズから実際のCanvas座標に変換
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width)
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height)
    
    return { x, y }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const position = getCanvasPosition(e)
    setIsDrawing(true)
    setLastPosition(position)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const currentPosition = getCanvasPosition(e)

    // 線を描画
    ctx.beginPath()
    ctx.moveTo(lastPosition.x, lastPosition.y)
    ctx.lineTo(currentPosition.x, currentPosition.y)
    ctx.stroke()

    setLastPosition(currentPosition)

    // ImageData変更を通知
    if (onImageDataChange) {
      const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      onImageDataChange(imageData)
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPosition(null)
  }

  return (
    <div 
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          cursor: 'crosshair',
          touchAction: 'none',
          border: '1px solid #333'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  )
})

CanvasComponent.displayName = 'CanvasComponent'

export default CanvasComponent 