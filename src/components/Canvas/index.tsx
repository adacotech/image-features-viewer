import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

export type DrawMode = 'freehand' | 'line'

interface CanvasComponentProps {
  onImageDataChange?: (imageData: ImageData) => void
  drawMode?: DrawMode
}

export interface CanvasRef {
  clearCanvas: () => void
}

// Canvas固定サイズ
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 480

const CanvasComponent = forwardRef<CanvasRef, CanvasComponentProps>(({ 
  onImageDataChange, 
  drawMode = 'freehand' 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tempCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null)
  const [startPosition, setStartPosition] = useState<{ x: number; y: number } | null>(null)
  const [isShiftPressed, setIsShiftPressed] = useState(false)

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
    const tempCanvas = tempCanvasRef.current
    if (!canvas || !tempCanvas) return

    const ctx = canvas.getContext('2d')
    const tempCtx = tempCanvas.getContext('2d')
    if (!ctx || !tempCtx) return

    // Canvas固定サイズ設定
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    tempCanvas.width = CANVAS_WIDTH
    tempCanvas.height = CANVAS_HEIGHT
    
    // 黒背景で初期化
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // 描画設定
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    tempCtx.strokeStyle = '#FFFFFF'
    tempCtx.lineWidth = 1
    tempCtx.lineCap = 'round'
    tempCtx.lineJoin = 'round'

    // キーボードイベントリスナー追加
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
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

  const getConstrainedPosition = (startPos: { x: number; y: number }, currentPos: { x: number; y: number }) => {
    if (!isShiftPressed) {
      return currentPos
    }

    const deltaX = currentPos.x - startPos.x
    const deltaY = currentPos.y - startPos.y

    // 8方向に制限：0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
    const angle = Math.atan2(deltaY, deltaX)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // 角度を8方向のうち最も近いものに丸める
    const directions = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, -3*Math.PI/4, -Math.PI/2, -Math.PI/4]
    
    let closestDirection = directions[0]
    let minDifference = Math.abs(angle - directions[0])
    
    for (const direction of directions) {
      const difference = Math.abs(angle - direction)
      if (difference < minDifference) {
        minDifference = difference
        closestDirection = direction
      }
    }
    
    // 最も近い方向に沿って位置を計算
    const constrainedX = startPos.x + distance * Math.cos(closestDirection)
    const constrainedY = startPos.y + distance * Math.sin(closestDirection)
    
    return { x: constrainedX, y: constrainedY }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const position = getCanvasPosition(e)
    setIsDrawing(true)
    setLastPosition(position)
    setStartPosition(position)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition) return

    const canvas = canvasRef.current
    const tempCanvas = tempCanvasRef.current
    const ctx = canvas?.getContext('2d')
    const tempCtx = tempCanvas?.getContext('2d')
    if (!canvas || !tempCanvas || !ctx || !tempCtx) return

    const currentPosition = getCanvasPosition(e)

    if (drawMode === 'freehand') {
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
    } else if (drawMode === 'line' && startPosition) {
      const constrainedPosition = getConstrainedPosition(startPosition, currentPosition)
      
      tempCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      tempCtx.beginPath()
      tempCtx.moveTo(startPosition.x, startPosition.y)
      tempCtx.lineTo(constrainedPosition.x, constrainedPosition.y)
      tempCtx.stroke()
    }
  }

  const stopDrawing = () => {
    if (drawMode === 'line' && isDrawing && startPosition) {
      const canvas = canvasRef.current
      const tempCanvas = tempCanvasRef.current
      const ctx = canvas?.getContext('2d')
      const tempCtx = tempCanvas?.getContext('2d')
      
      if (canvas && tempCanvas && ctx && tempCtx) {
        ctx.drawImage(tempCanvas, 0, 0)
        tempCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        // ImageData変更を通知
        if (onImageDataChange) {
          const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
          onImageDataChange(imageData)
        }
      }
    }

    setIsDrawing(false)
    setLastPosition(null)
    setStartPosition(null)
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
      <div style={{ position: 'relative' }}>
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
        <canvas
          ref={tempCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            cursor: 'crosshair',
            touchAction: 'none',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  )
})

CanvasComponent.displayName = 'CanvasComponent'

export default CanvasComponent 