/**
 * Tokenization & Embedding: real BPE token pills with token ID below. Token/character stats.
 */

import { useStore } from '../store/useStore';

export default function TokenEmbeddings() {
  const modelOutput = useStore((s) => s.modelOutput);
  const inputText = useStore((s) => s.inputText);

  if (!modelOutput?.tokens?.length) {
    return (
      <div className="panel p-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Tokenization & Embedding</h3>
        <p className="mt-2 text-xs text-[#6B6B6B]">Run the model to see tokens.</p>
      </div>
    );
  }

  const tokens = modelOutput.tokens;
  const tokenIds = modelOutput.tokenIds ?? tokens.map((_, i) => i);
  const charCount = (inputText || '').length;
  const tokenCount = tokens.length;
  const ratio = tokenCount > 0 ? (charCount / tokenCount).toFixed(1) : '—';

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">Tokenization & Embedding</h3>
      <p className="mt-2 font-mono text-xs text-[#6B6B6B]">
        {tokenCount} tokens from {charCount} characters (ratio: {ratio} chars/token)
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {tokens.map((token, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="rounded-none border border-[#0A0A0A] bg-[#FFFFFF] px-2 py-1 font-mono text-xs text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FFFFFF]">
              {token}
            </span>
            <span className="font-mono text-[10px] text-[#6B6B6B]">{tokenIds[i]}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#6B6B6B]">
        GPT-2 uses Byte-Pair Encoding (BPE). Words are split into subword units — &quot;running&quot; might become [&quot;run&quot;, &quot;ning&quot;].
      </p>
    </div>
  );
}
