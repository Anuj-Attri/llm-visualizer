/**
 * Tokenization & Embedding: token pills (black border, white fill) + 8-block slice, staggered animation.
 */

import { useMemo } from 'react';
import { useStore } from '../store/useStore';

function seededValues(token, count = 8) {
  let h = 0;
  for (let i = 0; i < token.length; i++) h = (h << 5) - h + token.charCodeAt(i);
  h = (h >>> 0) % 2147483647;
  const out = [];
  for (let i = 0; i < count; i++) {
    h = (h * 16807) % 2147483647;
    out.push((h / 2147483647) * 2 - 1);
  }
  return out;
}

export default function TokenEmbeddings() {
  const modelOutput = useStore((s) => s.modelOutput);

  const tokensWithEmbedding = useMemo(() => {
    if (!modelOutput?.tokens?.length) return [];
    return modelOutput.tokens.map((token) => ({
      token,
      values: seededValues(token, 8),
    }));
  }, [modelOutput?.tokens]);

  if (!modelOutput?.tokens?.length) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Tokenization & Embedding</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">Run the model to see tokens.</p>
      </div>
    );
  }

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Tokenization & Embedding</h3>
      <div className="mt-3 flex flex-wrap gap-4">
        {tokensWithEmbedding.map(({ token, values }, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1"
            style={{
              animation: 'embedFill 0.2s ease-out forwards',
              animationDelay: `${i * 200}ms`,
              opacity: 0,
            }}
          >
            <span className="rounded-none border border-[#0A0A0A] bg-[#FFFFFF] px-2 py-1 font-mono text-xs text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FFFFFF]">
              {token}
            </span>
            <div className="flex gap-0.5">
              {values.map((v, j) => {
                const t = (v + 1) / 2;
                const gray = Math.round(30 + t * 180);
                return (
                  <div
                    key={j}
                    className="h-4 w-2 transition-all duration-200"
                    style={{
                      backgroundColor: `rgb(${gray},${gray},${gray})`,
                      animation: 'embedFill 0.2s ease-out forwards',
                      animationDelay: `${i * 200 + j * 25}ms`,
                      opacity: 0,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-xs text-[#6B6B6B]">Each token is mapped to a 768-dimensional vector.</p>
    </div>
  );
}
