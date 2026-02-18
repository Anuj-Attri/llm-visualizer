/**
 * Heatmap of hidden state for selected layer (tokens × dimensions). Diverging scale centered at 0.
 */

import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';

function divergingColor(val, minVal, maxVal) {
  const range = Math.max(maxVal - minVal, 1e-9);
  const zero = -minVal / range;
  const t = (val - minVal) / range;
  if (t <= zero) {
    const s = zero === 0 ? 0 : t / zero;
    const r = Math.round(255 * (1 - s));
    const g = Math.round(255 * (1 - s));
    const b = 255;
    return `rgb(${r},${g},${b})`;
  }
  const s = (t - zero) / (1 - zero);
  const r = 255;
  const g = Math.round(255 * (1 - s));
  const b = Math.round(255 * (1 - s));
  return `rgb(${r},${g},${b})`;
}

export default function ResidualStream() {
  const modelOutput = useStore((s) => s.modelOutput);
  const [layer, setLayer] = useState(0);

  const { grid, minVal, maxVal, tokens } = useMemo(() => {
    if (!modelOutput?.hiddenStates?.length || !modelOutput?.tokens?.length) {
      return { grid: null, minVal: 0, maxVal: 0, tokens: [] };
    }
    const numLayers = modelOutput.hiddenStates.length;
    const layerIdx = Math.min(layer, numLayers - 1);
    const layerData = modelOutput.hiddenStates[layerIdx];
    if (!layerData?.length) return { grid: null, minVal: 0, maxVal: 0, tokens: modelOutput.tokens };
    let minV = Infinity;
    let maxV = -Infinity;
    for (let s = 0; s < layerData.length; s++) {
      for (let d = 0; d < layerData[s].length; d++) {
        const v = layerData[s][d];
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      }
    }
    return {
      grid: layerData,
      minVal: minV,
      maxVal: maxV,
      tokens: modelOutput.tokens,
    };
  }, [modelOutput, layer]);

  if (!modelOutput?.tokens?.length || !modelOutput?.hiddenStates?.length) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Residual Stream</h3>
        <p className="mt-2 text-xs text-gray-500">Run the model to see residual stream.</p>
      </div>
    );
  }

  if (!grid?.length) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Residual Stream</h3>
        <p className="mt-2 text-xs text-gray-500">No data for this layer.</p>
      </div>
    );
  }

  const seqLen = grid.length;
  const numDims = grid[0]?.length ?? 0;
  const cellW = Math.max(8, Math.min(24, 400 / seqLen));
  const cellH = Math.max(4, Math.min(12, 200 / numDims));

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">
        Residual Stream (layer {layer}) — tokens × dimensions
      </h3>
      <div className="mt-2 overflow-auto">
        <div className="inline-block">
          <div
            className="grid gap-px"
            style={{
              gridTemplateColumns: `auto repeat(${seqLen}, ${cellW}px)`,
              gridTemplateRows: `auto repeat(${numDims}, ${cellH}px)`,
            }}
          >
            <div />
            {tokens.slice(0, seqLen).map((t, c) => (
              <div
                key={c}
                className="truncate text-center text-[9px] text-gray-600 rotate-0"
                style={{ width: cellW, minWidth: cellW }}
                title={t}
              >
                {t.length > 3 ? t.slice(0, 2) + '…' : t}
              </div>
            ))}
            {grid[0].map((_, d) => (
              <React.Fragment key={d}>
                <div
                  className="pr-1 text-right text-[9px] text-gray-500"
                  style={{ lineHeight: `${cellH}px` }}
                >
                  {d}
                </div>
                {grid.map((row, c) => (
                  <div
                    key={`${c}-${d}`}
                    className="rounded-sm"
                    style={{
                      width: cellW,
                      height: cellH,
                      minWidth: cellW,
                      minHeight: cellH,
                      backgroundColor: divergingColor(row[d], minVal, maxVal),
                    }}
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
