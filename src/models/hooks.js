/**
 * Utility functions to format and intercept model internals for visualization.
 * Used by gpt2.js and visualizers.
 */

/**
 * Convert raw logits to probabilities via softmax with temperature.
 * @param {Float32Array | number[]} logits - Raw logit values
 * @param {number} temperature - Sampling temperature
 * @returns {{ probs: number[], tokenIds: number[] }} Sorted by probability descending
 */
export function softmaxWithTemperature(logits, temperature = 1.0) {
  const T = Math.max(1e-8, temperature);
  const scaled = Array.from(logits).map((x) => x / T);
  const max = Math.max(...scaled);
  const exp = scaled.map((x) => Math.exp(x - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  const probs = exp.map((p) => p / sum);
  const tokenIds = probs.map((_, i) => i);
  const pairs = tokenIds.map((id, i) => ({ id, prob: probs[i] }));
  pairs.sort((a, b) => b.prob - a.prob);
  return {
    probs: pairs.map((p) => p.prob),
    tokenIds: pairs.map((p) => p.id),
  };
}

/**
 * Stable color from string (for token pills).
 * @param {string} str
 * @returns {string} Hex color
 */
export function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  const hue = ((h >>> 0) % 360 + 360) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}
