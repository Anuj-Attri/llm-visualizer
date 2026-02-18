/**
 * Range slider for top-p (0–1). Writes to Zustand store.
 * Used by LogitBar to draw the cutoff line for nucleus sampling.
 */

import { useStore } from '../store/useStore';

const MIN = 0;
const MAX = 1;
const STEP = 0.05;

export default function TopPSlider() {
  const topP = useStore((s) => s.topP);
  const setTopP = useStore((s) => s.setTopP);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="top-p" className="text-sm font-medium text-gray-700">
        Top-p: {Number(topP).toFixed(2)}
      </label>
      <input
        id="top-p"
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={topP}
        onChange={(e) => setTopP(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
      />
    </div>
  );
}
