/**
 * Range slider for temperature (0.1–2.0). Writes to Zustand store.
 * Used by LogitBar to recompute softmax without re-running the model.
 */

import { useStore } from '../store/useStore';

const MIN = 0.1;
const MAX = 2.0;
const STEP = 0.05;

export default function TemperatureSlider() {
  const temperature = useStore((s) => s.temperature);
  const setTemperature = useStore((s) => s.setTemperature);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="temperature" className="text-sm font-medium text-gray-700">
        Temperature: {Number(temperature).toFixed(2)}
      </label>
      <input
        id="temperature"
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={temperature}
        onChange={(e) => setTemperature(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
      />
    </div>
  );
}
