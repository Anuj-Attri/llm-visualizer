/**
 * Attention heatmap from modelOutput.attentions (real weights). Grayscale 0 = white, 1 = black.
 */

import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';

export default function AttentionGraph() {
  const modelOutput = useStore((s) => s.modelOutput);
  const [layer, setLayer] = useState(0);
  const [head, setHead] = useState(0);

  const { grid, tokens, numLayers, numHeads } = useMemo(() => {
    if (!modelOutput?.tokens?.length || !modelOutput?.attentions?.length) {
      return { grid: null, tokens: [], numLayers: 0, numHeads: 0 };
    }
    const tokens = modelOutput.tokens;
    const attentions = modelOutput.attentions;
    const numLayers = attentions.length;
    const numHeads = attentions[0]?.length ?? 0;
    const layerIdx = Math.min(layer, numLayers - 1);
    const headIdx = Math.min(head, numHeads - 1);
    const grid = attentions[layerIdx]?.[headIdx] ?? null;
    return { grid, tokens, numLayers, numHeads };
  }, [modelOutput?.tokens, modelOutput?.attentions, layer, head]);

  if (!modelOutput) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Attention</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">Run the model to see attention.</p>
      </div>
    );
  }

  if (modelOutput.attentions == null) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Attention</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">
          Attention weights unavailable for this model export. This is common with quantized models.
        </p>
      </div>
    );
  }

  if (!grid?.length) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Attention</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">No attention data for this layer/head.</p>
      </div>
    );
  }

  const seqLen = grid.length;
  const cellSize = Math.max(14, Math.min(36, 500 / seqLen));

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">
        Attention (layer {layer}, head {head})
      </h3>
      <p className="mt-2 text-xs text-[#6B6B6B]">
        Each cell shows how much attention token X pays to token Y during prediction. Darker = stronger attention.
      </p>
      <div className="mt-3 overflow-x-auto">
        <div
          className="inline-grid gap-px"
          style={{
            gridTemplateColumns: `auto repeat(${seqLen}, ${cellSize}px)`,
            gridTemplateRows: `auto repeat(${seqLen}, ${cellSize}px)`,
          }}
        >
          <div />
          {tokens.slice(0, seqLen).map((t, k) => (
            <div
              key={k}
              className="truncate text-center font-mono text-[10px] text-[#6B6B6B]"
              style={{ width: cellSize, minWidth: cellSize }}
              title={t}
            >
              {t.length > 4 ? t.slice(0, 3) + '…' : t}
            </div>
          ))}
          {grid.map((row, q) => (
            <React.Fragment key={q}>
              <div
                className="truncate pr-1 text-right font-mono text-[10px] text-[#6B6B6B]"
                style={{ lineHeight: `${cellSize}px` }}
                title={tokens[q]}
              >
                {tokens[q]?.length > 4 ? tokens[q].slice(0, 3) + '…' : tokens[q]}
              </div>
              {row.map((val, k) => {
                const v = Math.max(0, Math.min(1, val));
                const gray = Math.round(255 * (1 - v));
                return (
                  <div
                    key={`${q}-${k}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      minWidth: cellSize,
                      minHeight: cellSize,
                      backgroundColor: `rgb(${gray},${gray},${gray})`,
                    }}
                    title={`${tokens[q]} → ${tokens[k]}: ${v.toFixed(3)}`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
