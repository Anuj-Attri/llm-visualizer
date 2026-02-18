import { env } from '@xenova/transformers';
env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * Loads GPT-2 (distilgpt2) via @xenova/transformers, runs a single forward pass,
 * and returns tokens, attention weights per layer/head, hidden states, and logits.
 * Models load lazily on first run.
 */

import { AutoModelForCausalLM, AutoTokenizer } from '@xenova/transformers';

let cachedModel = null;
let cachedTokenizer = null;

/**
 * Run one forward pass of DistilGPT-2 on the given text.
 * Returns decoded tokens and all intermediate activations needed for visualizers.
 *
 * @param {string} inputText - Raw input sentence
 * @returns {Promise<{ tokens: string[], attentionWeights: number[][][][], hiddenStates: number[][][], logits: number[][] }>}
 */
export async function runGPT2(inputText) {
  if (!inputText?.trim()) {
    throw new Error('Input text is required');
  }

  if (!cachedTokenizer) {
    cachedTokenizer = await AutoTokenizer.from_pretrained('Xenova/distilgpt2');
  }
  if (!cachedModel) {
    cachedModel = await AutoModelForCausalLM.from_pretrained('Xenova/distilgpt2', {
      output_attentions: true,
      output_hidden_states: true,
    });
  }

  const inputs = await cachedTokenizer(inputText.trim(), {
    padding: false,
    truncation: false,
    return_tensors: true,
  });

  const outputs = await cachedModel(inputs, {
    output_attentions: true,
    output_hidden_states: true,
  });

  const tokenIds = Array.from(inputs.input_ids.data);
  const tokens = tokenIds.map((id) => {
    const decoded = cachedTokenizer.decode([id], { skip_special_tokens: false });
    return decoded || `[${id}]`;
  });

  const attentionWeights = [];
  if (outputs.attentions && outputs.attentions.length > 0) {
    for (const att of outputs.attentions) {
      const [batch, heads, seq, seqK] = att.dims;
      const layerHeads = [];
      for (let h = 0; h < heads; h++) {
        const headWeights = [];
        for (let q = 0; q < seq; q++) {
          const row = [];
          for (let k = 0; k < seqK; k++) {
            const idx = batch * heads * seq * seqK + h * seq * seqK + q * seqK + k;
            row.push(att.data[idx]);
          }
          headWeights.push(row);
        }
        layerHeads.push(headWeights);
      }
      attentionWeights.push(layerHeads);
    }
  }

  const hiddenStates = [];
  if (outputs.hidden_states && outputs.hidden_states.length > 0) {
    for (const hs of outputs.hidden_states) {
      const [batch, seq, dim] = hs.dims;
      const layer = [];
      for (let s = 0; s < seq; s++) {
        const vec = [];
        for (let d = 0; d < dim; d++) {
          vec.push(hs.data[batch * seq * dim + s * dim + d]);
        }
        layer.push(vec);
      }
      hiddenStates.push(layer);
    }
  }

  const logitsTensor = outputs.logits;
  const [batch, seqLen, vocabSize] = logitsTensor.dims;
  const logits = [];
  for (let s = 0; s < seqLen; s++) {
    const row = [];
    for (let v = 0; v < vocabSize; v++) {
      row.push(logitsTensor.data[batch * seqLen * vocabSize + s * vocabSize + v]);
    }
    logits.push(row);
  }

  return {
    tokens,
    attentionWeights,
    hiddenStates,
    logits,
  };
}
