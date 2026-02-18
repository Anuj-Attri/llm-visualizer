# LLM / VLM Visualizer

In-browser transformer visualizer with live inference (GPT-2 via Transformers.js). View attention heatmaps, token probabilities, and residual stream with interactive temperature and top-p controls.

## Tech stack

- React + Vite
- **@xenova/transformers** – in-browser GPT-2 (DistilGPT-2)
- D3.js – SVG visualizations
- Framer Motion – transitions
- Zustand – global state
- Tailwind CSS – styling

No backend; everything runs in the browser.

## Setup

```bash
cd llm-visualizer
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Type or pick a preset, then click **Run Model**. The model loads on first run (lazy).

## Phase 1 (current)

- Two-panel layout: controls (left), visualizers (right)
- Preset selector, temperature and top-p sliders, layer/head selectors
- Run Model runs DistilGPT-2 and stores tokens, attention weights, hidden states, and logits
- Placeholder panels for Token Stream, Attention Heatmap, Logit Bar, FFN Block, Residual Stream

## Scripts

- `npm run dev` – dev server
- `npm run build` – production build
- `npm run lint` – ESLint
