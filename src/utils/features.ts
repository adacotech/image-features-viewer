import init, { calculate_features } from '../../pkg/rust_wasm.js'

let wasmInitialized = false

async function initWasm() {
  if (!wasmInitialized) {
    await init()
    wasmInitialized = true
  }
}

export const extractFeatures = async (
  imageData: ImageData,
): Promise<number[]> => {
  if (!imageData || imageData.data.length === 0) {
    return []
  }

  try {
    await initWasm()

    const { data, width, height } = imageData

    // RGBA形式からグレースケールに変換
    const grayscaleData = new Uint8Array(width * height)
    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4]
      const g = data[i * 4 + 1]
      const b = data[i * 4 + 2]
      // グレースケール変換（輝度計算）
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
      // 二値化（閾値128）
      grayscaleData[i] = gray > 128 ? 255 : 0
    }

    // 相関幅は現在1固定
    const features = calculate_features(grayscaleData, width, height, 1)

    return Array.from(features)
  } catch (error) {
    console.error('特徴量抽出でエラーが発生しました:', error)

    return []
  }
}
