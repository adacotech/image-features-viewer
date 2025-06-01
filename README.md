# 画像特徴量みえる君

- 画像特徴量可視化アプリケーション。
- Canvas上で描画すると、Rust + WebAssemblyで特徴量を計算してグラフ表示します。

## 主な機能

- 640×480のCanvas上でマウス描画
- Rust + WebAssemblyによる特徴量計算
- Plotly.jsによる棒グラフ表示

## デモ

[GitHub Pages でアプリケーションを試す](https://shinue-rebonire.github.io/image-features-viewer/)

## 技術スタック

- **フロントエンド**: React 19.1.0 + TypeScript
- **ビルドツール**: Vite 6.3.5
- **可視化**: React Plotly.js
- **高速計算**: Rust + WebAssembly (wasm-pack)

## セットアップ

### 前提条件

- Node.js 20+
- Rust (最新安定版)
- wasm-pack

### インストール

```bash
# 依存関係をインストール
npm install

# wasm-packをインストール（未インストールの場合）
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
