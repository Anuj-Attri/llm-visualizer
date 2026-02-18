/**
 * Utility functions to format and intercept model internals for visualization.
 * Used by gpt2.js and visualizers.
 */

/**
 * Convert raw logits to probabilities via softmax with temperature.
 * Iterative (non-recursive) to handle large vocabularies without stack overflow.
 * @param {Float32Array | number[]} logits - Raw logit values
 * @param {number} temperature - Sampling temperature
 * @returns {{ probs: number[], tokenIds: number[] }} Sorted by probability descending
 */
export function softmaxWithTemperature(logits, temperature = 1.0) {
  const scaled = logits.map((x) => x / Math.max(temperature, 0.01));
  const maxVal = Math.max(...scaled.slice(0, Math.min(scaled.length, 100000)));
  let sum = 0;
  const exps = new Float32Array(scaled.length);
  for (let i = 0; i < scaled.length; i++) {
    exps[i] = Math.exp(scaled[i] - maxVal);
    sum += exps[i];
  }
  const result = new Array(scaled.length);
  for (let i = 0; i < scaled.length; i++) {
    result[i] = exps[i] / sum;
  }
  const indices = new Array(scaled.length);
  for (let i = 0; i < scaled.length; i++) indices[i] = i;
  indices.sort((a, b) => result[b] - result[a]);
  return {
    probs: indices.map((i) => result[i]),
    tokenIds: indices,
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
