/**
 * Probability Distribution: top 20 next-token predictions with rank, token, raw logit, probability %.
 */

import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { softmaxWithTemperature } from '../models/hooks';
import { getTokenizer } from '../models/gpt2';

const VOCAB_SIZE = 50257;

export default function ProbabilityDistribution() {
  const modelOutput = useStore((s) => s.modelOutput);
  const temperature = useStore((s) => s.temperature);

  const top20 = useMemo(() => {
    if (!modelOutput?.logits?.length) return [];
    const lastRow = modelOutput.logits[modelOutput.logits.length - 1];
    const { probs, tokenIds } = softmaxWithTemperature(lastRow, temperature);
    const tokenizer = getTokenizer();
    const items = [];
    for (let i = 0; i < Math.min(20, probs.length); i++) {
      const id = tokenIds[i];
      const prob = probs[i];
      const rawLogit = lastRow[id];
      const label = tokenizer ? (tokenizer.decode([id], { skip_special_tokens: false }) || `[${id}]`) : `id ${id}`;
      items.push({ rank: i + 1, id, label, rawLogit, prob });
    }
    return items;
  }, [modelOutput?.logits, temperature]);

  if (!modelOutput?.logits?.length) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Probability Distribution</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">Run the model to see predictions.</p>
      </div>
    );
  }

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Probability Distribution</h3>
      <p className="mt-2 text-xs text-[#6B6B6B]">
        The model outputs one score (logit) per vocabulary word. Higher = more likely. There are {VOCAB_SIZE.toLocaleString()} possible next tokens.
      </p>
      <div className="mt-3 max-h-64 overflow-y-auto">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="border-b border-[#E0E0E0] text-left text-[#6B6B6B]">
              <th className="py-1 pr-2">#</th>
              <th className="py-1 pr-2">Token</th>
              <th className="py-1 pr-2">Logit</th>
              <th className="py-1 text-right">Prob %</th>
            </tr>
          </thead>
          <tbody>
            {top20.map(({ rank, label, rawLogit, prob }) => (
              <tr key={rank} className="border-b border-[#E0E0E0]">
                <td className="py-1 pr-2 text-[#6B6B6B]">{rank}</td>
                <td className="py-1 pr-2 text-[#0A0A0A]">{label}</td>
                <td className="py-1 pr-2 text-[#6B6B6B]">{typeof rawLogit === 'number' && !Number.isFinite(rawLogit) ? '−∞' : Number(rawLogit).toFixed(2)}</td>
                <td className="py-1 text-right text-[#0A0A0A]">{(prob * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
