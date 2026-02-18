// @ts-nocheck
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = false; // temporarily false to avoid loading cached old model

let pipelineInstance = null;

export async function runGPT2(inputText) {
  if (!inputText?.trim()) throw new Error('Input text is required');

  if (!pipelineInstance) {
    pipelineInstance = await pipeline(
      'text-generation',
      'onnx-community/Qwen2.5-0.5B-Instruct',
      {
        dtype: 'q4',
        progress_callback: (progress) => console.log('Loading:', progress)
      }
    );
  }

  const tokenizer = pipelineInstance.tokenizer;
  const model = pipelineInstance.model;

  const inputs = tokenizer(inputText.trim(), { return_tensors: 'pt' });
  const tokenIds = Array.from(inputs.input_ids.data);
  const tokens = tokenIds.map((id) =>
    tokenizer.decode([id], { skip_special_tokens: false }) || `[${id}]`
  );

  const outputs = await model(inputs);

  const logits = extractLogits(outputs.logits);
  applyRepetitionPenalty(logits, tokenIds, 1.3, 3);

  return {
    tokens,
    tokenIds,
    logits,
  };
}

/**
 * Penalize last-position logits: divide by penalty for tokens in the last 8;
 * set -Infinity for token ids that would complete a repeated trigram.
 */
function applyRepetitionPenalty(logits, tokenIds, penalty, ngramSize) {
  if (!logits?.length || !tokenIds?.length) return;
  const lastRow = logits[logits.length - 1];
  const vocabSize = lastRow.length;

  const last8 = tokenIds.slice(-8);
  for (const id of last8) {
    if (id >= 0 && id < vocabSize) lastRow[id] /= penalty;
  }

  if (tokenIds.length < ngramSize) return;
  const trigrams = new Set();
  for (let i = 0; i <= tokenIds.length - ngramSize; i++) {
    const key = tokenIds.slice(i, i + ngramSize).join(',');
    trigrams.add(key);
  }
  const lastNgramMinusOne = tokenIds.slice(-(ngramSize - 1));
  for (let x = 0; x < vocabSize; x++) {
    const key = [...lastNgramMinusOne, x].join(',');
    if (trigrams.has(key)) lastRow[x] = -Infinity;
  }
}

function extractLogits(logitsTensor) {
  if (!logitsTensor) return [];
  const [, seqLen, vocabSize] = logitsTensor.dims;
  return Array.from({ length: seqLen }, (_, s) =>
    Array.from({ length: vocabSize }, (_, v) =>
      logitsTensor.data[s * vocabSize + v]
    )
  );
}

export function getTokenizer() {
  return pipelineInstance?.tokenizer ?? null;
}
