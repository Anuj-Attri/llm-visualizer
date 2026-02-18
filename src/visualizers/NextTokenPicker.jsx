/**
 * Top-8 next-token predictions as clickable chips. Click appends token to input and re-runs the model.
 */

import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { softmaxWithTemperature } from '../models/hooks';
import { getTokenizer } from '../models/gpt2';
import { runGPT2 } from '../models/gpt2';

export default function NextTokenPicker() {
  const modelOutput = useStore((s) => s.modelOutput);
  const inputText = useStore((s) => s.inputText);
  const temperature = useStore((s) => s.temperature);
  const appendToken = useStore((s) => s.appendToken);
  const setModelOutput = useStore((s) => s.setModelOutput);
  const setIsLoading = useStore((s) => s.setIsLoading);

  const top8 = useMemo(() => {
    if (!modelOutput?.logits?.length) return null;
    const logits = modelOutput.logits[modelOutput.logits.length - 1];
    const { probs, tokenIds } = softmaxWithTemperature(logits, temperature);
    const tokenizer = getTokenizer();
    const items = [];
    for (let i = 0; i < Math.min(8, probs.length); i++) {
      const id = tokenIds[i];
      const prob = probs[i];
      const label = tokenizer ? (tokenizer.decode([id], { skip_special_tokens: false }) || `[${id}]`) : `id ${id}`;
      items.push({ id, prob, label });
    }
    return items;
  }, [modelOutput?.logits, temperature]);

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

  if (!modelOutput?.logits?.length) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Next token</h3>
        <p className="mt-2 text-xs text-gray-500">Run the model to start building a sentence.</p>
      </div>
    );
  }

  if (!top8?.length) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Next token</h3>
        <p className="mt-2 text-xs text-gray-500">No predictions.</p>
      </div>
    );
  }

  const maxProb = top8[0]?.prob ?? 1;

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Next token</h3>
      <p className="mt-1 text-xs font-medium text-gray-500">Built so far:</p>
      <p className="mt-0.5 rounded bg-amber-50 px-2 py-1.5 font-mono text-sm text-amber-900 border border-amber-200">
        {inputText || '(empty)'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {top8.map(({ id, prob, label }) => {
          const pct = prob / maxProb;
          const saturation = 40 + Math.round(pct * 60);
          const scale = 0.85 + pct * 0.35;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handlePick(label)}
              className="rounded-lg px-3 py-2 font-medium text-white shadow transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{
                backgroundColor: `hsl(220, ${saturation}%, 45%)`,
                transform: `scale(${scale})`,
              }}
              title={`${label} (${(prob * 100).toFixed(1)}%)`}
            >
              <span className="block truncate max-w-[8rem]">{label}</span>
              <span className="text-[10px] opacity-90">{(prob * 100).toFixed(1)}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
