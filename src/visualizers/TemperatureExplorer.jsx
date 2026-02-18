/**
 * Temperature & Sampling: top 8 bar chart, local temp slider. Zara: pure black bars on #F5F5F5.
 */

import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { softmaxWithTemperature } from '../models/hooks';
import { getTokenizer } from '../models/gpt2';

const MIN = 0.1;
const MAX = 2.0;
const STEP = 0.05;

export default function TemperatureExplorer() {
  const modelOutput = useStore((s) => s.modelOutput);
  const [localTemp, setLocalTemp] = useState(1.0);

  const { top8, caption } = useMemo(() => {
    if (!modelOutput?.logits?.length) return { top8: null, caption: '' };
    const lastRow = modelOutput.logits[modelOutput.logits.length - 1];
    const { probs, tokenIds } = softmaxWithTemperature(lastRow, localTemp);
    const tokenizer = getTokenizer();
    const items = [];
    for (let i = 0; i < Math.min(8, probs.length); i++) {
      const id = tokenIds[i];
      const prob = probs[i];
      const label = tokenizer ? (tokenizer.decode([id], { skip_special_tokens: false }) || `[${id}]`) : `id ${id}`;
      items.push({ id, prob, label });
    }
    const caption = localTemp < 0.7
      ? 'Low temp: model is confident'
      : localTemp > 1.2
        ? 'High temp: more surprising choices'
        : 'Medium temp: balanced';
    return { top8: items, caption };
  }, [modelOutput?.logits, localTemp]);

  if (!modelOutput?.logits?.length) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Temperature & Sampling</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">Run the model to see predictions.</p>
      </div>
    );
  }

  const maxProb = top8?.[0]?.prob ?? 1;

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Temperature & Sampling</h3>
      <div className="mt-2 flex items-center gap-3">
        <span className="font-mono text-xs text-[#6B6B6B]">Temp:</span>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={localTemp}
          onChange={(e) => setLocalTemp(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer bg-[#F5F5F5]"
          style={{ accentColor: '#0A0A0A' }}
        />
        <span className="w-10 text-right font-mono text-xs text-[#6B6B6B]">{localTemp.toFixed(2)}</span>
      </div>
      <div className="mt-3 space-y-1.5">
        {top8.map(({ id, prob, label }) => (
          <div key={id} className="flex items-center gap-2">
            <span className="w-20 truncate font-mono text-xs text-[#6B6B6B]" title={label}>
              {label}
            </span>
            <div className="h-5 min-w-0 flex-1 overflow-hidden bg-[#F5F5F5]">
              <div
                className="h-full bg-[#0A0A0A] transition-all duration-300"
                style={{ width: `${(prob / maxProb) * 100}%` }}
              />
            </div>
            <span className="w-12 text-right font-mono text-xs text-[#6B6B6B]">
              {(prob * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 font-mono text-xs text-[#6B6B6B]">{caption}</p>
    </div>
  );
}
