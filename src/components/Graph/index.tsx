import React from 'react'
import Plot from 'react-plotly.js'
import {
  FEATURE_DIMS,
  computeOrderStats,
  getFeatureOrder,
  type FeatureMode,
} from '../../utils/features'
import type { DisplayMode } from '../ControlPanel/DiffModeButton'

interface GraphComponentProps {
  featuresA?: number[]
  featuresB?: number[]
  isLoading?: boolean
  mode?: FeatureMode
  // Why: 比較(compare) / 差分(diff, A-B) / 統計比較(stats, 次数別 (x−μ)/(σ+1)) を切替
  displayMode?: DisplayMode
}

// Why: A/B を見分ける固定カラー（凡例・色弁別性を考慮して青/橙）
const COLOR_A = '#2196F3'
const COLOR_A_LINE = '#1976D2'
const COLOR_B = '#FF9800'
const COLOR_B_LINE = '#F57C00'
// Why: 差分の正/負を直感的に判別できるよう色分け（正=A優勢=青, 負=B優勢=橙）
const COLOR_DIFF_POS = '#2196F3'
const COLOR_DIFF_NEG = '#FF9800'

const GraphComponent: React.FC<GraphComponentProps> = ({
  featuresA = [],
  featuresB = [],
  isLoading = false,
  mode = 'binary',
  displayMode = 'compare',
}) => {
  const dims = FEATURE_DIMS[mode]
  const defaultFeatures = new Array(dims).fill(0)
  // Why: 長さがモード次元と不一致なら 0 埋めにそろえ、表示崩れを防ぐ
  const seriesA = featuresA.length === dims ? featuresA : defaultFeatures
  const seriesB = featuresB.length === dims ? featuresB : defaultFeatures
  const xLabels = defaultFeatures.map((_, index) => `${index + 1}`)

  // 差分系列（A - B）
  const seriesDiff = seriesA.map((value, index) => value - seriesB[index])

  // 統計比較：次数ごとに A・B を合算した μ と σ を求め、(x − μ) / (σ + 1) に標準化する
  // Why: σ + 1 にしているのは、σ=0（次数内が一様）の場合の0除算回避と、
  //      σ が極端に小さい場合の発散を抑えるため（純粋な z-score より堅牢）。
  const orderStats = computeOrderStats(mode, seriesA, seriesB)
  const standardize = (value: number, index: number) => {
    const { mean, std } = orderStats[getFeatureOrder(mode, index)]
    return (value - mean) / (std + 1)
  }
  const seriesStatsA = seriesA.map(standardize)
  const seriesStatsB = seriesB.map(standardize)

  const isDiff = displayMode === 'diff'
  const isStats = displayMode === 'stats'

  // Y軸範囲：差分・統計比較は対称、比較表示は従来通り nonnegative
  const yAxisRange: [number, number] | undefined = (() => {
    if (isDiff) {
      const absMax = Math.max(...seriesDiff.map((value) => Math.abs(value)), 0)
      // Why: ゼロ周辺でも見やすいよう最低限の余白を確保
      const range = absMax === 0 ? 1 : absMax * 1.1
      return [-range, range]
    }
    if (isStats) {
      const absMax = Math.max(
        ...seriesStatsA.map((value) => Math.abs(value)),
        ...seriesStatsB.map((value) => Math.abs(value)),
        0,
      )
      const range = absMax === 0 ? 1 : absMax * 1.1
      return [-range, range]
    }
    const maxValue = Math.max(...seriesA, ...seriesB, 0)
    if (mode === 'binary' && maxValue <= 100) {
      return [0, 100]
    }
    return undefined
  })()

  // HLACマスク画像アノテーション（次元数ぶん）
  const imageAnnotations = defaultFeatures.map((_, index) => ({
    source: `${import.meta.env.BASE_URL}bin/hlac_mask/${index}.png`,
    xref: 'x' as const,
    yref: 'paper' as const,
    x: index + 1,
    y: -0.06,
    sizex: 0.9,
    sizey: 0.5,
    xanchor: 'center' as const,
    yanchor: 'middle' as const,
    layer: 'below' as const,
    sizing: 'contain' as const,
  }))

  const plotData = isDiff
    ? [
        {
          x: xLabels,
          y: seriesDiff,
          type: 'bar' as const,
          marker: {
            color: seriesDiff.map((value) =>
              value === 0
                ? '#E0E0E0'
                : value > 0
                  ? COLOR_DIFF_POS
                  : COLOR_DIFF_NEG,
            ),
            line: {
              color: seriesDiff.map((value) =>
                value >= 0 ? COLOR_A_LINE : COLOR_B_LINE,
              ),
              width: 1,
            },
          },
          name: 'A − B',
        },
      ]
    : isStats
      ? [
          {
            x: xLabels,
            y: seriesStatsA,
            type: 'bar' as const,
            marker: {
              color: seriesStatsA.map((value) =>
                value === 0 ? '#E0E0E0' : COLOR_A,
              ),
              line: { color: COLOR_A_LINE, width: 1 },
            },
            name: 'A 標準化',
          },
          {
            x: xLabels,
            y: seriesStatsB,
            type: 'bar' as const,
            marker: {
              color: seriesStatsB.map((value) =>
                value === 0 ? '#E0E0E0' : COLOR_B,
              ),
              line: { color: COLOR_B_LINE, width: 1 },
            },
            name: 'B 標準化',
          },
        ]
      : [
          {
            x: xLabels,
            y: seriesA,
            type: 'bar' as const,
            marker: {
              color: seriesA.map((value) => (value > 0 ? COLOR_A : '#E0E0E0')),
              line: { color: COLOR_A_LINE, width: 1 },
            },
            name: 'A',
          },
          {
            x: xLabels,
            y: seriesB,
            type: 'bar' as const,
            marker: {
              color: seriesB.map((value) => (value > 0 ? COLOR_B : '#E0E0E0')),
              line: { color: COLOR_B_LINE, width: 1 },
            },
            name: 'B',
          },
        ]

  const modeLabel = mode === 'binary' ? '2値' : '濃淡'
  const titleText = isDiff
    ? `HLAC特徴量 差分 A − B (${dims}次元・${modeLabel})`
    : isStats
      ? `HLAC特徴量 統計比較 次数別 (x−μ)/(σ+1) (${dims}次元・${modeLabel})`
      : `HLAC特徴量 A / B 比較 (${dims}次元・${modeLabel})`

  const layout = {
    title: {
      text: titleText,
      font: {
        size: 18,
        color: '#333',
      },
    },
    xaxis: {
      title: {
        text: 'マスクID',
        font: {
          size: 14,
          color: '#666',
        },
        standoff: 60,
      },
      dtick: 1,
      range: [0.5, dims + 0.5],
    },
    yaxis: {
      title: {
        text: '特徴量',
        font: {
          size: 14,
          color: '#666',
        },
      },
      range: yAxisRange,
      // Why: 差分・統計比較は負値を許可、比較表示は従来通り非負レンジ
      ...(isDiff || isStats ? {} : { rangemode: 'nonnegative' as const }),
      ...(isDiff || isStats ? { zeroline: true, zerolinecolor: '#999' } : {}),
    },
    images: imageAnnotations,
    plot_bgcolor: '#FAFAFA',
    paper_bgcolor: '#FAFAFA',
    margin: {
      l: 60,
      r: 30,
      t: 60,
      b: 180,
    },
    barmode: 'group' as const,
    // Why: 差分は1系列なので凡例非表示、比較・統計比較はA/Bを区別するため表示
    showlegend: !isDiff,
    legend: {
      orientation: 'h' as const,
      x: 1,
      xanchor: 'right' as const,
      y: 1.05,
      yanchor: 'bottom' as const,
    },
    font: {
      family: '"Noto Sans JP", Arial, sans-serif',
    },
  }

  const config = {
    displayModeBar: false,
    responsive: true,
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FAFAFA',
        padding: '20px',
        borderLeft: '1px solid #ddd',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{
          width: '100%',
          height: '100%',
        }}
        useResizeHandler={true}
      />

      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(250, 250, 250, 0.8)',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #E0E0E0',
              borderTop: '4px solid #2196F3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div
            style={{
              color: '#666',
              fontSize: '14px',
            }}
          >
            特徴量を計算中...
          </div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}
    </div>
  )
}

export default GraphComponent
