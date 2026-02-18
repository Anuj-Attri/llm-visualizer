/**
 * Dropdown of preset input sentences. On select, updates inputText in the store.
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
      <label htmlFor="preset" className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">
        Preset
      </label>
      <select
        id="preset"
        value={PRESETS.includes(inputText) ? inputText : ''}
        onChange={handleChange}
        className="border border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
        style={{ borderRadius: '2px' }}
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
