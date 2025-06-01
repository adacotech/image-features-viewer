use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn calculate_features(image_data: &[u8], width: usize, height: usize) -> Vec<u32> {
    // 100次元の特徴量ベクトルを初期化
    let mut features = vec![0u32; 100];

    // 各列の白ピクセル数をカウント
    let mut column_counts = vec![0u32; width];

    for y in 0..height {
        for x in 0..width {
            let idx = (y * width + x) * 4;
            let r = image_data[idx];
            let g = image_data[idx + 1];
            let b = image_data[idx + 2];

            if r > 200 && g > 200 && b > 200 {
                column_counts[x] += 1;
            }
        }
    }

    // 640列を100個のビンにグループ化
    let bin_size = width as f32 / 100.0;

    for i in 0..100 {
        let start_col = (i as f32 * bin_size) as usize;
        let end_col = ((i + 1) as f32 * bin_size) as usize;
        let end_col = end_col.min(width); // 境界チェック

        // 各ビンの列の合計を計算
        for col in start_col..end_col {
            features[i] += column_counts[col];
        }
    }

    features
}
