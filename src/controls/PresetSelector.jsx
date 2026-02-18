/**
 * Dropdown of preset input sentences. On select, updates inputText in the store.
 * Reads and writes: useStore.inputText, setInputText.
 */

import { useStore } from '../store/useStore';

const PRESETS = [
  'Once upon a time',
  'The capital of France is',
  'In a galaxy far away',
  'To be or not to be',
  'The meaning of life is',
];

export default function PresetSelector() {
  const inputText = useStore((s) => s.inputText);
  const setInputText = useStore((s) => s.setInputText);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value) setInputText(value);
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="preset" className="text-sm font-medium text-gray-700">
        Preset
      </label>
      <select
        id="preset"
        value={PRESETS.includes(inputText) ? inputText : ''}
        onChange={handleChange}
        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Choose a preset…</option>
        {PRESETS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
