import init, {
  calculate_features,
  calculate_features_grayscale,
} from '../../pkg/rust_wasm.js'

export type FeatureMode = 'binary' | 'grayscale'

export const FEATURE_DIMS: Record<FeatureMode, number> = {
  binary: 25,
  grayscale: 35,
}

// Why: HLAC マスクは次数（0次/1次/2次）ごとに連続インデックスで構成されている。
// 統計比較モードで「次数ごとの平均」を計算するために構成を1か所にまとめる。
//   binary  : 0次 [0..1), 1次 [1..5), 2次 [5..25)
//   grayscale: 0次 [0..1), 1次 [1..5), 2次 [5..35) （追加マスクも全て2次）
export type FeatureOrder = 0 | 1 | 2

export const FEATURE_ORDER_RANGES: Record<
  FeatureMode,
  Record<FeatureOrder, [number, number]>
> = {
  binary: {
    0: [0, 1],
    1: [1, 5],
    2: [5, 25],
  },
  grayscale: {
    0: [0, 1],
    1: [1, 5],
    2: [5, 35],
  },
}

export const getFeatureOrder = (
  mode: FeatureMode,
  index: number,
): FeatureOrder => {
  const ranges = FEATURE_ORDER_RANGES[mode]
  if (index >= ranges[0][0] && index < ranges[0][1]) return 0
  if (index >= ranges[1][0] && index < ranges[1][1]) return 1
  return 2
}

export interface OrderStat {
  mean: number
  std: number
}

// Why: 統計比較モード用に、次数ごとの平均 μ と標準偏差 σ を A・B 合算で算出する純関数。
// Graph コンポーネント本体から計算ロジックを分離し、ユニットテストを書きやすくする。
// σ そのもの（+1 補正なし）を返し、補正は呼び出し側の責務にする。
export const computeOrderStats = (
  mode: FeatureMode,
  seriesA: number[],
  seriesB: number[],
): Record<FeatureOrder, OrderStat> => {
  const ranges = FEATURE_ORDER_RANGES[mode]
  const result: Record<FeatureOrder, OrderStat> = {
    0: { mean: 0, std: 0 },
    1: { mean: 0, std: 0 },
    2: { mean: 0, std: 0 },
  }
  for (const order of [0, 1, 2] as FeatureOrder[]) {
    const [start, end] = ranges[order]
    const count = end - start
    if (count <= 0) continue
    let sum = 0
    for (let i = start; i < end; i += 1) {
      sum += (seriesA[i] ?? 0) + (seriesB[i] ?? 0)
    }
    const mean = sum / (count * 2)
    let sqSum = 0
    for (let i = start; i < end; i += 1) {
      const dA = (seriesA[i] ?? 0) - mean
      const dB = (seriesB[i] ?? 0) - mean
      sqSum += dA * dA + dB * dB
    }
    result[order] = { mean, std: Math.sqrt(sqSum / (count * 2)) }
  }
  return result
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
