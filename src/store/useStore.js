import { create } from 'zustand';

/**
 * Global Zustand store for the LLM Visualizer.
 * Holds input, sampling params, current view indices, and model output.
 */
export const useStore = create((set) => ({
  inputText: '',
  temperature: 1.0,
  topP: 0.9,
  currentLayer: 0,
  currentHead: 0,
  modelOutput: null,
  isLoading: false,

  setInputText: (inputText) => set({ inputText }),
  setTemperature: (temperature) => set({ temperature }),
  setTopP: (topP) => set({ topP }),
  setCurrentLayer: (currentLayer) => set({ currentLayer }),
  setCurrentHead: (currentHead) => set({ currentHead }),
  setModelOutput: (modelOutput) => set({ modelOutput }),
  setIsLoading: (isLoading) => set({ isLoading }),

  appendToken: (token) => set((state) => ({
    inputText: state.inputText + token,
  })),
}));
