// @ts-nocheck
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.remoteHost = 'https://huggingface.co';
env.remotePathTemplate = '{model}/resolve/{revision}/';

console.log('ENV CHECK:', env.allowLocalModels, env.remoteHost);

let pipelineInstance = null;

export async function runGPT2(inputText) {
  if (!inputText?.trim()) throw new Error('Input text is required');

  if (!pipelineInstance) {
    console.log('Loading pipeline...');
    pipelineInstance = await pipeline(
      'text-generation',
      'Xenova/distilgpt2',
      { revision: 'main' }
    );
    console.log('Pipeline loaded!');
  }

  const tokenizer = pipelineInstance.tokenizer;
  const model = pipelineInstance.model;

  const inputs = tokenizer(inputText.trim(), { return_tensors: 'pt' });
  const tokenIds = Array.from(inputs.input_ids.data);
  const tokens = tokenIds.map((id) =>
    tokenizer.decode([id], { skip_special_tokens: false }) || `[${id}]`
  );

  const outputs = await model(inputs, {
    output_attentions: true,
    output_hidden_states: true,
  });

  console.log('RAW MODEL OUTPUT KEYS:', Object.keys(outputs));

  const attentionWeights = extractAttentions(outputs.attentions);
  const hiddenStates = extractHiddenStates(outputs.hidden_states);
  const logits = extractLogits(outputs.logits);

  return { tokens, attentionWeights, hiddenStates, logits };
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
