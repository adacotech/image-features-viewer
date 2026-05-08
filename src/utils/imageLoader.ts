// 画像読み込みユーティリティ
// Why: Canvas へ画像を貼り付ける際の検証・配置計算・グレースケール化を一箇所に集約し、
//      Canvas コンポーネント側を UI 制御に専念させる。

export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  // Why: BMP は OS 標準の保存形式として頻出。ブラウザ標準の <img> でデコード可能。
  //      ブラウザによって `image/bmp` と `image/x-ms-bmp` のどちらが付くかが異なるため両方許可する。
  'image/bmp',
  'image/x-ms-bmp',
] as const

export const SUPPORTED_IMAGE_ACCEPT = SUPPORTED_IMAGE_MIME_TYPES.join(',')

// 上限 20MB。大きすぎる画像はメモリ確保や decode に時間がかかり、UX を損なうため弾く。
export const MAX_IMAGE_FILE_SIZE = 20 * 1024 * 1024

export type ImageLoadErrorReason =
  | 'unsupported_format'
  | 'too_large'
  | 'load_failed'

export type ImageLoadResult =
  | { ok: true; image: HTMLImageElement }
  | { ok: false; reason: ImageLoadErrorReason; message: string }

const isSupportedMime = (mime: string): boolean =>
  (SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(mime)

export const isSupportedImageFile = (file: File): boolean => {
  if (file.type) return isSupportedMime(file.type)
  // Why: 一部の OS / ブラウザでは type が空になることがあるため、拡張子で fallback 判定する。
  const lower = file.name.toLowerCase()
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.bmp')
  )
}

const loadHtmlImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('画像のデコードに失敗しました'))
    img.src = src
  })

export const loadImageFromFile = async (
  file: File,
): Promise<ImageLoadResult> => {
  if (!isSupportedImageFile(file)) {
    return {
      ok: false,
      reason: 'unsupported_format',
      message: `対応していない画像形式です: ${file.type || file.name}`,
    }
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    const limitMb = Math.floor(MAX_IMAGE_FILE_SIZE / (1024 * 1024))
    return {
      ok: false,
      reason: 'too_large',
      message: `ファイルサイズが大きすぎます (上限 ${limitMb}MB)`,
    }
  }

  const url = URL.createObjectURL(file)
  try {
    const image = await loadHtmlImage(url)
    return { ok: true, image }
  } catch {
    return {
      ok: false,
      reason: 'load_failed',
      message: '画像の読み込みに失敗しました',
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export interface ImageDrawRect {
  x: number
  y: number
  width: number
  height: number
}

// Why: 配置矩形の決定は純関数として切り出してテスト容易性を確保する。
//      ルール:
//        - 元画像の縦横が両方とも Canvas 以下: 等倍で中心配置
//        - どちらかが Canvas を超える: 長辺が Canvas に収まるよう等倍縮小（アスペクト比保持）して中心配置
export const calcImageDrawRect = (
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): ImageDrawRect => {
  let drawWidth = imageWidth
  let drawHeight = imageHeight
  if (imageWidth > canvasWidth || imageHeight > canvasHeight) {
    const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight)
    drawWidth = imageWidth * scale
    drawHeight = imageHeight * scale
  }
  const x = (canvasWidth - drawWidth) / 2
  const y = (canvasHeight - drawHeight) / 2
  return { x, y, width: drawWidth, height: drawHeight }
}

// Canvas コンテキストへ画像を「黒背景 + 中心配置 + グレースケール化」して描画する。
// Why: 透過 PNG は黒で塗り潰した Canvas に source-over で重ねるため、透明部分は黒に落ちる。
//      その後 ImageData を BT.601 でグレースケール化し、特徴量計算前の入力を統一する。
export const drawImageToCanvasAsGrayscale = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  const rect = calcImageDrawRect(
    image.naturalWidth,
    image.naturalHeight,
    canvasWidth,
    canvasHeight,
  )
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height)

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
    data[i + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)
}
