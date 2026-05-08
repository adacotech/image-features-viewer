import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { IconButton, Tooltip } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import {
  drawImageToCanvasAsGrayscale,
  loadImageFromFile,
  SUPPORTED_IMAGE_ACCEPT,
  isSupportedImageFile,
} from '../../utils/imageLoader'

export type DrawMode = 'freehand' | 'line'

interface CanvasComponentProps {
  onImageDataChange?: (imageData: ImageData) => void
  drawMode?: DrawMode
  // Why: A/B 2枚を見分けるための表示用ラベル。1枚運用との互換のため任意。
  label?: string
  // Why: クリア操作をキャンバスごとに置くために、外部からハンドラを受け取る。
  onClear?: () => void
}

// Why: 読み込み失敗等の通知を一定時間で消すための猶予。長すぎても邪魔になるため 4 秒。
const ERROR_MESSAGE_DURATION_MS = 4000

export interface CanvasRef {
  clearCanvas: () => void
}

// Canvas固定サイズ
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 480

const CanvasComponent = forwardRef<CanvasRef, CanvasComponentProps>(
  ({ onImageDataChange, drawMode = 'freehand', label, onClear }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const tempCanvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const errorTimerRef = useRef<number | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [lastPosition, setLastPosition] = useState<{
      x: number
      y: number
    } | null>(null)
    const [startPosition, setStartPosition] = useState<{
      x: number
      y: number
    } | null>(null)
    const [isShiftPressed, setIsShiftPressed] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const showErrorMessage = (message: string) => {
      setErrorMessage(message)
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current)
      }
      errorTimerRef.current = window.setTimeout(() => {
        setErrorMessage(null)
        errorTimerRef.current = null
      }, ERROR_MESSAGE_DURATION_MS)
    }

    const drawImageToCanvas = async (file: File) => {
      const result = await loadImageFromFile(file)
      if (!result.ok) {
        showErrorMessage(result.message)
        return
      }
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      drawImageToCanvasAsGrayscale(
        ctx,
        result.image,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
      )

      // Why: 描画中の一時 Canvas に直線プレビューが残っている場合に備えてクリアする。
      const tempCanvas = tempCanvasRef.current
      const tempCtx = tempCanvas?.getContext('2d')
      if (tempCanvas && tempCtx) {
        tempCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      }

      if (onImageDataChange) {
        const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        onImageDataChange(imageData)
      }
    }

    const handleFileInputChange = async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = e.target.files?.[0]
      // Why: 同じファイルを連続で選んだ際にも change イベントが発火するよう値をリセットする。
      e.target.value = ''
      if (!file) return
      await drawImageToCanvas(file)
    }

    const openFilePicker = () => {
      fileInputRef.current?.click()
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      // Why: dragover で preventDefault しないと drop イベントが発火しない。
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
      }
      if (!isDragOver) setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      // Why: 子要素間移動でも dragleave が走るので、コンテナ外に出た時だけ解除する。
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
      setIsDragOver(false)
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = e.dataTransfer?.files
      if (!files || files.length === 0) return
      // Why: 複数ドロップは先頭の対応形式ファイルのみを処理する。仕様の単純化を優先。
      const file = Array.from(files).find(isSupportedImageFile) ?? files[0]
      await drawImageToCanvas(file)
    }

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
      clearCanvas,
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
        if (errorTimerRef.current !== null) {
          window.clearTimeout(errorTimerRef.current)
          errorTimerRef.current = null
        }
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

    const getConstrainedPosition = (
      startPos: { x: number; y: number },
      currentPos: { x: number; y: number },
    ) => {
      if (!isShiftPressed) {
        return currentPos
      }

      const deltaX = currentPos.x - startPos.x
      const deltaY = currentPos.y - startPos.y

      // 8方向に制限：0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
      const angle = Math.atan2(deltaY, deltaX)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // 角度を8方向のうち最も近いものに丸める
      const directions = [
        0,
        Math.PI / 4,
        Math.PI / 2,
        (3 * Math.PI) / 4,
        Math.PI,
        (-3 * Math.PI) / 4,
        -Math.PI / 2,
        -Math.PI / 4,
      ]

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
        const constrainedPosition = getConstrainedPosition(
          startPosition,
          currentPosition,
        )

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
            const imageData = ctx.getImageData(
              0,
              0,
              CANVAS_WIDTH,
              CANVAS_HEIGHT,
            )
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
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          // Why: ドラッグ中であることを枠で明示する。
          outline: isDragOver ? '2px dashed #2196F3' : 'none',
          outlineOffset: '-8px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_IMAGE_ACCEPT}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              cursor: 'crosshair',
              touchAction: 'none',
              border: '1px solid #333',
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
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            {label && (
              <span
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#fff',
                  padding: '2px 10px',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 'bold',
                  lineHeight: 1.4,
                }}
              >
                {label}
              </span>
            )}
            <Tooltip
              title="画像を読み込む（ドラッグ&ドロップも可）"
              placement="right"
            >
              <span style={{ pointerEvents: 'auto' }}>
                <IconButton
                  size="small"
                  aria-label={`${label ?? ''} に画像を読み込む`}
                  onClick={openFilePicker}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#9ec5ff',
                    padding: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                    },
                    '&:focus': {
                      outline: 'none',
                      boxShadow: 'none',
                    },
                  }}
                >
                  <AddPhotoAlternateIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {onClear && (
              <Tooltip title="このキャンバスをクリア" placement="right">
                <span style={{ pointerEvents: 'auto' }}>
                  <IconButton
                    size="small"
                    aria-label={`${label ?? ''} キャンバスをクリア`}
                    onClick={onClear}
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: '#ff6b6b',
                      padding: '4px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#ff2323',
                      },
                      '&:focus': {
                        outline: 'none',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </div>
          {errorMessage && (
            <div
              role="alert"
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 8,
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(180, 0, 0, 0.85)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: 13,
                lineHeight: 1.4,
                maxWidth: '90%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            >
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    )
  },
)

CanvasComponent.displayName = 'CanvasComponent'

export default CanvasComponent
