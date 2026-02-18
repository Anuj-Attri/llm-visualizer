/**
 * Range slider for top-p (0–1). Writes to Zustand store.
 * Used by LogitBar to draw the cutoff line for nucleus sampling.
 */

import { useStore } from '../store/useStore';

const MIN = 0;
const MAX = 1;
const STEP = 0.05;

export default function TopPSlider({ noLabel = false }) {
  const topP = useStore((s) => s.topP);
  const setTopP = useStore((s) => s.setTopP);

  return (
    <div className="flex flex-col gap-1">
      {!noLabel && (
        <label htmlFor="top-p" className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">
          Top-p: {Number(topP).toFixed(2)}
        </label>
      )}
      <input
        id="top-p"
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={topP}
        onChange={(e) => setTopP(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none bg-[#F5F5F5]"
        style={{ accentColor: '#0A0A0A' }}
      />
    </div>
  );
}
