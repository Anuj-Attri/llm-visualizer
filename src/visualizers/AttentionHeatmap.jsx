/**
 * Grid heatmap of attention weights for the selected layer/head. Reads from store.
 */

import React from 'react';
import { useStore } from '../store/useStore';

function blueScale(t) {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(255 * (1 - clamped));
  const g = Math.round(255 * (1 - clamped * 0.9));
  const b = 255;
  return `rgb(${r},${g},${b})`;
}

export default function AttentionHeatmap() {
  const modelOutput = useStore((s) => s.modelOutput);
  const currentLayer = useStore((s) => s.currentLayer);
  const currentHead = useStore((s) => s.currentHead);

  if (!modelOutput?.tokens?.length || !modelOutput?.attentionWeights?.length) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Attention Heatmap</h3>
        <p className="mt-2 text-xs text-gray-500">Run the model to see attention.</p>
      </div>
    );
  }

  const tokens = modelOutput.tokens;
  const numLayers = modelOutput.attentionWeights.length;
  const numHeads = modelOutput.attentionWeights[0]?.length ?? 0;
  const layer = Math.min(currentLayer, numLayers - 1);
  const head = Math.min(currentHead, numHeads - 1);
  const grid = modelOutput.attentionWeights[layer]?.[head];

  if (!grid || grid.length === 0) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Attention Heatmap</h3>
        <p className="mt-2 text-xs text-gray-500">No data for this layer/head.</p>
      </div>
    );
  }

  const seqLen = grid.length;
  const cellSize = Math.max(12, Math.min(32, 320 / seqLen));

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">
        Attention Heatmap (layer {layer}, head {head})
      </h3>
      <div className="mt-2 overflow-auto">
        <div className="inline-block">
          <div
            className="grid gap-px"
            style={{
              gridTemplateColumns: `auto repeat(${seqLen}, ${cellSize}px)`,
              gridTemplateRows: `auto repeat(${seqLen}, ${cellSize}px)`,
            }}
          >
            <div />
            {tokens.slice(0, seqLen).map((t, k) => (
              <div
                key={k}
                className="truncate text-center text-[10px] text-gray-600"
                style={{ width: cellSize, minWidth: cellSize }}
                title={t}
              >
                {t.length > 4 ? t.slice(0, 3) + '…' : t}
              </div>
            ))}
            {grid.map((row, q) => (
              <React.Fragment key={q}>
                <div
                  className="truncate pr-1 text-right text-[10px] text-gray-600"
                  style={{ lineHeight: `${cellSize}px` }}
                  title={tokens[q]}
                >
                  {tokens[q]?.length > 4 ? tokens[q].slice(0, 3) + '…' : tokens[q]}
                </div>
                {row.map((val, k) => (
                  <div
                    key={`${q}-${k}`}
                    className="rounded-sm"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      minWidth: cellSize,
                      minHeight: cellSize,
                      backgroundColor: blueScale(val),
                    }}
                    title={`${tokens[q]} → ${tokens[k]}: ${val.toFixed(3)}`}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
