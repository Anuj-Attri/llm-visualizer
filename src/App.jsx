/**
 * Root layout: left panel = controls, right = NextTokenPicker full width + 2×2 visualization grid.
 */

import { useCallback } from 'react';
import { useStore } from './store/useStore';
import { runGPT2 } from './models/gpt2';
import PresetSelector from './controls/PresetSelector';
import TemperatureSlider from './controls/TemperatureSlider';
import TopPSlider from './controls/TopPSlider';
import ParamTooltip from './controls/ParamTooltip';
import NextTokenPicker from './visualizers/NextTokenPicker';
import TokenEmbeddings from './visualizers/TokenEmbeddings';
import AttentionFlow from './visualizers/AttentionFlow';
import LayerByLayerPrediction from './visualizers/LayerByLayerPrediction';
import TemperatureExplorer from './visualizers/TemperatureExplorer';

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
  const temperature = useStore((s) => s.temperature);
  const topP = useStore((s) => s.topP);

  const onRunModel = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const result = await runGPT2(inputText);
      setModelOutput(result);
    } catch (err) {
      console.error('Run model failed:', err);
      setModelOutput(null);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, setModelOutput, setIsLoading]);

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-[#0A0A0A]">
      <aside className="flex w-80 flex-col gap-4 border-r border-[#E0E0E0] bg-[#FFFFFF] p-4" style={{ borderRightWidth: '1px' }}>
        <h1 className="text-lg font-bold uppercase tracking-widest text-[#0A0A0A]">LLM Visualizer</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="input-text" className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">
            Input text
          </label>
          <textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or pick a preset…"
            rows={3}
            className="border border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2 text-sm font-mono text-[#0A0A0A] placeholder-[#6B6B6B] focus:border-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            style={{ borderRadius: '2px' }}
          />
        </div>

        <PresetSelector />

        <ParamTooltip
          id="temperature"
          label={`Temperature: ${Number(temperature).toFixed(2)}`}
          tooltip="Controls randomness. Higher = more creative/random, Lower = more focused/repetitive"
        >
          <TemperatureSlider noLabel />
        </ParamTooltip>

        <ParamTooltip
          id="top-p"
          label={`Top-p: ${Number(topP).toFixed(2)}`}
          tooltip="Nucleus sampling. Only considers tokens whose combined probability reaches this threshold"
        >
          <TopPSlider noLabel />
        </ParamTooltip>

        <ParamTooltip
          id="layer"
          label={`Layer (0–${DISTILGPT2_LAYERS - 1})`}
          tooltip="Which of the 6 transformer layers to inspect. Earlier layers capture syntax, later layers capture meaning"
        >
          <input
            id="layer"
            type="number"
            min={0}
            max={DISTILGPT2_LAYERS - 1}
            value={currentLayer}
            onChange={(e) => setCurrentLayer(Number(e.target.value) || 0)}
            className="w-full border border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2 text-sm font-mono text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            style={{ borderRadius: '2px' }}
          />
        </ParamTooltip>

        <ParamTooltip
          id="head"
          label={`Head (0–${DISTILGPT2_HEADS - 1})`}
          tooltip="Which of the 12 attention heads to inspect. Each head learns to attend to different relationships"
        >
          <input
            id="head"
            type="number"
            min={0}
            max={DISTILGPT2_HEADS - 1}
            value={currentHead}
            onChange={(e) => setCurrentHead(Number(e.target.value) || 0)}
            className="w-full border border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2 text-sm font-mono text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            style={{ borderRadius: '2px' }}
          />
        </ParamTooltip>

        <button
          type="button"
          onClick={onRunModel}
          disabled={isLoading || !inputText.trim()}
          className="mt-2 bg-[#0A0A0A] px-4 py-2 font-medium uppercase tracking-widest text-white hover:bg-[#0A0A0A]/90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderRadius: '0' }}
        >
          {isLoading ? 'Loading…' : 'Run Model'}
        </button>
      </aside>

      <main className="flex flex-1 flex-col overflow-auto bg-[#FAFAFA] p-6">
        <div className="w-full">
          <NextTokenPicker />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <TokenEmbeddings />
          <AttentionFlow />
          <LayerByLayerPrediction />
          <TemperatureExplorer />
        </div>
      </main>
    </div>
  );
}
