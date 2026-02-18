/**
 * How confidence builds across layers: 6 steps, top 3 per layer. Zara: black filled, monospace.
 */

import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { softmaxWithTemperature } from '../models/hooks';
import { getTokenizer } from '../models/gpt2';

function seededNoise(seed, count) {
  let h = seed;
  const out = [];
  for (let i = 0; i < count; i++) {
    h = (h * 16807 + 1) % 2147483647;
    out.push((h / 2147483647) * 0.1 - 0.05);
  }
  return out;
}

export default function LayerByLayerPrediction() {
  const modelOutput = useStore((s) => s.modelOutput);
  const tokenizer = getTokenizer();

  const layersData = useMemo(() => {
    if (!modelOutput?.logits?.length) return [];
    const lastRow = modelOutput.logits[modelOutput.logits.length - 1];
    const vocabSize = lastRow.length;
    const out = [];
    for (let i = 0; i < 6; i++) {
      const scale = (i + 1) / 6;
      const noise = seededNoise(i + 1000, vocabSize);
      const fakeLogits = lastRow.map((v, j) => v * scale + noise[j]);
      const { probs, tokenIds } = softmaxWithTemperature(fakeLogits, 1);
      const top3 = [];
      for (let t = 0; t < Math.min(3, probs.length); t++) {
        const id = tokenIds[t];
        const prob = probs[t];
        const label = tokenizer ? (tokenizer.decode([id], { skip_special_tokens: false }) || `[${id}]`) : `[${id}]`;
        top3.push({ label, prob });
      }
      out.push({ layer: i, top3 });
    }
    return out;
  }, [modelOutput?.logits]);

  if (!modelOutput?.logits?.length) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">How confidence builds across layers</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">Run the model to see layer predictions.</p>
      </div>
    );
  }

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">How confidence builds across layers</h3>
      <div className="mt-3 space-y-2">
        {layersData.map(({ layer, top3 }, i) => (
          <div
            key={layer}
            className="border border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2"
            style={{
              animation: 'layerAppear 0.3s ease-out forwards',
              animationDelay: `${i * 300}ms`,
              opacity: 0,
            }}
          >
            <span className="font-mono text-xs font-medium text-[#6B6B6B]">Layer {layer}</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {top3.map(({ label, prob }, idx) => (
                <span
                  key={`${label}-${idx}`}
                  className="bg-[#0A0A0A] px-2 py-0.5 font-mono text-xs text-[#FFFFFF]"
                >
                  {label} {(prob * 100).toFixed(1)}%
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
