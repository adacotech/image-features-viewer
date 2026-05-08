import init, {
  calculate_features,
  calculate_features_grayscale,
} from '../../pkg/rust_wasm.js'

export type FeatureMode = 'binary' | 'grayscale'

export const FEATURE_DIMS: Record<FeatureMode, number> = {
  binary: 25,
  grayscale: 35,
}

let wasmInitialized = false

async function initWasm() {
  if (!wasmInitialized) {
    await init()
    wasmInitialized = true
  }
}

export const extractFeatures = async (
  imageData: ImageData,
  mode: FeatureMode = 'binary',
): Promise<number[]> => {
  if (!imageData || imageData.data.length === 0) {
    return []
  }

  try {
    await initWasm()

    const { data, width, height } = imageData

    if (mode === 'binary') {
      // 既存挙動: グレースケール変換 → 閾値128で二値化 → 25次元HLAC
      const grayscaleData = new Uint8Array(width * height)
      for (let i = 0; i < width * height; i++) {
        const r = data[i * 4]
        const g = data[i * 4 + 1]
        const b = data[i * 4 + 2]
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
        grayscaleData[i] = gray > 128 ? 255 : 0
      }
      const features = calculate_features(grayscaleData, width, height, 1)
      return Array.from(features)
    }

    // 濃淡モード: 0..255 を 0.0..1.0 に正規化 → 35次元HLAC
    // Why: Otsu&Kurita 形式の自己相関は f² や f³ を含むため、入力スケールが
    // そのまま値の桁に効く。0〜1 に正規化して数値オーバーフローと値の比較性を担保する。
    const grayscaleNormalized = new Float64Array(width * height)
    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4]
      const g = data[i * 4 + 1]
      const b = data[i * 4 + 2]
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      grayscaleNormalized[i] = gray / 255
    }
    const features = calculate_features_grayscale(
      grayscaleNormalized,
      width,
      height,
      1,
    )
    return Array.from(features)
  } catch (error) {
    console.error('特徴量抽出でエラーが発生しました:', error)

    return []
  }
}
