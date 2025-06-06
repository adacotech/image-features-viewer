# 画像特徴量みえる君

- 画像特徴量可視化アプリケーション。
- Canvas上で描画すると、Rust + WebAssemblyで特徴量を計算してグラフ表示します。

## 主な機能

- Canvas上（640×480）でマウス描画
  - 直線 or フリーハンド
- Rust + WebAssemblyによる特徴量計算
  - 25次元HLAC特徴量
- Plotly.jsによる棒グラフ表示

## デモ

[GitHub Pages でアプリケーションを試す](https://adacotech.github.io/image-features-viewer/)

## セットアップ

### 前提

- Node.js 20+
- Rust 1.82+
- wasm-pack

### インストール

```bash
# 依存関係をインストール
npm install

# wasm-packをインストール
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### 開発環境の起動

```bash
# WASMをビルド
npm run build:wasm

# 起動
npm run dev
```

## ビルド

```bash
# 本番用ビルド（WASM + React）
npm run build

# ローカルでプレビュー
npm run preview
```

## 開発コマンド

```bash
npm run dev                 # 起動
npm run build:wasm          # WASMビルド
npm run build               # 全体ビルド
npm run preview             # ビルド版プレビュー

npm run lint                # ESLint実行
npm run format              # Prettier実行
npm run format:check        # フォーマットチェック
```
