/**
 * Attention Flow: tokens as boxes, black SVG arcs with opacity = weight.
 */

import { useMemo } from 'react';
import { useStore } from '../store/useStore';

const MIN_WEIGHT = 0.1;

export default function AttentionFlow() {
  const modelOutput = useStore((s) => s.modelOutput);
  const currentLayer = useStore((s) => s.currentLayer);
  const currentHead = useStore((s) => s.currentHead);

  const { tokens, grid, strongest } = useMemo(() => {
    if (!modelOutput?.tokens?.length || !modelOutput?.attentionWeights?.length) {
      return { tokens: [], grid: null, strongest: null };
    }
    const tokens = modelOutput.tokens;
    const numLayers = modelOutput.attentionWeights.length;
    const numHeads = modelOutput.attentionWeights[0]?.length ?? 0;
    const layer = Math.min(currentLayer, numLayers - 1);
    const head = Math.min(currentHead, numHeads - 1);
    const grid = modelOutput.attentionWeights[layer]?.[head];
    if (!grid) return { tokens, grid: null, strongest: null };
    let maxVal = 0;
    let maxQ = 0;
    let maxK = 0;
    for (let q = 0; q < grid.length; q++) {
      for (let k = 0; k < grid[q].length; k++) {
        if (grid[q][k] > maxVal) {
          maxVal = grid[q][k];
          maxQ = q;
          maxK = k;
        }
      }
    }
    const strongest = maxVal >= MIN_WEIGHT
      ? { from: tokens[maxQ], to: tokens[maxK], pct: (maxVal * 100).toFixed(1) }
      : null;
    return { tokens, grid, strongest };
  }, [modelOutput, currentLayer, currentHead]);

  const arcs = useMemo(() => {
    if (!grid || !tokens.length) return [];
    const out = [];
    for (let q = 0; q < grid.length; q++) {
      for (let k = 0; k < grid[q].length; k++) {
        const w = grid[q][k];
        if (w >= MIN_WEIGHT) out.push({ q, k, weight: w });
      }
    }
    return out;
  }, [grid]);

  if (!modelOutput?.tokens?.length) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Attention Flow</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">Run the model to see attention.</p>
      </div>
    );
  }

  const boxW = 48;
  const boxH = 28;
  const padding = 24;
  const totalW = tokens.length * (boxW + 16) + padding * 2;
  const svgH = 120;

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">
        Attention Flow (layer {currentLayer}, head {currentHead})
      </h3>
      <div className="mt-2 overflow-x-auto">
        <svg
          width={totalW}
          height={svgH}
          className="overflow-visible"
        >
          {arcs.map(({ q, k, weight }, idx) => {
            const x1 = padding + q * (boxW + 16) + boxW / 2;
            const x2 = padding + k * (boxW + 16) + boxW / 2;
            const y1 = 40;
            const y2 = 40;
            const midX = (x1 + x2) / 2;
            const curve = Math.abs(k - q) * 8;
            const path = `M ${x1} ${y1} Q ${midX + curve} 10 ${x2} ${y2}`;
            return (
              <path
                key={`${q}-${k}`}
                d={path}
                fill="none"
                stroke="#0A0A0A"
                strokeWidth={1}
                strokeOpacity={weight}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1}
                style={{
                  animation: 'arcStroke 0.5s ease-out forwards',
                  animationDelay: `${idx * 30}ms`,
                }}
              />
            );
          })}
          {tokens.map((t, i) => (
            <g key={i} transform={`translate(${padding + i * (boxW + 16)}, 24)`}>
              <rect
                width={boxW}
                height={boxH}
                fill="#FFFFFF"
                stroke="#0A0A0A"
                strokeWidth={1}
              />
              <text
                x={boxW / 2}
                y={boxH / 2 + 4}
                textAnchor="middle"
                className="fill-[#0A0A0A] font-mono text-[10px]"
              >
                {t.length > 6 ? t.slice(0, 5) + '…' : t}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {strongest && (
        <p className="mt-2 font-mono text-xs text-[#6B6B6B]">
          Strongest connection: &quot;{strongest.from}&quot; → &quot;{strongest.to}&quot; ({strongest.pct}%)
        </p>
      )}
    </div>
  );
}
