/**
 * Placeholder for Phase 2. D3 heatmap: rows = query tokens, cols = key tokens.
 * Reads: store.modelOutput.attentionWeights, currentLayer, currentHead.
 */

export default function AttentionHeatmap() {
  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Attention Heatmap</h3>
      <p className="mt-2 text-xs text-gray-500">Run the model to see attention.</p>
    </div>
  );
}
