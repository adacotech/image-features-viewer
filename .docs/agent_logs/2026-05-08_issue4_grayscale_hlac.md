# Issue #4 濃淡HLAC（35次元）+ Plotly.js 棒グラフ表示

## 作業目的
GitHub Issue #4「[2/4] 濃淡HLACによる特徴計算およびPlotly.jsによる棒グラフ表示」の実装。
2値HLAC（25次元）に加え、3×3局所近傍 / 0〜2次 / 対称性除去後の濃淡HLAC（35次元）を
Rust + WebAssembly で計算し、UI で 2値 / 濃淡 を切り替えられるようにする。

## 実施作業
1. Rust 側に `calculate_features_grayscale(image_data: &[f64], width, height, corr) -> Vec<f64>` を追加（rust-wasm/src/lib.rs）。
   - 既存25マスクに加え、自乗を含む追加10マスク（中心²、中心²×外周4方向、中心×外周²の4方向、中心³）を計算。
   - `cargo test` で「2値入力で 0..24 が既存と一致」「追加10マスクが既存いずれかと一致」「均一画像で f[34]=0.5³×9=1.125」を検証。
2. JS 側の features.ts を `FeatureMode = 'binary' | 'grayscale'` 対応にし、濃淡時は 0..255 を 0..1 に正規化して `Float64Array` で渡すように変更。
3. Graph コンポーネントを mode 受け取り型に改修。タイトル / X軸範囲 / マスク画像アノテーション / Y軸の固定レンジ条件を mode で動的化。
4. ControlPanel に `FeatureModeButton`（LooksTwoIcon / GradientIcon）を追加。
5. MainPage に `featureMode` 状態を持たせ、最後の ImageData を ref に保持。モード切替時に再計算するハンドラを追加。
6. `npm run build`（wasm-pack → tsc → vite）成功。`npm run lint` の残存 warning は pkg 配下の自動生成 dts のみ（既存挙動）。
7. Vite dev server を起動し、Canvas 描画 → 2値モード（25次元）→ 濃淡モード（35次元）への切替を実機検証。

## 変更ファイル
- rust-wasm/src/lib.rs
- src/utils/features.ts
- src/components/Graph/index.tsx
- src/components/ControlPanel/FeatureModeButton.tsx（新規）
- src/pages/main/index.tsx
- .claude/launch.json（新規・dev検証用）

## 技術判断
- **追加10マスクの構成**: 論文 Otsu & Kurita (1988) の正規な 35 マスク表は実装中にネット参照不可だったため、
  「2値入力で 0..24 が既存25次元と一致 + 25..34 は f²=f, f³=f により下位次数のいずれかへ縮退する」設計を採用。
  これにより issue の検証条件「2値画像入力で計算した結果が、25次元へ縮退して既存2値HLACと一致」を満たす。
- **入力スケール**: f² や f³ を含むため、0..255 の整数のまま積を取ると値が爆発する。Otsu の慣例どおり 0..1 正規化を採用。
- **直近 ImageData の保持**: モード切替時に Canvas の現状から再計算したいので、`useRef<ImageData | null>` で最新を保持する形にした。
- **Y軸レンジ**: 2値モードのみ最小高さ 100 を維持（既存挙動）。濃淡モードは値が小さくなるので動的レンジに任せる。

## 検証結果
- Rust ユニットテスト: 2 pass / 0 fail。
- フルビルド成功（dist 出力 OK）、ESLint は pkg 配下の自動生成 warning のみ。
- UI: Canvas 描画 → 2値モードで 25次元グラフ → 切替で 35次元グラフ表示、それぞれバーが立つことを確認。
- UIで描画した線画は Canvas のアンチエイリアシングにより階調を含むため、binary（閾値128適用）と grayscale（連続値）で
  f[0..24] が完全一致しないのは仕様通り。Rust テストでは「完全2値（0/1）」入力で縮退一致を確認済み。

## 未完了タスク
- マスク画像 25.png〜34.png と本実装の追加10マスクの並び順整合性は厳密検証していない（画像目視レベル）。
  必要なら、Rust 実装の係数行列から PNG を再生成するスクリプトを別 issue で起票検討。
- バンドルサイズ警告（5MB+）は Plotly 由来。issue #4 の範囲外。

## 次作業
- 続く Issue #5（画像読み込み + VGAリサイズ + グレースケール化）に着手すれば、濃淡HLAC が活きる多階調入力での可視化が可能。
