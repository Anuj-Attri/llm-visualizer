import { create } from 'zustand';

/**
 * Global Zustand store for the LLM Visualizer.
 * Holds input, sampling params, and model output.
 * modelOutput shape: { tokens, tokenIds, logits, attentions? } — attentions may be null for quantized exports.
 */
export const useStore = create((set) => ({
  inputText: '',
  temperature: 1.0,
  topP: 0.9,
  modelOutput: null,
  isLoading: false,

  setInputText: (inputText) => set({ inputText }),
  setTemperature: (temperature) => set({ temperature }),
  setTopP: (topP) => set({ topP }),
  setModelOutput: (modelOutput) => set({ modelOutput }),
  setIsLoading: (isLoading) => set({ isLoading }),

  appendToken: (token) => set((state) => ({
    inputText: state.inputText + token,
  })),
}));
