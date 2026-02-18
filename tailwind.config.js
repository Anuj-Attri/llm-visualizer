/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        inkSecondary: '#6B6B6B',
        border: '#E0E0E0',
        hover: '#F5F5F5',
      },
      borderRadius: {
        panel: '2px',
      },
    },
  },
  plugins: [],
};
