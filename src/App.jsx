/**
 * Root layout: left panel = controls, right panel = visualizers.
 * Run Model loads GPT-2 (lazy), runs forward pass, and saves result to the store.
 */

import { useCallback } from 'react';
import { useStore } from './store/useStore';
import { runGPT2 } from './models/gpt2';
import PresetSelector from './controls/PresetSelector';
import TemperatureSlider from './controls/TemperatureSlider';
import TopPSlider from './controls/TopPSlider';
import TokenStream from './visualizers/TokenStream';
import AttentionHeatmap from './visualizers/AttentionHeatmap';
import LogitBar from './visualizers/LogitBar';
import NextTokenPicker from './visualizers/NextTokenPicker';
import ResidualStream from './visualizers/ResidualStream';

const DISTILGPT2_LAYERS = 6;
const DISTILGPT2_HEADS = 12;

export default function App() {
  const inputText = useStore((s) => s.inputText);
  const setInputText = useStore((s) => s.setInputText);
  const setModelOutput = useStore((s) => s.setModelOutput);
  const isLoading = useStore((s) => s.isLoading);
  const setIsLoading = useStore((s) => s.setIsLoading);
  const currentLayer = useStore((s) => s.currentLayer);
  const setCurrentLayer = useStore((s) => s.setCurrentLayer);
  const currentHead = useStore((s) => s.currentHead);
  const setCurrentHead = useStore((s) => s.setCurrentHead);

  const onRunModel = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const result = await runGPT2(inputText);
      console.log('RESULT:', {
        tokens: result.tokens,
        attentionWeights: result.attentionWeights?.length,
        hiddenStates: result.hiddenStates?.length,
        logits: result.logits?.length,
      });
      setModelOutput(result);
    } catch (err) {
      console.error('Run model failed:', err);
      setModelOutput(null);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, setModelOutput, setIsLoading]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left panel: controls */}
      <aside className="flex w-80 flex-col gap-4 border-r border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">LLM Visualizer</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="input-text" className="text-sm font-medium text-gray-700">
            Input text
          </label>
          <textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or pick a preset…"
            rows={3}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <PresetSelector />
        <TemperatureSlider />
        <TopPSlider />

        <div className="flex flex-col gap-2">
          <label htmlFor="layer" className="text-sm font-medium text-gray-700">
            Layer (0–{DISTILGPT2_LAYERS - 1})
          </label>
          <input
            id="layer"
            type="number"
            min={0}
            max={DISTILGPT2_LAYERS - 1}
            value={currentLayer}
            onChange={(e) => setCurrentLayer(Number(e.target.value) || 0)}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="head" className="text-sm font-medium text-gray-700">
            Head (0–{DISTILGPT2_HEADS - 1})
          </label>
          <input
            id="head"
            type="number"
            min={0}
            max={DISTILGPT2_HEADS - 1}
            value={currentHead}
            onChange={(e) => setCurrentHead(Number(e.target.value) || 0)}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={onRunModel}
          disabled={isLoading || !inputText.trim()}
          className="mt-2 rounded bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Loading…' : 'Run Model'}
        </button>
      </aside>

      {/* Right panel: visualizers */}
      <main className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TokenStream />
          <AttentionHeatmap />
          <LogitBar />
          <NextTokenPicker />
          <ResidualStream />
        </div>
      </main>
    </div>
  );
}
