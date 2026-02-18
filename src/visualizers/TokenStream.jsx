/**
 * Renders tokenized input as colored pills with index below. Reads from store.modelOutput.tokens.
 */

import { useStore } from '../store/useStore';
import { hashColor } from '../models/hooks';

export default function TokenStream() {
  const modelOutput = useStore((s) => s.modelOutput);

  if (!modelOutput?.tokens?.length) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Token Stream</h3>
        <p className="mt-2 text-xs text-gray-500">Run the model to see tokens.</p>
      </div>
    );
  }

  const tokens = modelOutput.tokens;

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Token Stream</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {tokens.map((token, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span
              className="rounded-full px-2 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: hashColor(token) }}
            >
              {token}
            </span>
            <span className="text-[10px] text-gray-500">{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
