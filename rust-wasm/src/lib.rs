use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn calculate_features(image_data: &[u8], width: usize, height: usize, corr: usize) -> Vec<u32> {
    let mut f = [0u32; 25];

    if width <= 2 * corr || height <= 2 * corr {
        return f.to_vec();
    }

    let at = |y: usize, x: usize| -> u32 {
        if image_data[y * width + x] == 255 {
            1
        } else {
            0
        }
    };

    for y in 0..(height - 2 * corr) {
        for x in 0..(width - 2 * corr) {
            let yc = y + corr;
            let xc = x + corr;

            let mid_c = at(yc, xc);
            let mid_r = at(yc, xc + corr);
            let up_r = at(yc - corr, xc + corr);
            let low_r = at(yc + corr, xc + corr);
            let mid_l = at(yc, xc - corr);
            let up_l = at(yc - corr, xc - corr);
            let low_l = at(yc + corr, xc - corr);
            let up_c = at(yc - corr, xc);
            let low_c = at(yc + corr, xc);

            // 0th
            f[0] += mid_c;

            // 1st
            f[1] += mid_c * mid_r;
            f[2] += mid_c * up_r;
            f[3] += mid_c * up_c;
            f[4] += mid_c * up_l;

            // 2nd
            f[5] += mid_c * mid_l * mid_r;
            f[6] += mid_c * low_l * up_r;
            f[7] += mid_c * up_c * low_c;
            f[8] += mid_c * up_l * low_r;
            f[9] += mid_c * mid_l * up_r;
            f[10] += mid_c * low_l * up_c;
            f[11] += mid_c * up_l * low_c;
            f[12] += mid_c * mid_l * low_r;
            f[13] += mid_c * low_l * mid_r;
            f[14] += mid_c * low_c * up_r;
            f[15] += mid_c * up_c * low_r;
            f[16] += mid_c * up_l * mid_r;
            f[17] += mid_c * mid_l * up_c;
            f[18] += mid_c * up_l * low_l;
            f[19] += mid_c * mid_l * low_c;
            f[20] += mid_c * low_l * low_r;
            f[21] += mid_c * low_c * mid_r;
            f[22] += mid_c * up_r * low_r;
            f[23] += mid_c * up_c * mid_r;
            f[24] += mid_c * up_l * up_r;
        }
    }

    f.to_vec()
}

/// 濃淡（グレースケール）HLAC 特徴量（35次元）
///
/// Why: 既存の2値HLAC（25次元）は f²=f を仮定するため、自乗を含むマスクが
/// 縮退してしまい多値画像の階調情報を取り出せない。論文 Otsu & Kurita (1988)
/// に基づき、3×3局所近傍・0〜2次・対称性除去後の 35 マスクで計算する。
///
/// 構成（合計35個 = 0次1個 + 1次4個 + 2次30個）:
///   - インデックス 0..=24 : 既存2値HLACと同じ25マスク（2値画像入力なら結果一致）
///   - インデックス 25..=34: 自乗を含む追加10マスク（同点を許容するN=2マスク）
///
/// 入力は f64 の 0.0〜1.0 に正規化済みの輝度値。
#[wasm_bindgen]
pub fn calculate_features_grayscale(
    image_data: &[f64],
    width: usize,
    height: usize,
    corr: usize,
) -> Vec<f64> {
    let mut f = [0.0f64; 35];

    if width <= 2 * corr || height <= 2 * corr {
        return f.to_vec();
    }

    let at = |y: usize, x: usize| -> f64 { image_data[y * width + x] };

    for y in 0..(height - 2 * corr) {
        for x in 0..(width - 2 * corr) {
            let yc = y + corr;
            let xc = x + corr;

            let mid_c = at(yc, xc);
            let mid_r = at(yc, xc + corr);
            let up_r = at(yc - corr, xc + corr);
            let low_r = at(yc + corr, xc + corr);
            let mid_l = at(yc, xc - corr);
            let up_l = at(yc - corr, xc - corr);
            let low_l = at(yc + corr, xc - corr);
            let up_c = at(yc - corr, xc);
            let low_c = at(yc + corr, xc);

            // 0次（1個）
            f[0] += mid_c;

            // 1次（4個）
            f[1] += mid_c * mid_r;
            f[2] += mid_c * up_r;
            f[3] += mid_c * up_c;
            f[4] += mid_c * up_l;

            // 2次（既存20個：すべて異なる3点の積）
            f[5] += mid_c * mid_l * mid_r;
            f[6] += mid_c * low_l * up_r;
            f[7] += mid_c * up_c * low_c;
            f[8] += mid_c * up_l * low_r;
            f[9] += mid_c * mid_l * up_r;
            f[10] += mid_c * low_l * up_c;
            f[11] += mid_c * up_l * low_c;
            f[12] += mid_c * mid_l * low_r;
            f[13] += mid_c * low_l * mid_r;
            f[14] += mid_c * low_c * up_r;
            f[15] += mid_c * up_c * low_r;
            f[16] += mid_c * up_l * mid_r;
            f[17] += mid_c * mid_l * up_c;
            f[18] += mid_c * up_l * low_l;
            f[19] += mid_c * mid_l * low_c;
            f[20] += mid_c * low_l * low_r;
            f[21] += mid_c * low_c * mid_r;
            f[22] += mid_c * up_r * low_r;
            f[23] += mid_c * up_c * mid_r;
            f[24] += mid_c * up_l * up_r;

            // 2次（追加10個：自乗を含むマスク）
            // 中心の自乗（1個）
            f[25] += mid_c * mid_c;
            // 中心²×外周4方向（4個）
            f[26] += mid_c * mid_c * mid_r;
            f[27] += mid_c * mid_c * up_r;
            f[28] += mid_c * mid_c * up_c;
            f[29] += mid_c * mid_c * up_l;
            // 中心×外周²の4方向（4個）
            f[30] += mid_c * mid_r * mid_r;
            f[31] += mid_c * up_r * up_r;
            f[32] += mid_c * up_c * up_c;
            f[33] += mid_c * up_l * up_l;
            // 中心の3乗（1個）
            f[34] += mid_c * mid_c * mid_c;
        }
    }

    f.to_vec()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// 2値画像（0.0/1.0）を濃淡HLACに通すと、0..24 は2値HLACと同じ値になり、
    /// 25..34 は f²=f, f³=f により下位次数のいずれかと一致することを確認する。
    #[test]
    fn grayscale_reduces_to_binary_for_binary_input() {
        let width = 8usize;
        let height = 8usize;
        // 適当な2値画像
        let pattern: Vec<u8> = (0..(width * height))
            .map(|i| if (i % 3 == 0) || (i % 5 == 0) { 255 } else { 0 })
            .collect();
        let pattern_f: Vec<f64> = pattern
            .iter()
            .map(|v| if *v == 255 { 1.0 } else { 0.0 })
            .collect();

        let bin = calculate_features(&pattern, width, height, 1);
        let gray = calculate_features_grayscale(&pattern_f, width, height, 1);

        // 0..24 はビット単位で一致
        for i in 0..25 {
            assert!(
                (gray[i] - bin[i] as f64).abs() < 1e-9,
                "index {} mismatch: gray={}, bin={}",
                i,
                gray[i],
                bin[i]
            );
        }

        // 追加マスクは2値だと既存マスクの値と一致するはず
        // f[25] = mid_c² = mid_c → f[0]
        assert!((gray[25] - bin[0] as f64).abs() < 1e-9);
        // f[26..29] = mid_c²×外周 = mid_c×外周 → f[1..4]
        for offset in 0..4 {
            assert!((gray[26 + offset] - bin[1 + offset] as f64).abs() < 1e-9);
        }
        // f[30..33] = mid_c×外周² = mid_c×外周 → f[1..4]
        for offset in 0..4 {
            assert!((gray[30 + offset] - bin[1 + offset] as f64).abs() < 1e-9);
        }
        // f[34] = mid_c³ = mid_c → f[0]
        assert!((gray[34] - bin[0] as f64).abs() < 1e-9);
    }

    /// 多値画像では2値HLACでは表現できない階調情報が、追加マスクに反映される。
    #[test]
    fn grayscale_distinguishes_multi_level() {
        let width = 5usize;
        let height = 5usize;
        // 全画素 0.5 の一様画像
        let half = vec![0.5f64; width * height];
        let result = calculate_features_grayscale(&half, width, height, 1);

        // 中心の3乗 f[34] = 0.5³ * 内部画素数 = 0.125 * 9 = 1.125
        let expected = 0.125 * 9.0;
        assert!(
            (result[34] - expected).abs() < 1e-9,
            "f[34]={}, expected={}",
            result[34],
            expected
        );
    }
}
