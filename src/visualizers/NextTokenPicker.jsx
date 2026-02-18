/**
 * Top-8 next-token predictions as clickable chips. Zara: black border, white fill, hover inverts.
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
  const isLoading = useStore((s) => s.isLoading);
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
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Next token</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">Run the model to start building a sentence.</p>
      </div>
    );
  }

  if (!top8?.length) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Next token</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">No predictions.</p>
      </div>
    );
  }

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Next token</h3>
      <p className="mt-1 text-xs font-medium uppercase tracking-widest text-[#6B6B6B]">Built so far:</p>
      <p className="mt-0.5 border border-[#E0E0E0] bg-[#F5F5F5] px-2 py-1.5 font-mono text-sm text-[#0A0A0A]">
        {inputText || '(empty)'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {isLoading ? (
          <span className="animate-pulse font-mono text-sm text-[#6B6B6B]">computing…</span>
        ) : (
          top8.map(({ id, prob, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handlePick(label)}
              className="border border-[#0A0A0A] bg-[#FFFFFF] px-3 py-2 font-mono text-sm text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
              title={`${label} (${(prob * 100).toFixed(1)}%)`}
            >
              <span className="block truncate max-w-[8rem]">{label}</span>
              <span className="text-[10px] opacity-90">{(prob * 100).toFixed(1)}%</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
