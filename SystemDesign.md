# 画像特徴量みえる君 システム設計書

## 1. 概要

リアルタイム画像特徴量可視化アプリケーション。ユーザーがCanvas上に自由に描画すると、その画像から特徴量を抽出してグラフ表示する対話型ツールです。

### 主な機能
- **描画機能**: 黒背景のCanvas上でマウスによる自由線描画
- **リアルタイム特徴量抽出**: 描画と同時に画像特徴量を計算
- **可視化**: 抽出した特徴量を棒グラフで表示
- **高性能処理**: 将来的にRust + WebAssemblyによる高速な画像処理

## 2. ユーザーインターフェース

### 2.1 レイアウト
```
+---------------------------------------------------------------------+
|                    Title Header Area                               |
|              画像特徴量みえる君 (Image Features Viewer)              |
+---------------------------------------------------------------------+
+----------------------------------+----------------------------------+
|            Canvas Area           |           Graph Area             |
|                                  |                                  |
|  - 背景: 黒                       |  - 棒グラフ表示                   |
|  - 線の色: 白                     |  - リアルタイム更新               |
|  - 線の太さ: 1px                  |  - X軸: 特徴量インデックス         |
|  - マウス描画対応                  |  - Y軸: 特徴量の値                |
|                                  |  - ローディング状態表示            |
+----------------------------------+----------------------------------+
|                   Control Panel                                    |
|                    [描画クリア]                                      |
+---------------------------------------------------------------------+
```

### 2.2 操作方法
- **描画**: マウスドラッグで自由線を描画
- **クリア**: 描画クリアボタンでCanvas内容をクリア
- **リアルタイム更新**: 描画中に自動的にグラフが更新

## 3. 技術スタック

### 3.1 フロントエンド
- **React 19.1.0**: UIコンポーネント管理
- **TypeScript**: 型安全な開発
- **React Plotly.js**: グラフ可視化ライブラリ
- **HTML5 Canvas**: 描画機能
- **Vite**: 開発・ビルドツール

### 3.2 バックエンド（WebAssembly）
- **Rust**: 高性能な画像処理（将来実装予定）
- **wasm-bindgen**: Rust ↔ JavaScript間のバインディング
- **wasm-pack**: WebAssembly パッケージビルドツール

### 3.3 開発ツール
- **ESLint**: コード品質管理
- **Prettier**: コードフォーマット
- **TypeScript Compiler**: 型チェック

## 4. システムアーキテクチャ

### 4.1 データフロー
```
[ユーザー描画] 
    ↓
[Canvas API] → [ImageData取得]
    ↓
[JavaScript特徴量抽出] → [8種類の特徴量計算]
    ↓
[React State更新] → [グラフ更新]
    ↓
[Plotly.js] → [棒グラフ表示]
```

### 4.2 コンポーネント構成
```
App (/src/App.tsx)
├── Router (将来のルーティング用)
└── MainPage (/src/pages/main/index.tsx) ✅ 実装済み
    ├── HeaderComponent (/src/components/Header/index.tsx) ✅ 実装済み
    │   ├── APP_CONFIG.name表示
    │   ├── ダークテーマデザイン
    │   └── Flexboxレイアウト
    ├── CanvasComponent (/src/components/Canvas/index.tsx) ✅ 実装済み
    │   ├── HTML5 Canvas要素 (640×480固定)
    │   ├── マウス描画機能 (白線、1px太さ)
    │   ├── 描画イベント処理
    │   ├── ImageData抽出・通知
    │   ├── レスポンシブ表示・座標変換
    │   └── 外部クリア機能 (forwardRef/useImperativeHandle)
    ├── GraphComponent (/src/components/Graph/index.tsx) ✅ 実装済み
    │   ├── Plotly.js棒グラフ表示
    │   ├── 8種類特徴量の可視化
    │   ├── 動的カラーリング（値>0時青色、0時グレー）
    │   ├── Y軸固定範囲[0,100]でレイアウト安定性確保
    │   ├── ローディング状態表示（スピナー・オーバーレイ）
    │   ├── 日本語ラベル・Noto Sans JPフォント
    │   └── レスポンシブ対応
    ├── Button (/src/components/Button/index.tsx) ✅ 実装済み
    │   ├── 汎用ボタンコンポーネント
    │   ├── 3つのバリエーション (primary/secondary/danger)
    │   ├── 3つのサイズ (small/medium/large)
    │   └── Material Design風スタイル
    ├── ControlPanel ✅ 実装済み
    │   ├── ClearButton (/src/components/ControlPanel/ClearButton.tsx) ✅ 実装済み
    │   │   ├── Canvas描画クリア機能
    │   │   ├── danger variant使用
    │   │   └── Canvas参照連携
    │   ├── ExportButton (データエクスポート) 🔄 未実装
    │   └── SettingsButton (設定オプション) 🔄 未実装
    └── FeatureExtractor (/src/utils/features.ts) ✅ 実装済み
        ├── ImageData前処理
        ├── 8種類特徴量計算
        └── リアルタイム抽出
```

#### 実装ステータス
- ✅ **完了**: 
  - **コアUI**: HeaderComponent、CanvasComponent、GraphComponent、Button、ClearButton
  - **機能**: リアルタイム描画、特徴量抽出、グラフ可視化、クリア機能
  - **統合**: MainPage完全統合、アプリケーション名共通化
  - **UX**: ローディング状態、レスポンシブレイアウト、安定したUI
- 🔄 **次のステップ**: 残りのControlPanel機能（ExportButton、SettingsButton）
- 📋 **将来計画**: WASM統合による高速化

#### ディレクトリ別の役割
- **pages/**: 画面全体を構成するページコンポーネント
  - `main/index.tsx`: メイン画面の全体レイアウト管理とstate管理
- **components/**: 再利用可能なUIコンポーネント
  - 複数のページで共通利用できる部品を配置
- **utils/**: 共通ユーティリティ関数
  - `features.ts`: 特徴量抽出ロジック
- **constants/**: アプリケーション定数
- **hooks/**: カスタムフック（将来使用予定）

## 5. 特徴量抽出仕様

### 5.1 入力仕様
- **画像形式**: Canvas ImageData (RGBA)
- **前処理**: 白ピクセル検出（RGB値200以上）
- **サイズ**: Canvas実サイズ（640×480）

### 5.2 実装済み特徴量（8種類）
1. **ピクセル密度**: 白ピクセルの全体に対する割合（%）
2. **水平エッジ数**: 垂直方向の隣接ピクセル差分（簡易エッジ検出）
3. **垂直エッジ数**: 水平方向の隣接ピクセル差分（簡易エッジ検出）
4. **中央領域密度**: 画像中央1/4領域の白ピクセル密度（%）
5. **左半分密度**: 画像左半分の白ピクセル密度（%）
6. **右半分密度**: 画像右半分の白ピクセル密度（%）
7. **上半分密度**: 画像上半分の白ピクセル密度（%）
8. **下半分密度**: 画像下半分の白ピクセル密度（%）

### 5.3 出力仕様
- **形式**: 数値配列（number[]）
- **値の範囲**: 0-100（密度系）、0-数百（エッジ系）
- **可視化**: 棒グラフ
- **更新頻度**: リアルタイム（描画イベント毎、50ms遅延）

## 6. パフォーマンス要件

### 6.1 応答性
- **描画レスポンス**: 16ms以下（60fps対応）
- **特徴量計算**: 50ms（現在の実装）
- **グラフ更新**: 即座（Plotly.jsによる）

### 6.2 最適化戦略
- **現在**: JavaScript実装による基本的な特徴量抽出
- **将来**: WASM活用による計算集約的処理の高速化
- **UI最適化**: 固定Y軸範囲、オーバーレイローディングでレイアウト安定性確保

## 7. 開発・実行環境

### 7.1 セットアップ
```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

### 7.2 ビルドコマンド
- **開発サーバー**: `npm run dev`
- **本番ビルド**: `npm run build`
- **リント**: `npm run lint`
- **フォーマット**: `npm run format`

### 7.3 ディレクトリ構成
```
image-features-viewer/
├── src/                    # React アプリケーション
│   ├── pages/             # 画面ページコンポーネント
│   │   └── main/          # メイン画面
│   │       └── index.tsx  # メイン画面コンポーネント（統合・state管理）
│   ├── components/         # 再利用可能UIコンポーネント
│   │   ├── Header/        # ヘッダーコンポーネント
│   │   │   └── index.tsx  # HeaderComponent
│   │   ├── Canvas/        # Canvasコンポーネント
│   │   │   └── index.tsx  # CanvasComponent (640×480描画)
│   │   ├── Button/        # 汎用ボタンコンポーネント
│   │   │   └── index.tsx  # Button (Material Design風)
│   │   ├── Graph/         # グラフコンポーネント
│   │   │   └── index.tsx  # GraphComponent (Plotly.js統合)
│   │   └── ControlPanel/  # コントロールパネル
│   │       └── ClearButton.tsx  # 描画クリアボタン
│   ├── constants/         # アプリケーション定数
│   │   └── app.ts         # アプリケーション設定値
│   ├── utils/             # ユーティリティ
│   │   └── features.ts    # 特徴量抽出ロジック
│   └── hooks/             # カスタムフック（未使用）
├── rust-wasm/              # Rust + WASM コード（将来実装）
│   └── src/               # WASM プロジェクト
├── public/                 # 静的ファイル
├── dist/                   # ビルド出力
├── vite.config.ts         # Vite設定（HTML動的生成含む）
└── package.json           # アプリケーション名設定含む
```

## 8. 実装詳細

### 8.1 アプリケーション名の共通化
アプリケーション名「画像特徴量みえる君」は以下の場所で一元管理されています：

#### 設定ファイル
```typescript
// src/constants/app.ts
export const APP_CONFIG = {
  name: '画像特徴量みえる君',
} as const
```

#### package.json設定
```json
{
  "displayName": "画像特徴量みえる君"
}
```

#### 使用箇所
- **HeaderComponent**: `APP_CONFIG.name`を参照
- **HTMLタイトル**: Vite設定により`package.json`の`displayName`を自動設定
- **一元管理**: 変更時は1箇所の修正で全体に反映

### 8.2 Vite設定による動的HTML生成
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml: (html) => {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>${packageJson.displayName}</title>`
        )
      }
    }
  ],
})
```

### 8.3 CanvasComponent実装詳細
#### 技術仕様
- **固定解像度**: 640×480ピクセル
- **描画設定**: 黒背景（#000000）、白い線（#FFFFFF）、1px太さ
- **マウスイベント**: onMouseDown/Move/Up/Leave処理
- **座標変換**: 表示サイズ ↔ Canvas座標の正確な変換

#### 主要機能
```typescript
interface CanvasComponentProps {
  onImageDataChange?: (imageData: ImageData) => void
}
```

- **描画機能**: なめらかな線描画（lineCap: 'round'）
- **ImageData通知**: 描画変更時に親コンポーネントへ通知
- **レスポンシブ**: アスペクト比保持でコンテナサイズに適応
- **クリア機能**: programmaticなCanvas内容リセット

#### レイアウト特徴
- **中央配置**: `alignItems/justifyContent: 'center'`
- **最大サイズ**: `maxWidth/maxHeight: 100%`
- **視覚的境界**: `border: '1px solid #333'`
- **カーソル**: `cursor: 'crosshair'` で描画モード表示

### 8.4 GraphComponent実装詳細
#### 技術仕様
- **ライブラリ**: React Plotly.js
- **グラフタイプ**: 棒グラフ（bar chart）
- **データ数**: 8種類の特徴量を表示

#### 主要機能
```typescript
interface GraphComponentProps {
  features?: number[]
  isLoading?: boolean
}
```

**視覚的特徴**:
- **動的カラーリング**: 値>0時は青色（#2196F3）、値=0時はグレー（#E0E0E0）
- **固定Y軸範囲**: [0, 100]でレイアウトシフトを防止
- **日本語ラベル**: "特徴量1" ～ "特徴量8"、"画像特徴量"タイトル
- **フォント**: "Noto Sans JP"統一

**ローディング状態**:
- **オーバーレイ**: 半透明背景でグラフを覆う
- **スピナー**: 青色の回転アニメーション（CSS @keyframes）
- **メッセージ**: "特徴量を計算中..."
- **レイアウト保持**: position: absoluteでレイアウトシフト防止

**レスポンシブ対応**:
- **useResizeHandler**: Plotlyの自動リサイズ
- **Flexレイアウト**: flex: 1で残り領域を全て使用
- **config**: displayModeBar: falseでシンプルな表示

### 8.5 特徴量抽出実装詳細
#### ファイル構成
```typescript
// src/utils/features.ts
export const extractFeatures = (imageData: ImageData): number[] => {
  // 8種類の特徴量を計算
}
```

#### 抽出アルゴリズム
1. **白ピクセル判定**: RGB値200以上を白と判定
2. **エッジ検出**: 隣接ピクセル差分50以上をエッジと判定
3. **領域分割**: 中央1/4、左右半分、上下半分で密度計算
4. **正規化**: 密度は%表示、エッジ数は100で除算

#### パフォーマンス
- **処理時間**: 50ms遅延でリアルタイム感を保持
- **メモリ効率**: ImageDataを直接走査、中間配列不使用
- **精度**: 十分な特徴量分離性能を確保

### 8.6 ButtonコンポーネントとClearButton実装詳細
#### Button汎用コンポーネント (`/src/components/Button/index.tsx`)
```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
}
```

**バリエーション**:
- **primary**: 青色（#2196F3）- 主要なアクション
- **secondary**: グレー色（#F5F5F5）- 副次的なアクション  
- **danger**: 赤色（#F44336）- 破壊的なアクション

**サイズ**:
- **small**: 6px/12px padding, 12px font
- **medium**: 8px/16px padding, 14px font
- **large**: 12px/24px padding, 16px font

**Material Design風機能**:
- 影効果（box-shadow）
- ホバーアニメーション
- 滑らかなトランジション（0.2s）
- disabled状態の視覚的フィードバック

#### ClearButton実装 (`/src/components/ControlPanel/ClearButton.tsx`)
```typescript
interface ClearButtonProps {
  onClear: () => void
  disabled?: boolean
}
```

**機能特徴**:
- **danger variant使用**: 破壊的操作の明確な視覚化
- **Canvas連携**: MainPageでuseRefとuseImperativeHandleを使用
- **即座実行**: クリック時に描画内容を即座にクリア
- **状態同期**: クリア後にgraphもリセット

#### Canvas-Button連携アーキテクチャ
```typescript
// MainPage での実装
const canvasRef = useRef<CanvasRef>(null)
const handleClearCanvas = () => {
  canvasRef.current?.clearCanvas()
  setFeatures([]) // グラフもクリア
}

// CanvasComponent での公開API
export interface CanvasRef {
  clearCanvas: () => void
}
```

### 8.7 MainPage統合アーキテクチャ
#### State管理
```typescript
const [features, setFeatures] = useState<number[]>([])
const [isCalculating, setIsCalculating] = useState(false)
```

#### データフロー制御
```typescript
const handleImageDataChange = async (imageData: ImageData) => {
  setIsCalculating(true)
  setTimeout(() => {
    const extractedFeatures = extractFeatures(imageData)
    setFeatures(extractedFeatures)
    setIsCalculating(false)
  }, 50)
}
```

### 8.8 スタイリング仕様
#### ヘッダーデザイン
- **背景色**: `#353A45` (ダークグレー)
- **文字色**: `#F6F7F9` (ライトグレー)
- **フォント**: "Noto Sans JP", 24px, 太字
- **レイアウト**: Flexbox、フルスクリーン対応

#### レイアウト構成
- **フルスクリーン**: `height: 100vh`
- **メインエリア**: Flexbox横並び（Canvas | Graph）
- **コントロールパネル**: 下部footer、中央配置
- **レスポンシブ**: minHeight: 0でオーバーフロー制御

#### CSS構成
- **グローバルリセット**: `box-sizing: border-box`適用
- **フルスクリーン対応**: `width: 100%`, `height: 100vh`
- **Flexboxレイアウト**: 柔軟なレスポンシブデザイン

## 9. 今後の拡張可能性

### 9.1 機能拡張
- 画像ファイルの読み込み対応
- 特徴量の種類選択機能
- 描画ツールの追加（消しゴム、図形など）
- 特徴量データのエクスポート機能
- 描画履歴・アンドゥ機能

### 9.2 技術的改善
- **WASM統合**: Rustによる高速特徴量計算
- **WebGPU対応**: GPU計算による更なる高速化
- **PWA対応**: オフライン利用・インストール機能
- **マルチスレッド処理**: Web Workersによる計算分離
- **機械学習モデル統合**: より高度な特徴量抽出