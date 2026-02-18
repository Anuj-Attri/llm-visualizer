/**
 * Horizontal bar chart of top-10 token probabilities for the last position. Click a bar to append that token and re-run the model.
 */

import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { softmaxWithTemperature } from '../models/hooks';
import { getTokenizer } from '../models/gpt2';
import { runGPT2 } from '../models/gpt2';

export default function LogitBar() {
  const modelOutput = useStore((s) => s.modelOutput);
  const temperature = useStore((s) => s.temperature);
  const isLoading = useStore((s) => s.isLoading);
  const inputText = useStore((s) => s.inputText);
  const appendToken = useStore((s) => s.appendToken);
  const setModelOutput = useStore((s) => s.setModelOutput);
  const setIsLoading = useStore((s) => s.setIsLoading);

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

  const handlePick = (token) => {
    const newText = inputText + token;
    appendToken(token);
    setIsLoading(true);
    runGPT2(newText)
      .then((result) => setModelOutput(result))
      .catch((err) => {
        console.error('Re-run failed:', err);
        setModelOutput(null);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">
        Top 10 next-token probabilities (last position, T={temperature}) — click to append
      </h3>
      <div className="mt-2 space-y-1.5">
        {isLoading ? (
          <p className="animate-pulse font-mono text-xs text-[#6B6B6B]">computing…</p>
        ) : (
          top10.map(({ id, prob, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handlePick(label)}
              className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left transition hover:bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            >
              <span className="w-24 truncate text-xs text-[#0A0A0A]" title={label}>
                {label}
              </span>
              <div className="h-5 min-w-0 flex-1 overflow-hidden bg-[#F5F5F5]">
                <div
                  className="h-full bg-[#0A0A0A]"
                  style={{ width: `${(prob / maxProb) * 100}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs text-[#6B6B6B]">
                {(prob * 100).toFixed(2)}%
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
