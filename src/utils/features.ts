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

    const uint8Array = new Uint8Array(data)

    const features = calculate_features(uint8Array, width, height)

    return Array.from(features)
  } catch (error) {
    console.error('特徴量抽出でエラーが発生しました:', error)

    return []
  }
}
