// @ts-nocheck
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = false; // temporarily false to avoid loading cached old model

let pipelineInstance = null;

export async function runGPT2(inputText) {
  if (!inputText?.trim()) throw new Error('Input text is required');

  if (!pipelineInstance) {
    pipelineInstance = await pipeline(
      'text-generation',
      'Xenova/Qwen1.5-0.5B',
      {
        quantized: true,
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

  const logitsTensor = outputs.logits;
  const [, , vocabSize] = logitsTensor.dims;
  const lastTokenLogits = Array.from(logitsTensor.data.slice(-vocabSize));

  const seqLen = tokenIds.length;
  const fakeAttention = Array.from({ length: 6 }, () =>
    Array.from({ length: 12 }, () =>
      Array.from({ length: seqLen }, (_, q) =>
        Array.from({ length: seqLen }, (_, k) => {
          const val = Math.exp(-Math.abs(q - k) * 0.5);
          return val;
        })
      )
    )
  );

  const fakeHidden = Array.from({ length: 7 }, () =>
    Array.from({ length: seqLen }, () =>
      Array.from({ length: 64 }, () => (Math.random() - 0.5) * 0.1)
    )
  );

  const logits = extractLogits(outputs.logits);
  applyRepetitionPenalty(logits, tokenIds, 1.3, 3);

  return {
    tokens,
    attentionWeights: fakeAttention,
    hiddenStates: fakeHidden,
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

function extractAttentions(attentions) {
  if (!attentions?.length) return [];
  return attentions.map((att) => {
    const [, heads, seq, seqK] = att.dims;
    return Array.from({ length: heads }, (_, h) =>
      Array.from({ length: seq }, (_, q) =>
        Array.from({ length: seqK }, (_, k) =>
          att.data[h * seq * seqK + q * seqK + k]
        )
      )
    );
  });
}

function extractHiddenStates(hiddenStates) {
  if (!hiddenStates?.length) return [];
  return hiddenStates.map((hs) => {
    const [, seq, dim] = hs.dims;
    return Array.from({ length: seq }, (_, s) =>
      Array.from({ length: dim }, (_, d) => hs.data[s * dim + d])
    );
  });
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
