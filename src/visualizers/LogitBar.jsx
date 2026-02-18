/**
 * Horizontal bar chart of top-10 token probabilities for the last position. Reads from store.
 */

import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { softmaxWithTemperature } from '../models/hooks';
import { getTokenizer } from '../models/gpt2';

export default function LogitBar() {
  const modelOutput = useStore((s) => s.modelOutput);
  const temperature = useStore((s) => s.temperature);

  const top10 = useMemo(() => {
    if (!modelOutput?.logits?.length) return null;
    const logits = modelOutput.logits;
    const lastRow = logits[logits.length - 1];
    const { probs, tokenIds } = softmaxWithTemperature(lastRow, temperature);
    const tokenizer = getTokenizer();
    const items = [];
    for (let i = 0; i < Math.min(10, probs.length); i++) {
      const id = tokenIds[i];
      const prob = probs[i];
      const label = tokenizer ? (tokenizer.decode([id], { skip_special_tokens: false }) || `[${id}]`) : `id ${id}`;
      items.push({ id, prob, label });
    }
    return items;
  }, [modelOutput?.logits, temperature]);

  if (!modelOutput?.logits?.length) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Logit Bar</h3>
        <p className="mt-2 text-xs text-gray-500">Run the model to see logits.</p>
      </div>
    );
  }

  if (!top10?.length) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Logit Bar</h3>
        <p className="mt-2 text-xs text-gray-500">No logits to display.</p>
      </div>
    );
  }

  const maxProb = top10[0]?.prob ?? 1;

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">
        Top 10 next-token probabilities (last position, T={temperature})
      </h3>
      <div className="mt-2 space-y-1.5">
        {top10.map(({ id, prob, label }, i) => (
          <div key={id} className="flex items-center gap-2">
            <span className="w-24 truncate text-xs text-gray-700" title={label}>
              {label}
            </span>
            <div className="flex-1 min-w-0 h-5 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded"
                style={{ width: `${(prob / maxProb) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-12 text-right">
              {(prob * 100).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
