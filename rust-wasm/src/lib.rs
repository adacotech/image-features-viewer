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
