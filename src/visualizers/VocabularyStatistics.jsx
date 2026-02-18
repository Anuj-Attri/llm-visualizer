/**
 * Vocabulary Statistics: vocab size, candidate counts, entropy, plain-English interpretation, visual gauge.
 */

import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { softmaxWithTemperature } from '../models/hooks';

const VOCAB_SIZE = 50257;

function entropy(probs) {
  let h = 0;
  for (let i = 0; i < probs.length; i++) {
    const p = probs[i];
    if (p > 0) h -= p * Math.log(p);
  }
  return h;
}

export default function VocabularyStatistics() {
  const modelOutput = useStore((s) => s.modelOutput);
  const temperature = useStore((s) => s.temperature);

  const stats = useMemo(() => {
    if (!modelOutput?.logits?.length) return null;
    const lastRow = modelOutput.logits[modelOutput.logits.length - 1];
    const { probs } = softmaxWithTemperature(lastRow, temperature);
    const over1 = probs.filter((p) => p >= 0.01).length;
    const over01 = probs.filter((p) => p >= 0.001).length;
    const ent = entropy(probs);
    let interpretation = '';
    if (ent < 1) interpretation = 'Very confident — almost certain what comes next';
    else if (ent <= 3) interpretation = 'Moderately confident — a few good options';
    else interpretation = 'Uncertain — many words could follow';
    return { over1, over01, entropy: ent, interpretation };
  }, [modelOutput?.logits, temperature]);

  if (!modelOutput?.logits?.length) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Vocabulary Statistics</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">Run the model to see statistics.</p>
      </div>
    );
  }

  const { over1, over01, entropy: ent, interpretation } = stats;
  const maxEntropy = 12;
  const gaugePct = Math.min(100, (ent / maxEntropy) * 100);

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Vocabulary Statistics</h3>
      <ul className="mt-3 space-y-1 font-mono text-xs text-[#0A0A0A]">
        <li>Total vocabulary size: {VOCAB_SIZE.toLocaleString()}</li>
        <li>Tokens with &gt;1% probability: {over1}</li>
        <li>Tokens with &gt;0.1% probability: {over01}</li>
        <li>Entropy: {ent.toFixed(2)}</li>
      </ul>
      <p className="mt-2 text-xs text-[#6B6B6B]">{interpretation}</p>
      <div className="mt-3">
        <div className="mb-1 flex justify-between font-mono text-[10px] text-[#6B6B6B]">
          <span>0</span>
          <span>Entropy</span>
          <span>{maxEntropy}</span>
        </div>
        <div className="h-3 w-full bg-[#F5F5F5]">
          <div
            className="h-full bg-[#0A0A0A]"
            style={{ width: `${gaugePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
